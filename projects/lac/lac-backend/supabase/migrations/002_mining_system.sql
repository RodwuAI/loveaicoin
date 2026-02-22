-- LAC Backend Migration 002: Mining System
-- 创建四维挖矿系统相关表

-- ==========================================
-- 1. MINING_RECORDS TABLE (挖矿记录)
-- ==========================================
CREATE TABLE mining_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 挖矿类型和来源
    mining_type TEXT NOT NULL, -- learn, use, teach, create
    action TEXT NOT NULL, -- complete_lesson, use_tool, publish_content, sell_item
    source_id UUID NOT NULL, -- 关联的课程/工具/内容/商品ID
    source_type TEXT NOT NULL, -- course, lesson, ai_tool, content, market_item
    
    -- 奖励计算
    points_earned INTEGER DEFAULT 0,
    lac_earned DECIMAL(20, 6) DEFAULT 0,
    base_amount DECIMAL(20, 6) NOT NULL,
    multiplier DECIMAL(4,2) DEFAULT 1.0,
    
    -- 详细元数据
    metadata JSONB DEFAULT '{}', -- 存储具体参数(难度、质量、时长等)
    calculation_details JSONB DEFAULT '{}', -- 存储计算过程
    
    -- 状态和时间
    status TEXT DEFAULT 'completed', -- completed, pending, cancelled
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束
    CONSTRAINT mining_records_type_check CHECK (mining_type IN ('learn', 'use', 'teach', 'create')),
    CONSTRAINT mining_records_status_check CHECK (status IN ('completed', 'pending', 'cancelled')),
    CONSTRAINT mining_records_amounts_check CHECK (points_earned >= 0 AND lac_earned >= 0)
);

CREATE INDEX idx_mining_records_user_id ON mining_records(user_id);
CREATE INDEX idx_mining_records_type ON mining_records(mining_type);
CREATE INDEX idx_mining_records_created_at ON mining_records(created_at DESC);
CREATE INDEX idx_mining_records_user_time ON mining_records(user_id, created_at DESC);
CREATE INDEX idx_mining_records_source ON mining_records(source_type, source_id);

-- RLS策略
ALTER TABLE mining_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "挖矿记录访问" ON mining_records
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "挖矿记录插入" ON mining_records
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ==========================================
-- 2. DAILY_MINING_STATS TABLE (每日挖矿统计)
-- ==========================================
CREATE TABLE daily_mining_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- 各维度统计
    learn_rewards DECIMAL(20, 6) DEFAULT 0,
    use_rewards DECIMAL(20, 6) DEFAULT 0,
    teach_rewards DECIMAL(20, 6) DEFAULT 0,
    create_rewards DECIMAL(20, 6) DEFAULT 0,
    quest_rewards DECIMAL(20, 6) DEFAULT 0,
    
    total_rewards DECIMAL(20, 6) DEFAULT 0,
    total_points DECIMAL(20, 6) DEFAULT 0,
    
    -- 活动统计
    lessons_completed INTEGER DEFAULT 0,
    tools_used INTEGER DEFAULT 0,
    content_published INTEGER DEFAULT 0,
    items_sold INTEGER DEFAULT 0,
    quests_completed INTEGER DEFAULT 0,
    
    -- 连续打卡信息
    streak_day INTEGER DEFAULT 1,
    streak_multiplier DECIMAL(3,2) DEFAULT 1.0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_mining_stats_user_date ON daily_mining_stats(user_id, date DESC);
CREATE INDEX idx_daily_mining_stats_date ON daily_mining_stats(date DESC);
CREATE INDEX idx_daily_mining_stats_total_rewards ON daily_mining_stats(total_rewards DESC);

-- RLS策略
ALTER TABLE daily_mining_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "每日统计访问" ON daily_mining_stats
    FOR ALL USING (user_id = auth.uid());

