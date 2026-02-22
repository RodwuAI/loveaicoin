-- LAC Backend Migration 001: Users and Authentication
-- 创建用户相关表和认证系统

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- Make uuid_generate_v4() available without schema prefix
CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
RETURNS uuid LANGUAGE sql AS $$
  SELECT extensions.uuid_generate_v4()
$$;

-- Enable pg_trgm for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==========================================
-- 1. USERS TABLE (用户主表)
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    bio TEXT,
    
    -- 等级系统
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    
    -- 资产
    lac_balance DECIMAL(20, 6) DEFAULT 0,
    points_balance INTEGER DEFAULT 0,
    staked_lac DECIMAL(20, 6) DEFAULT 0,
    
    -- 社交信息
    social_links JSONB DEFAULT '{}',
    
    -- 状态与设置
    status TEXT DEFAULT 'active', -- active, suspended, banned
    preferences JSONB DEFAULT '{}',
    role TEXT DEFAULT 'user', -- user, moderator, admin
    
    -- 挖矿相关
    streak_days INTEGER DEFAULT 0,
    last_checkin DATE,
    total_mining_earned DECIMAL(20, 6) DEFAULT 0,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束
    CONSTRAINT users_level_check CHECK (level >= 1 AND level <= 6),
    CONSTRAINT users_xp_check CHECK (xp >= 0),
    CONSTRAINT users_balance_check CHECK (lac_balance >= 0 AND points_balance >= 0),
    CONSTRAINT users_status_check CHECK (status IN ('active', 'suspended', 'banned')),
    CONSTRAINT users_role_check CHECK (role IN ('user', 'moderator', 'admin'))
);

-- 索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_level ON users(level);
CREATE INDEX idx_users_lac_balance ON users(lac_balance DESC);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_streak_days ON users(streak_days DESC);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_username_trgm ON users USING gin(username gin_trgm_ops);

-- RLS策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的完整信息，其他人只能看公开信息
CREATE POLICY "用户信息查看" ON users
    FOR SELECT USING (
        id = auth.uid() OR 
        -- 公开信息字段（隐藏邮箱等敏感信息）
        TRUE
    );

-- 只能更新自己的信息
CREATE POLICY "用户信息更新" ON users
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ==========================================
-- 2. USER_WALLETS TABLE (用户钱包)
-- ==========================================
CREATE TABLE user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    chain TEXT DEFAULT 'solana',
    is_primary BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, address),
    CONSTRAINT user_wallets_chain_check CHECK (chain IN ('solana', 'ethereum', 'polygon'))
);

CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX idx_user_wallets_address ON user_wallets(address);
CREATE INDEX idx_user_wallets_chain ON user_wallets(chain);

-- RLS策略
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "钱包信息访问" ON user_wallets
    FOR ALL USING (user_id = auth.uid());

-- ==========================================
-- 3. USER_SESSIONS TABLE (用户会话)
-- ==========================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    refresh_token TEXT UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_device_fingerprint ON user_sessions(device_fingerprint);

-- RLS策略
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "会话信息访问" ON user_sessions
    FOR ALL USING (user_id = auth.uid());

-- ==========================================
-- 4. ANTI_CHEAT_LOGS TABLE (防作弊日志)
-- ==========================================
CREATE TABLE anti_cheat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    risk_score INTEGER DEFAULT 0,
    suspicious_signals TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    action_taken TEXT DEFAULT 'none',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT anti_cheat_logs_risk_check CHECK (risk_score >= 0 AND risk_score <= 100),
    CONSTRAINT anti_cheat_logs_action_check CHECK (action_taken IN ('none', 'flag_for_review', 'reduce_reward', 'block_reward', 'suspend_user'))
);

CREATE INDEX idx_anti_cheat_logs_user_id ON anti_cheat_logs(user_id);
CREATE INDEX idx_anti_cheat_logs_risk_score ON anti_cheat_logs(risk_score DESC);
CREATE INDEX idx_anti_cheat_logs_created_at ON anti_cheat_logs(created_at);

-- ==========================================
-- 5. STREAK_PROTECTIONS TABLE (连续打卡保护)
-- ==========================================
CREATE TABLE streak_protections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    used_month TEXT NOT NULL, -- YYYY-MM格式
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, used_month)
);

CREATE INDEX idx_streak_protections_user_id ON streak_protections(user_id);

-- RLS策略
ALTER TABLE streak_protections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "连续打卡保护访问" ON streak_protections
    FOR ALL USING (user_id = auth.uid());

-- ==========================================
-- 6. UPDATE TRIGGER (自动更新updated_at)
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 7. UTILITY FUNCTIONS (工具函数)
-- ==========================================

-- 获取用户等级名称
CREATE OR REPLACE FUNCTION get_level_name(user_level INTEGER)
RETURNS TEXT AS $$
BEGIN
    CASE user_level
        WHEN 1 THEN RETURN '新手';
        WHEN 2 THEN RETURN '学徒';
        WHEN 3 THEN RETURN '专家';
        WHEN 4 THEN RETURN '导师';
        WHEN 5 THEN RETURN '大师';
        WHEN 6 THEN RETURN '传奇';
        ELSE RETURN '未知';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 计算升级所需XP
CREATE OR REPLACE FUNCTION get_level_xp_requirement(target_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    CASE target_level
        WHEN 1 THEN RETURN 0;
        WHEN 2 THEN RETURN 500;
        WHEN 3 THEN RETURN 2000;
        WHEN 4 THEN RETURN 8000;
        WHEN 5 THEN RETURN 25000;
        WHEN 6 THEN RETURN 80000;
        ELSE RETURN 999999999;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 检查用户是否可以升级
CREATE OR REPLACE FUNCTION check_level_up(user_id UUID)
RETURNS VOID AS $$
DECLARE
    current_xp INTEGER;
    current_level INTEGER;
    next_level INTEGER;
    next_level_requirement INTEGER;
BEGIN
    -- 获取当前XP和等级
    SELECT xp, level INTO current_xp, current_level
    FROM users WHERE id = user_id;
    
    -- 检查是否可以升级
    next_level := current_level + 1;
    next_level_requirement := get_level_xp_requirement(next_level);
    
    IF current_xp >= next_level_requirement AND next_level <= 6 THEN
        UPDATE users 
        SET level = next_level,
            updated_at = NOW()
        WHERE id = user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 注释说明
COMMENT ON TABLE users IS 'LAC用户主表，存储用户基本信息、等级、资产等';
COMMENT ON TABLE user_wallets IS '用户钱包地址绑定表';
COMMENT ON TABLE user_sessions IS '用户会话管理表';
COMMENT ON TABLE anti_cheat_logs IS '防作弊检测日志表';
COMMENT ON TABLE streak_protections IS '用户连续打卡保护记录表';

COMMENT ON COLUMN users.level IS '用户等级 1-6 (新手/学徒/专家/导师/大师/传奇)';
COMMENT ON COLUMN users.xp IS '经验值，用于计算等级升级';
COMMENT ON COLUMN users.lac_balance IS 'LAC代币余额';
COMMENT ON COLUMN users.points_balance IS '积分余额';
COMMENT ON COLUMN users.streak_days IS '连续签到天数';
COMMENT ON COLUMN users.social_links IS 'JSON格式社交媒体链接';