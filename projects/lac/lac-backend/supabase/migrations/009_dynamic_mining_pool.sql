-- LAC Backend Migration 007: Dynamic Mining Pool System
-- 动态矿池系统配置和功能

-- ==========================================
-- 1. 添加动态矿池系统配置
-- ==========================================

-- 插入动态矿池相关配置
INSERT INTO system_config (key, value, description) VALUES
-- 全局矿池设置
('mining.pool.total_supply', '100000000000', '总供应量100亿LAC'),
('mining.pool.daily_ratio', '0.45', '每日释放比例45%'),
('mining.pool.decay_factor_annual', '0.65', '年化衰减系数'),
('mining.pool.reward_floor', '5', '最低奖励5 LAC'),
('mining.pool.reward_ceiling', '500', '最高奖励500 LAC'),

-- 挖矿奖励倍率配置（用于mining-streak）
('mining.streak.multipliers', '{"7": 1.2, "14": 1.4, "30": 1.5, "60": 2.0, "90": 2.5}', '连续签到奖励倍率'),
('mining.streak.milestones', '[7, 14, 30, 60, 90]', '连续签到里程碑天数'),

-- 动态矿池计算相关
('mining.pool.launch_date', '"2024-01-01"', '挖矿系统启动日期'),
('mining.pool.participant_threshold', '1', '最低参与人数阈值'),
('mining.pool.base_participants', '100', '基础参与人数（用于平滑启动）')

ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- ==========================================
-- 2. 添加动态矿池统计函数
-- ==========================================

-- 计算当前衰减系数
CREATE OR REPLACE FUNCTION get_decay_factor(target_date DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL(10,8) AS $$
DECLARE
    launch_date DATE;
    years_elapsed DECIMAL(10,4);
    annual_decay DECIMAL(3,2);
    decay_factor DECIMAL(10,8);
BEGIN
    -- 获取启动日期和年化衰减系数
    SELECT (value #>> '{}')::DATE INTO launch_date FROM system_config WHERE key = 'mining.pool.launch_date';
    SELECT (value #>> '{}')::DECIMAL(3,2) INTO annual_decay FROM system_config WHERE key = 'mining.pool.decay_factor_annual';
    
    -- 计算经过的年数
    years_elapsed := EXTRACT(EPOCH FROM (target_date - launch_date)) / (365.25 * 24 * 3600);
    
    -- 计算衰减系数：Y1=1.00, Y2=0.65, Y3=0.42...
    IF years_elapsed <= 1 THEN
        decay_factor := 1.0;
    ELSE
        decay_factor := POWER(annual_decay, FLOOR(years_elapsed));
    END IF;
    
    RETURN GREATEST(decay_factor, 0.01); -- 最低0.01避免奖励过低
END;
$$ LANGUAGE plpgsql STABLE;

-- 计算每日总释放量
CREATE OR REPLACE FUNCTION calculate_daily_budget(target_date DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL(20,6) AS $$
DECLARE
    total_supply DECIMAL(20,0);
    daily_ratio DECIMAL(5,4);
    decay_factor DECIMAL(10,8);
    daily_budget DECIMAL(20,6);
BEGIN
    -- 获取配置
    SELECT (value #>> '{}')::DECIMAL(20,0) INTO total_supply FROM system_config WHERE key = 'mining.pool.total_supply';
    SELECT (value #>> '{}')::DECIMAL(5,4) INTO daily_ratio FROM system_config WHERE key = 'mining.pool.daily_ratio';
    
    -- 获取衰减系数
    decay_factor := get_decay_factor(target_date);
    
    -- 计算: 每日释放量 = 总量 × 比例 × 衰减系数 / 365
    daily_budget := (total_supply * daily_ratio * decay_factor) / 365.0;
    
    RETURN daily_budget;
END;
$$ LANGUAGE plpgsql STABLE;

-- 获取当日参与人数
CREATE OR REPLACE FUNCTION get_daily_participants(target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
    participant_count INTEGER;
    threshold INTEGER;
    base_participants INTEGER;
BEGIN
    -- 统计当天有挖矿记录的用户数
    SELECT COUNT(DISTINCT user_id) INTO participant_count
    FROM mining_records
    WHERE DATE(created_at) = target_date
    AND status = 'completed';
    
    -- 获取最低阈值和基础参与人数
    SELECT (value #>> '{}')::INTEGER INTO threshold FROM system_config WHERE key = 'mining.pool.participant_threshold';
    SELECT (value #>> '{}')::INTEGER INTO base_participants FROM system_config WHERE key = 'mining.pool.base_participants';
    
    -- 返回实际参与人数，但不低于阈值，启动阶段使用基础参与人数平滑
    RETURN GREATEST(participant_count, threshold, 
                   CASE WHEN participant_count < base_participants THEN base_participants ELSE participant_count END);
END;
$$ LANGUAGE plpgsql STABLE;

-- 计算用户连续签到天数和倍率
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID, p_current_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(streak_days INTEGER, multiplier DECIMAL(3,2), next_milestone INTEGER) AS $$
DECLARE
    current_streak INTEGER := 0;
    temp_date DATE;
    found_gap BOOLEAN := FALSE;
    config JSONB;
    milestone_multiplier DECIMAL(3,2) := 1.0;
    milestones INTEGER[];
    next_target INTEGER;
BEGIN
    -- 获取里程碑配置
    SELECT value INTO config FROM system_config WHERE key = 'mining.streak.multipliers';
    SELECT value INTO milestones FROM system_config WHERE key = 'mining.streak.milestones';
    
    -- 从今天开始往前查找连续签到记录
    temp_date := p_current_date;
    
    WHILE NOT found_gap AND temp_date >= p_current_date - INTERVAL '365 days' LOOP
        -- 检查这一天是否有签到记录
        IF EXISTS (
            SELECT 1 FROM checkin_records 
            WHERE user_id = p_user_id 
            AND checkin_date = temp_date
        ) THEN
            current_streak := current_streak + 1;
            temp_date := temp_date - INTERVAL '1 day';
        ELSE
            found_gap := TRUE;
        END IF;
    END LOOP;
    
    -- 计算倍率：找到最大的已达到里程碑
    FOR i IN 1..array_length(milestones, 1) LOOP
        IF current_streak >= milestones[i] THEN
            milestone_multiplier := (config ->> milestones[i]::TEXT)::DECIMAL(3,2);
        END IF;
    END LOOP;
    
    -- 找到下一个里程碑
    next_target := NULL;
    FOR i IN 1..array_length(milestones, 1) LOOP
        IF current_streak < milestones[i] THEN
            next_target := milestones[i];
            EXIT;
        END IF;
    END LOOP;
    
    RETURN QUERY SELECT current_streak, milestone_multiplier, next_target;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==========================================
-- 3. COMMENTS
-- ==========================================
COMMENT ON FUNCTION get_decay_factor IS '计算指定日期的衰减系数';
COMMENT ON FUNCTION calculate_daily_budget IS '计算指定日期的每日总释放量';
COMMENT ON FUNCTION get_daily_participants IS '获取指定日期的参与挖矿人数';
COMMENT ON FUNCTION calculate_user_streak IS '计算用户连续签到天数和奖励倍率';