-- ==========================================
-- 3. CHECKIN_RECORDS TABLE (签到记录)
-- ==========================================
CREATE TABLE checkin_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL,
    
    -- AI签到问题和答案
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    ai_feedback TEXT,
    
    -- 奖励
    lac_reward DECIMAL(20, 6) DEFAULT 0,
    points_reward INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 1,
    
    -- 质量评分
    answer_quality_score DECIMAL(3,2) DEFAULT 0.5,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, checkin_date),
    
    CONSTRAINT checkin_quality_check CHECK (answer_quality_score >= 0 AND answer_quality_score <= 1)
);

CREATE INDEX idx_checkin_records_user_id ON checkin_records(user_id);
CREATE INDEX idx_checkin_records_date ON checkin_records(checkin_date DESC);
CREATE INDEX idx_checkin_records_streak ON checkin_records(streak_days DESC);

-- RLS策略
ALTER TABLE checkin_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "签到记录访问" ON checkin_records
    FOR ALL USING (user_id = auth.uid());

-- ==========================================
-- 4. AI_TOOLS TABLE (AI工具)
-- ==========================================
CREATE TABLE ai_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    icon_url TEXT,
    
    -- 定价模型
    pricing_model TEXT DEFAULT 'freemium', -- free, freemium, paid
    free_quota_daily INTEGER DEFAULT 10,
    cost_per_use INTEGER DEFAULT 0, -- LAC
    
    -- 配置
    api_endpoint TEXT,
    parameters_schema JSONB DEFAULT '{}',
    
    -- 挖矿设置
    mining_multiplier DECIMAL(3,2) DEFAULT 1.0,
    min_usage_time INTEGER DEFAULT 30, -- 最小使用时间(秒)获得奖励
    base_reward INTEGER DEFAULT 15,
    
    -- 状态
    status TEXT DEFAULT 'active', -- active, maintenance, deprecated
    featured BOOLEAN DEFAULT FALSE,
    
    -- 统计
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT ai_tools_pricing_check CHECK (pricing_model IN ('free', 'freemium', 'paid')),
    CONSTRAINT ai_tools_status_check CHECK (status IN ('active', 'maintenance', 'deprecated'))
);

CREATE INDEX idx_ai_tools_category ON ai_tools(category);
CREATE INDEX idx_ai_tools_status ON ai_tools(status);
CREATE INDEX idx_ai_tools_featured ON ai_tools(featured DESC);
CREATE INDEX idx_ai_tools_usage ON ai_tools(usage_count DESC);

-- ==========================================
-- 5. USER_AI_TOOL_USAGE TABLE (AI工具使用记录)
-- ==========================================
CREATE TABLE user_ai_tool_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES ai_tools(id) ON DELETE CASCADE,
    
    -- 使用会话
    session_id TEXT UNIQUE NOT NULL,
    
    -- 使用详情
    input_data JSONB,
    output_data JSONB,
    parameters JSONB DEFAULT '{}',
    
    -- 使用统计
    usage_time INTEGER DEFAULT 0, -- 秒
    tokens_used INTEGER DEFAULT 0,
    quality_score DECIMAL(3,2) DEFAULT 0.5, -- AI评估的输出质量 0-1
    
    -- 挖矿奖励
    lac_earned DECIMAL(20, 6) DEFAULT 0,
    mining_multiplier DECIMAL(3,2) DEFAULT 1.0,
    
    -- 时间记录
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- 成本
    lac_cost DECIMAL(20, 6) DEFAULT 0,
    
    CONSTRAINT usage_quality_check CHECK (quality_score >= 0 AND quality_score <= 1),
    CONSTRAINT usage_time_check CHECK (usage_time >= 0),
    CONSTRAINT usage_cost_check CHECK (lac_cost >= 0)
);

CREATE INDEX idx_user_ai_tool_usage_user_id ON user_ai_tool_usage(user_id);
CREATE INDEX idx_user_ai_tool_usage_tool_id ON user_ai_tool_usage(tool_id);
CREATE INDEX idx_user_ai_tool_usage_started_at ON user_ai_tool_usage(started_at DESC);
CREATE INDEX idx_user_ai_tool_usage_session ON user_ai_tool_usage(session_id);

-- RLS策略
ALTER TABLE user_ai_tool_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "工具使用记录访问" ON user_ai_tool_usage
    FOR ALL USING (user_id = auth.uid());

