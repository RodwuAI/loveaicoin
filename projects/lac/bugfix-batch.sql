-- Bug Fix Batch: 审计发现的6个Bug

-- 1. charity_donations.level 加默认值
ALTER TABLE charity_donations ALTER COLUMN level SET DEFAULT 'bronze';
-- 如果列不存在就添加
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='charity_donations' AND column_name='level') THEN
    ALTER TABLE charity_donations ADD COLUMN level TEXT NOT NULL DEFAULT 'bronze';
  END IF;
END $$;

-- 2. validate_content_submission 函数
CREATE OR REPLACE FUNCTION validate_content_submission(
    p_content TEXT,
    p_content_type TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    IF p_content_type = 'article' THEN
        RETURN LENGTH(p_content) >= 800;
    ELSIF p_content_type = 'video' THEN
        RETURN LENGTH(p_content) >= 150;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. check_daily_usage_limit 函数
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
    SELECT COALESCE(usage_count, 0) INTO v_tool_usage
    FROM daily_usage_limits
    WHERE user_id = p_user_id AND date = p_date AND tool_name = p_tool_name;
    SELECT COALESCE(SUM(usage_count), 0) INTO v_total_usage
    FROM daily_usage_limits
    WHERE user_id = p_user_id AND date = p_date;
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

-- 4. get_tool_reviews 函数
CREATE OR REPLACE FUNCTION get_tool_reviews(
    p_tool_name TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    tool_name TEXT,
    rating INTEGER,
    review_text TEXT,
    usage_verified BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    user_name TEXT,
    user_avatar TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tr.id,
        tr.user_id,
        tr.tool_name,
        tr.rating,
        tr.review_text,
        tr.usage_verified,
        tr.created_at,
        u.name AS user_name,
        u.avatar_url AS user_avatar
    FROM tool_reviews tr
    JOIN users u ON tr.user_id = u.id
    WHERE (p_tool_name IS NULL OR tr.tool_name = p_tool_name)
    ORDER BY tr.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- 5. 补齐 011 里的表和辅助函数（IF NOT EXISTS 安全）
CREATE TABLE IF NOT EXISTS tool_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    review_text TEXT NOT NULL,
    usage_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT tool_reviews_rating_check CHECK (rating >= 1 AND rating <= 5),
    UNIQUE(user_id, tool_name)
);

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

CREATE INDEX IF NOT EXISTS idx_tool_reviews_user_id ON tool_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_reviews_tool_name ON tool_reviews(tool_name);
CREATE INDEX IF NOT EXISTS idx_daily_usage_limits_user_date ON daily_usage_limits(user_id, date DESC);

ALTER TABLE tool_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage_limits ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='工具评测查看' AND tablename='tool_reviews') THEN
    CREATE POLICY "工具评测查看" ON tool_reviews FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='使用限制访问' AND tablename='daily_usage_limits') THEN
    CREATE POLICY "使用限制访问" ON daily_usage_limits FOR ALL USING (TRUE);
  END IF;
END $$;

-- 6. update_daily_usage_count
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
