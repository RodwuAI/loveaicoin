-- 简化的Edge Functions表结构
-- 只创建必要的表和函数

-- 1. 修改user_ai_tool_usage表
ALTER TABLE user_ai_tool_usage 
ADD COLUMN IF NOT EXISTS input_text TEXT,
ADD COLUMN IF NOT EXISTS output_text TEXT,
ADD COLUMN IF NOT EXISTS input_length INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS output_length INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lac_reward DECIMAL(20, 6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tool_name TEXT;

-- 2. 创建tool_reviews表
CREATE TABLE IF NOT EXISTS tool_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    review_text TEXT NOT NULL,
    usage_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT tool_reviews_rating_check CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT tool_reviews_length_check CHECK (LENGTH(review_text) >= 100),
    UNIQUE(user_id, tool_name)
);

-- 3. 创建daily_usage_limits表
CREATE TABLE IF NOT EXISTS daily_usage_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tool_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    total_usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, date, tool_name)
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_tool_reviews_user_id ON tool_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_reviews_tool_name ON tool_reviews(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_reviews_rating ON tool_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_tool_reviews_created_at ON tool_reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_usage_limits_user_date ON daily_usage_limits(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_usage_limits_tool ON daily_usage_limits(tool_name);

-- 5. RLS策略
ALTER TABLE tool_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "工具评测查看" ON tool_reviews
    FOR SELECT USING (TRUE);

CREATE POLICY "工具评测管理" ON tool_reviews
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "使用限制访问" ON daily_usage_limits
    FOR ALL USING (user_id = auth.uid());

-- 6. 简化函数：检查每日使用限制
CREATE OR REPLACE FUNCTION check_daily_usage_limit(
    p_user_id UUID,
    p_tool_name TEXT,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
    v_tool_usage INTEGER;
    v_total_usage INTEGER;
    v_tool_limit INTEGER := 5;
    v_total_limit INTEGER := 20;
    v_result JSONB;
BEGIN
    -- 获取工具使用次数
    SELECT COALESCE(usage_count, 0) INTO v_tool_usage
    FROM daily_usage_limits
    WHERE user_id = p_user_id AND date = p_date AND tool_name = p_tool_name;
    
    -- 获取总使用次数
    SELECT COALESCE(SUM(usage_count), 0) INTO v_total_usage
    FROM daily_usage_limits
    WHERE user_id = p_user_id AND date = p_date;
    
    -- 构建结果
    v_result := jsonb_build_object(
        'allowed', v_tool_usage < v_tool_limit AND v_total_usage < v_total_limit,
        'tool_usage_count', v_tool_usage,
        'tool_remaining', GREATEST(0, v_tool_limit - v_tool_usage),
        'total_usage_count', v_total_usage,
        'total_remaining', GREATEST(0, v_total_limit - v_total_usage)
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 7. 简化函数：更新每日使用计数
CREATE OR REPLACE FUNCTION update_daily_usage_count(
    p_user_id UUID,
    p_tool_name TEXT,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_usage_limits (user_id, date, tool_name, usage_count, total_usage_count)
    VALUES (p_user_id, p_date, p_tool_name, 1, 1)
    ON CONFLICT (user_id, date, tool_name)
    DO UPDATE SET
        usage_count = daily_usage_limits.usage_count + 1,
        total_usage_count = daily_usage_limits.total_usage_count + 1;
END;
$$ LANGUAGE plpgsql;

-- 8. 简化函数：检查用户是否有工具使用记录
CREATE OR REPLACE FUNCTION has_tool_usage_record(
    p_user_id UUID,
    p_tool_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM user_ai_tool_usage
    WHERE user_id = p_user_id AND tool_name = p_tool_name;
    
    RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql;

-- 9. 简化函数：计算LAC奖励
CREATE OR REPLACE FUNCTION calculate_lac_reward(
    p_input_length INTEGER,
    p_output_length INTEGER
)
RETURNS DECIMAL(20,6) AS $$
DECLARE
    v_base_reward DECIMAL(20,6) := 10.0;
    v_input_bonus DECIMAL(20,6) := 0.0;
    v_output_bonus DECIMAL(20,6) := 0.0;
BEGIN
    v_input_bonus := LEAST(p_input_length * 0.1, 5.0);
    v_output_bonus := LEAST(p_output_length * 0.2, 20.0);
    
    RETURN v_base_reward + v_input_bonus + v_output_bonus;
END;
$$ LANGUAGE plpgsql;