-- ==========================================
-- 6. SYSTEM_CONFIG TABLE (系统配置)
-- ==========================================
CREATE TABLE system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_system_config_updated_at ON system_config(updated_at DESC);

-- 插入默认挖矿配置
INSERT INTO system_config (key, value, description) VALUES
('mining.daily_limits', '{"learn": 500, "use": 300, "teach": 2000, "create": 5000}', '每日挖矿上限(LAC)'),
('mining.streak_multipliers', '{"3": 1.2, "7": 1.5, "14": 2.0, "30": 3.0, "60": 5.0, "90": 6.0}', '连续打卡倍率'),
('mining.base_rewards', '{"learn": 100, "use": 15, "teach": 30, "create": 200}', '基础奖励'),
('mining.level_bonus', '{"1": 1.0, "2": 1.05, "3": 1.10, "4": 1.15, "5": 1.20, "6": 1.25}', '等级奖励加成'),
('mining.decay_rate', '0.65', '年化衰减系数'),
('gamification.level_requirements', '{"1": 0, "2": 500, "3": 2000, "4": 8000, "5": 25000, "6": 80000}', '等级经验要求'),
('trading.platform_fees', '{"market": 0.15, "auction": 0.05, "nft_mint": 100}', '平台手续费');

-- ==========================================
-- 7. MINING FUNCTIONS (挖矿相关函数)
-- ==========================================

-- 获取连续打卡倍率
CREATE OR REPLACE FUNCTION get_streak_multiplier(streak_days INTEGER)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    config JSONB;
    multiplier DECIMAL(3,2) := 1.0;
BEGIN
    -- 获取配置
    SELECT value INTO config FROM system_config WHERE key = 'mining.streak_multipliers';
    
    -- 计算倍率
    IF streak_days >= 90 THEN multiplier := 6.0;
    ELSIF streak_days >= 60 THEN multiplier := 5.0;
    ELSIF streak_days >= 30 THEN multiplier := 3.0;
    ELSIF streak_days >= 14 THEN multiplier := 2.0;
    ELSIF streak_days >= 7 THEN multiplier := 1.5;
    ELSIF streak_days >= 3 THEN multiplier := 1.2;
    END IF;
    
    RETURN multiplier;
END;
$$ LANGUAGE plpgsql;

-- 获取等级加成
CREATE OR REPLACE FUNCTION get_level_bonus(user_level INTEGER)
RETURNS DECIMAL(3,2) AS $$
BEGIN
    RETURN 1.0 + (user_level - 1) * 0.05; -- 每级+5%
END;
$$ LANGUAGE plpgsql;

