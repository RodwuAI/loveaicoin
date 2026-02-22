-- LAC Backend Migration 004: Gamification System
-- 创建游戏化系统相关表(成就、排行榜、赛季、团队)

-- ==========================================
-- 1. ACHIEVEMENTS TABLE (成就定义)
-- ==========================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    
    -- 稀有度和分类
    rarity TEXT DEFAULT 'common', -- common, rare, epic, legendary
    category TEXT NOT NULL, -- learning, usage, teaching, creation, social
    
    -- 解锁条件
    unlock_condition JSONB NOT NULL,
    
    -- 奖励
    lac_reward INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 0,
    points_reward INTEGER DEFAULT 0,
    
    -- NFT化设置
    can_mint_nft BOOLEAN DEFAULT FALSE,
    nft_mint_cost INTEGER DEFAULT 100, -- LAC
    
    -- 状态
    active BOOLEAN DEFAULT TRUE,
    
    -- 统计
    unlock_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT achievements_rarity_check CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    CONSTRAINT achievements_category_check CHECK (category IN ('learning', 'usage', 'teaching', 'creation', 'social'))
);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);
CREATE INDEX idx_achievements_active ON achievements(active);
CREATE INDEX idx_achievements_unlock_count ON achievements(unlock_count DESC);

-- ==========================================
-- 2. USER_ACHIEVEMENTS TABLE (用户成就)
-- ==========================================
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    
    -- 进度
    progress DECIMAL(5,2) DEFAULT 0, -- 百分比
    current_value INTEGER DEFAULT 0,
    target_value INTEGER,
    
    -- 状态
    unlocked BOOLEAN DEFAULT FALSE,
    claimed BOOLEAN DEFAULT FALSE,
    
    -- NFT化
    nft_minted BOOLEAN DEFAULT FALSE,
    nft_token_id TEXT,
    
    -- 时间
    unlocked_at TIMESTAMP WITH TIME ZONE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, achievement_id),
    CONSTRAINT user_achievements_progress_check CHECK (progress >= 0 AND progress <= 100)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked);
CREATE INDEX idx_user_achievements_claimed ON user_achievements(claimed);

-- RLS策略
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户成就访问" ON user_achievements
    FOR ALL USING (user_id = auth.uid());

-- ==========================================
-- 3. DAILY_QUESTS TABLE (每日任务定义)
-- ==========================================
CREATE TABLE daily_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- 任务配置
    quest_type TEXT NOT NULL, -- learn_lesson, use_tool, publish_content, checkin, etc.
    target_value INTEGER DEFAULT 1,
    
    -- 奖励
    lac_reward INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    points_reward INTEGER DEFAULT 0,
    
    -- 权重(用于随机选择)
    weight INTEGER DEFAULT 1,
    
    -- 要求等级
    min_level INTEGER DEFAULT 1,
    max_level INTEGER DEFAULT 6,
    
    active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT daily_quests_target_check CHECK (target_value > 0),
    CONSTRAINT daily_quests_level_check CHECK (min_level >= 1 AND max_level <= 6 AND min_level <= max_level)
);

CREATE INDEX idx_daily_quests_type ON daily_quests(quest_type);
CREATE INDEX idx_daily_quests_active ON daily_quests(active);
CREATE INDEX idx_daily_quests_level ON daily_quests(min_level, max_level);

-- ==========================================
-- 4. USER_DAILY_QUESTS TABLE (用户每日任务)
-- ==========================================
CREATE TABLE user_daily_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES daily_quests(id),
    date DATE NOT NULL,
    
    -- 进度
    current_progress INTEGER DEFAULT 0,
    target_progress INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    claimed BOOLEAN DEFAULT FALSE,
    
    -- 时间
    completed_at TIMESTAMP WITH TIME ZONE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, quest_id, date),
    CONSTRAINT user_daily_quests_progress_check CHECK (current_progress >= 0 AND current_progress <= target_progress)
);

CREATE INDEX idx_user_daily_quests_user_date ON user_daily_quests(user_id, date);
CREATE INDEX idx_user_daily_quests_completed ON user_daily_quests(completed);
CREATE INDEX idx_user_daily_quests_claimed ON user_daily_quests(claimed);

-- RLS策略
ALTER TABLE user_daily_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户每日任务访问" ON user_daily_quests
    FOR ALL USING (user_id = auth.uid());