-- 检查每日挖矿限额
CREATE OR REPLACE FUNCTION check_daily_mining_limit(
    p_user_id UUID, 
    p_mining_type TEXT, 
    p_proposed_reward DECIMAL(20,6),
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(allowed BOOLEAN, actual_reward DECIMAL(20,6), remaining_quota DECIMAL(20,6)) AS $$
DECLARE
    current_rewards DECIMAL(20,6);
    daily_limit DECIMAL(20,6);
    config JSONB;
BEGIN
    -- 获取限额配置
    SELECT value INTO config FROM system_config WHERE key = 'mining.daily_limits';
    daily_limit := (config->>p_mining_type)::DECIMAL(20,6);
    
    -- 获取今日已获得奖励
    SELECT COALESCE((
        CASE p_mining_type
            WHEN 'learn' THEN learn_rewards
            WHEN 'use' THEN use_rewards
            WHEN 'teach' THEN teach_rewards
            WHEN 'create' THEN create_rewards
        END
    ), 0) INTO current_rewards
    FROM daily_mining_stats 
    WHERE user_id = p_user_id AND date = p_date;
    
    -- 如果当前奖励为空，设为0
    current_rewards := COALESCE(current_rewards, 0);
    
    -- 检查是否超限
    IF current_rewards >= daily_limit THEN
        RETURN QUERY SELECT FALSE, 0::DECIMAL(20,6), 0::DECIMAL(20,6);
    ELSE
        -- 计算实际可发放奖励
        RETURN QUERY SELECT 
            TRUE, 
            LEAST(p_proposed_reward, daily_limit - current_rewards),
            daily_limit - current_rewards;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 更新每日挖矿统计
CREATE OR REPLACE FUNCTION update_daily_mining_stats(
    p_user_id UUID,
    p_mining_type TEXT,
    p_lac_amount DECIMAL(20,6),
    p_points_amount INTEGER DEFAULT 0,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_mining_stats (
        user_id, 
        date, 
        learn_rewards, 
        use_rewards, 
        teach_rewards, 
        create_rewards,
        total_rewards,
        total_points,
        lessons_completed,
        tools_used,
        content_published,
        items_sold
    ) VALUES (
        p_user_id,
        p_date,
        CASE WHEN p_mining_type = 'learn' THEN p_lac_amount ELSE 0 END,
        CASE WHEN p_mining_type = 'use' THEN p_lac_amount ELSE 0 END,
        CASE WHEN p_mining_type = 'teach' THEN p_lac_amount ELSE 0 END,
        CASE WHEN p_mining_type = 'create' THEN p_lac_amount ELSE 0 END,
        p_lac_amount,
        p_points_amount,
        CASE WHEN p_mining_type = 'learn' THEN 1 ELSE 0 END,
        CASE WHEN p_mining_type = 'use' THEN 1 ELSE 0 END,
        CASE WHEN p_mining_type = 'teach' THEN 1 ELSE 0 END,
        CASE WHEN p_mining_type = 'create' THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        learn_rewards = daily_mining_stats.learn_rewards + 
            CASE WHEN p_mining_type = 'learn' THEN p_lac_amount ELSE 0 END,
        use_rewards = daily_mining_stats.use_rewards + 
            CASE WHEN p_mining_type = 'use' THEN p_lac_amount ELSE 0 END,
        teach_rewards = daily_mining_stats.teach_rewards + 
            CASE WHEN p_mining_type = 'teach' THEN p_lac_amount ELSE 0 END,
        create_rewards = daily_mining_stats.create_rewards + 
            CASE WHEN p_mining_type = 'create' THEN p_lac_amount ELSE 0 END,
        total_rewards = daily_mining_stats.total_rewards + p_lac_amount,
        total_points = daily_mining_stats.total_points + p_points_amount,
        lessons_completed = daily_mining_stats.lessons_completed + 
            CASE WHEN p_mining_type = 'learn' THEN 1 ELSE 0 END,
        tools_used = daily_mining_stats.tools_used + 
            CASE WHEN p_mining_type = 'use' THEN 1 ELSE 0 END,
        content_published = daily_mining_stats.content_published + 
            CASE WHEN p_mining_type = 'teach' THEN 1 ELSE 0 END,
        items_sold = daily_mining_stats.items_sold + 
            CASE WHEN p_mining_type = 'create' THEN 1 ELSE 0 END;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 8. UPDATE TRIGGERS
-- ==========================================
CREATE TRIGGER update_ai_tools_updated_at BEFORE UPDATE ON ai_tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 9. COMMENTS
-- ==========================================
COMMENT ON TABLE mining_records IS 'LAC四维挖矿记录表';
COMMENT ON TABLE daily_mining_stats IS '用户每日挖矿统计汇总表';
COMMENT ON TABLE checkin_records IS '用户每日AI签到记录表';
COMMENT ON TABLE ai_tools IS 'AI工具定义表';
COMMENT ON TABLE user_ai_tool_usage IS '用户AI工具使用记录表';
COMMENT ON TABLE system_config IS '系统配置参数表';

COMMENT ON COLUMN mining_records.mining_type IS '挖矿类型：learn/use/teach/create';
COMMENT ON COLUMN mining_records.metadata IS '存储难度、质量、时长等参数的JSON数据';
COMMENT ON COLUMN daily_mining_stats.streak_multiplier IS '连续打卡倍率';
COMMENT ON COLUMN checkin_records.answer_quality_score IS 'AI评估的答案质量分数 0-1';
COMMENT ON COLUMN user_ai_tool_usage.quality_score IS 'AI评估的输出质量分数 0-1';