-- ==========================================
-- 5. LEADERBOARD_CACHE TABLE (排行榜缓存)
-- ==========================================
CREATE TABLE leaderboard_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    board_type TEXT NOT NULL, -- learning, teaching, creation, wealth, team
    period TEXT NOT NULL, -- daily, weekly, monthly, season, all_time
    period_start DATE NOT NULL,
    
    score DECIMAL(20, 6) NOT NULL,
    rank INTEGER,
    
    -- 详细数据
    metrics JSONB DEFAULT '{}',
    
    -- 时间
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, board_type, period, period_start),
    CONSTRAINT leaderboard_board_type_check CHECK (board_type IN ('learning', 'teaching', 'creation', 'wealth', 'team')),
    CONSTRAINT leaderboard_period_check CHECK (period IN ('daily', 'weekly', 'monthly', 'season', 'all_time'))
);

CREATE INDEX idx_leaderboard_cache_board_period ON leaderboard_cache(board_type, period, period_start);
CREATE INDEX idx_leaderboard_cache_score ON leaderboard_cache(board_type, period, period_start, score DESC);
CREATE INDEX idx_leaderboard_cache_rank ON leaderboard_cache(board_type, period, period_start, rank);
CREATE INDEX idx_leaderboard_cache_updated_at ON leaderboard_cache(updated_at);

-- ==========================================
-- 6. SEASONS TABLE (赛季)
-- ==========================================
CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    theme TEXT,
    description TEXT,
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- 特殊奖励倍率
    reward_multiplier DECIMAL(3,2) DEFAULT 1.0,
    
    -- 赛季通行证
    pass_levels INTEGER DEFAULT 30,
    premium_pass_price INTEGER DEFAULT 500, -- LAC
    
    active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT seasons_dates_check CHECK (end_date > start_date),
    CONSTRAINT seasons_multiplier_check CHECK (reward_multiplier > 0)
);

CREATE INDEX idx_seasons_dates ON seasons(start_date, end_date);
CREATE INDEX idx_seasons_active ON seasons(active);

-- ==========================================
-- 7. USER_SEASON_PASS TABLE (用户赛季通行证)
-- ==========================================
CREATE TABLE user_season_pass (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    season_id UUID REFERENCES seasons(id),
    
    -- 通行证类型
    has_premium BOOLEAN DEFAULT FALSE,
    
    -- 进度
    current_level INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    
    -- 奖励领取状态
    claimed_rewards JSONB DEFAULT '{}', -- {level: {free: boolean, premium: boolean}}
    
    UNIQUE(user_id, season_id),
    CONSTRAINT user_season_pass_level_check CHECK (current_level >= 0),
    CONSTRAINT user_season_pass_xp_check CHECK (total_xp >= 0)
);

CREATE INDEX idx_user_season_pass_user_id ON user_season_pass(user_id);
CREATE INDEX idx_user_season_pass_season_id ON user_season_pass(season_id);

-- RLS策略
ALTER TABLE user_season_pass ENABLE ROW LEVEL SECURITY;

CREATE POLICY "赛季通行证访问" ON user_season_pass
    FOR ALL USING (user_id = auth.uid());

-- ==========================================
-- 8. TEAMS TABLE (团队)
-- ==========================================
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 团队设置
    max_members INTEGER DEFAULT 10,
    invite_only BOOLEAN DEFAULT FALSE,
    activity_requirement INTEGER DEFAULT 3, -- 每周最少活跃天数
    
    -- 统计数据
    total_members INTEGER DEFAULT 1,
    total_mining_this_week DECIMAL(20, 6) DEFAULT 0,
    
    -- 状态
    status TEXT DEFAULT 'active', -- active, disbanded
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT teams_max_members_check CHECK (max_members >= 1 AND max_members <= 50),
    CONSTRAINT teams_status_check CHECK (status IN ('active', 'disbanded'))
);

CREATE INDEX idx_teams_leader ON teams(leader_id);
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_teams_mining ON teams(total_mining_this_week DESC);
CREATE INDEX idx_teams_name ON teams(name);

-- ==========================================
-- 9. TEAM_MEMBERS TABLE (团队成员)
-- ==========================================
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 成员角色
    role TEXT DEFAULT 'member', -- leader, co_leader, member
    
    -- 统计
    contribution_this_week DECIMAL(20, 6) DEFAULT 0,
    last_activity_date DATE,
    
    -- 时间
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, user_id),
    CONSTRAINT team_members_role_check CHECK (role IN ('leader', 'co_leader', 'member'))
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_contribution ON team_members(team_id, contribution_this_week DESC);

-- RLS策略
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "团队成员访问" ON team_members
    FOR ALL USING (
        user_id = auth.uid() OR 
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    );

-- ==========================================
-- 10. GAMIFICATION FUNCTIONS (游戏化函数)
-- ==========================================

-- 检查成就进度并解锁
CREATE OR REPLACE FUNCTION check_achievement_progress(p_user_id UUID, p_achievement_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    achievement_record achievements%ROWTYPE;
    user_achievement_record user_achievements%ROWTYPE;
    condition_type TEXT;
    condition_target INTEGER;
    current_value INTEGER := 0;
    unlocked BOOLEAN := FALSE;
BEGIN
    -- 获取成就定义
    SELECT * INTO achievement_record FROM achievements WHERE id = p_achievement_id;
    
    -- 获取用户成就进度
    SELECT * INTO user_achievement_record 
    FROM user_achievements 
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id;
    
    -- 如果已经解锁，直接返回
    IF user_achievement_record.unlocked THEN
        RETURN TRUE;
    END IF;
    
    -- 解析解锁条件
    condition_type := achievement_record.unlock_condition->>'type';
    condition_target := (achievement_record.unlock_condition->>'target')::INTEGER;
    
    -- 根据条件类型计算当前值
    CASE condition_type
        WHEN 'lessons_completed' THEN
            SELECT COUNT(*) INTO current_value
            FROM user_lesson_progress ulp
            JOIN course_lessons cl ON cl.id = ulp.lesson_id
            WHERE ulp.user_id = p_user_id AND ulp.status = 'completed';
        
        WHEN 'consecutive_checkin' THEN
            SELECT streak_days INTO current_value FROM users WHERE id = p_user_id;
        
        WHEN 'content_published' THEN
            SELECT COUNT(*) INTO current_value
            FROM teaching_contents
            WHERE author_id = p_user_id AND status = 'published';
        
        WHEN 'total_mining_earned' THEN
            SELECT COALESCE(SUM(lac_earned), 0)::INTEGER INTO current_value
            FROM mining_records
            WHERE user_id = p_user_id;
        
        ELSE
            current_value := 0;
    END CASE;
    
    -- 计算进度
    DECLARE
        progress_percent DECIMAL(5,2) := LEAST(100, (current_value::DECIMAL / condition_target) * 100);
    BEGIN
        -- 更新或插入用户成就记录
        INSERT INTO user_achievements (
            user_id, achievement_id, progress, current_value, target_value, unlocked, unlocked_at
        ) VALUES (
            p_user_id, p_achievement_id, progress_percent, current_value, condition_target, 
            current_value >= condition_target, 
            CASE WHEN current_value >= condition_target THEN NOW() ELSE NULL END
        )
        ON CONFLICT (user_id, achievement_id)
        DO UPDATE SET
            progress = progress_percent,
            current_value = current_value,
            unlocked = current_value >= condition_target,
            unlocked_at = CASE 
                WHEN current_value >= condition_target AND user_achievements.unlocked = FALSE 
                THEN NOW() 
                ELSE user_achievements.unlocked_at 
            END;
        
        -- 如果成就解锁，更新解锁计数
        IF current_value >= condition_target THEN
            UPDATE achievements SET unlock_count = unlock_count + 1 WHERE id = p_achievement_id;
            unlocked := TRUE;
        END IF;
    END;
    
    RETURN unlocked;
END;
$$ LANGUAGE plpgsql;

-- 生成用户每日任务
CREATE OR REPLACE FUNCTION generate_daily_quests(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
    user_level INTEGER;
    quest_record daily_quests%ROWTYPE;
    generated_count INTEGER := 0;
BEGIN
    -- 获取用户等级
    SELECT level INTO user_level FROM users WHERE id = p_user_id;
    
    -- 删除已存在的今日任务
    DELETE FROM user_daily_quests WHERE user_id = p_user_id AND date = p_date;
    
    -- 生成3个随机任务
    FOR quest_record IN 
        SELECT * FROM daily_quests 
        WHERE active = TRUE 
        AND min_level <= user_level 
        AND max_level >= user_level
        ORDER BY RANDOM() * weight DESC
        LIMIT 3
    LOOP
        INSERT INTO user_daily_quests (
            user_id, quest_id, date, current_progress, target_progress
        ) VALUES (
            p_user_id, quest_record.id, p_date, 0, quest_record.target_value
        );
        generated_count := generated_count + 1;
    END LOOP;
    
    RETURN generated_count;
END;
$$ LANGUAGE plpgsql;

-- 更新排行榜
CREATE OR REPLACE FUNCTION update_leaderboard(p_board_type TEXT, p_period TEXT, p_period_start DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
BEGIN
    -- 清空旧数据
    DELETE FROM leaderboard_cache 
    WHERE board_type = p_board_type 
    AND period = p_period 
    AND period_start = p_period_start;
    
    -- 根据榜单类型插入新数据
    CASE p_board_type
        WHEN 'learning' THEN
            INSERT INTO leaderboard_cache (user_id, board_type, period, period_start, score, metrics)
            SELECT 
                user_id,
                p_board_type,
                p_period,
                p_period_start,
                COALESCE(SUM(learn_rewards), 0) as score,
                json_build_object(
                    'learn_rewards', COALESCE(SUM(learn_rewards), 0),
                    'lessons_completed', COALESCE(SUM(lessons_completed), 0)
                )
            FROM daily_mining_stats
            WHERE date >= p_period_start
            AND date < p_period_start + CASE p_period
                WHEN 'daily' THEN INTERVAL '1 day'
                WHEN 'weekly' THEN INTERVAL '7 days'
                WHEN 'monthly' THEN INTERVAL '1 month'
                ELSE INTERVAL '1 year'
            END
            GROUP BY user_id
            ORDER BY score DESC;
            
        WHEN 'wealth' THEN
            INSERT INTO leaderboard_cache (user_id, board_type, period, period_start, score, metrics)
            SELECT 
                id as user_id,
                p_board_type,
                p_period,
                p_period_start,
                lac_balance as score,
                json_build_object(
                    'lac_balance', lac_balance,
                    'total_mining_earned', total_mining_earned
                )
            FROM users
            WHERE status = 'active'
            ORDER BY lac_balance DESC;
    END CASE;
    
    -- 更新排名
    UPDATE leaderboard_cache 
    SET rank = ranked.new_rank
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (ORDER BY score DESC) as new_rank
        FROM leaderboard_cache
        WHERE board_type = p_board_type 
        AND period = p_period 
        AND period_start = p_period_start
    ) ranked
    WHERE leaderboard_cache.id = ranked.id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- 计算团队贡献
CREATE OR REPLACE FUNCTION update_team_contribution(p_user_id UUID, p_lac_amount DECIMAL(20,6))
RETURNS VOID AS $$
DECLARE
    team_id_var UUID;
BEGIN
    -- 获取用户所在团队
    SELECT team_id INTO team_id_var 
    FROM team_members 
    WHERE user_id = p_user_id;
    
    IF team_id_var IS NOT NULL THEN
        -- 更新成员本周贡献
        UPDATE team_members
        SET contribution_this_week = contribution_this_week + p_lac_amount,
            last_activity_date = CURRENT_DATE
        WHERE user_id = p_user_id AND team_id = team_id_var;
        
        -- 更新团队总挖矿
        UPDATE teams
        SET total_mining_this_week = total_mining_this_week + p_lac_amount,
            updated_at = NOW()
        WHERE id = team_id_var;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 11. TRIGGERS
-- ==========================================
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 12. VIEWS
-- ==========================================

-- 用户成就统计视图
CREATE VIEW user_achievement_stats AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(*) as total_achievements,
    COUNT(CASE WHEN ua.unlocked THEN 1 END) as unlocked_achievements,
    COUNT(CASE WHEN ua.claimed THEN 1 END) as claimed_achievements,
    SUM(CASE WHEN ua.unlocked THEN a.xp_reward ELSE 0 END) as total_achievement_xp
FROM users u
LEFT JOIN user_achievements ua ON ua.user_id = u.id
LEFT JOIN achievements a ON a.id = ua.achievement_id
GROUP BY u.id, u.username;

-- 团队排行榜视图
CREATE VIEW team_leaderboard AS
SELECT 
    t.id,
    t.name,
    t.total_members,
    t.total_mining_this_week,
    u.username as leader_name,
    ROW_NUMBER() OVER (ORDER BY t.total_mining_this_week DESC) as rank
FROM teams t
JOIN users u ON u.id = t.leader_id
WHERE t.status = 'active'
ORDER BY t.total_mining_this_week DESC;

-- ==========================================
-- 13. COMMENTS
-- ==========================================
COMMENT ON TABLE achievements IS 'LAC成就系统定义表';
COMMENT ON TABLE user_achievements IS '用户成就进度和解锁状态表';
COMMENT ON TABLE daily_quests IS '每日任务模板定义表';
COMMENT ON TABLE user_daily_quests IS '用户每日任务进度表';
COMMENT ON TABLE leaderboard_cache IS '排行榜缓存表';
COMMENT ON TABLE seasons IS '赛季定义表';
COMMENT ON TABLE user_season_pass IS '用户赛季通行证表';
COMMENT ON TABLE teams IS '团队信息表';
COMMENT ON TABLE team_members IS '团队成员表';

COMMENT ON COLUMN achievements.unlock_condition IS 'JSON格式解锁条件 {"type": "lessons_completed", "target": 10}';
COMMENT ON COLUMN achievements.rarity IS '成就稀有度: common/rare/epic/legendary';
COMMENT ON COLUMN leaderboard_cache.metrics IS '排行榜详细数据JSON格式';
COMMENT ON COLUMN user_season_pass.claimed_rewards IS '已领取奖励状态JSON格式';
COMMENT ON COLUMN teams.activity_requirement IS '团队成员每周最低活跃天数要求';