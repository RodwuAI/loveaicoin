-- LAC Rate Limiting Table
-- 创建时间：2025-02-21
-- 用途：防止API滥用、暴力破解、DDoS攻击

CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,  -- 格式：'ip:1.2.3.4:signup' 或 'email:test@xx.com:signin'
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(key)
);

-- 创建索引提高查询性能
CREATE INDEX idx_rate_limits_key ON rate_limits(key);
CREATE INDEX idx_rate_limits_window_start ON rate_limits(window_start);

-- 自动清理过期记录的函数
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
  -- 删除超过24小时的记录
  DELETE FROM rate_limits 
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- 创建定时清理任务（如果支持pg_cron）
-- SELECT cron.schedule('cleanup-rate-limits', '0 */6 * * *', 'SELECT cleanup_expired_rate_limits();');

-- Rate limiting检查函数
CREATE OR REPLACE FUNCTION check_rate_limit(
  rate_key TEXT,
  limit_count INTEGER,
  window_seconds INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- 计算窗口开始时间
  window_start_time := NOW() - (window_seconds || ' seconds')::INTERVAL;
  
  -- 清理过期的记录
  DELETE FROM rate_limits 
  WHERE key = rate_key AND window_start < window_start_time;
  
  -- 获取当前计数
  SELECT count INTO current_count 
  FROM rate_limits 
  WHERE key = rate_key;
  
  -- 如果没有记录，插入新记录
  IF current_count IS NULL THEN
    INSERT INTO rate_limits (key, count, window_start)
    VALUES (rate_key, 1, NOW())
    ON CONFLICT (key) DO UPDATE SET
      count = 1,
      window_start = NOW(),
      updated_at = NOW();
    RETURN TRUE;
  END IF;
  
  -- 如果未超过限制，增加计数
  IF current_count < limit_count THEN
    UPDATE rate_limits 
    SET count = count + 1, 
        updated_at = NOW()
    WHERE key = rate_key;
    RETURN TRUE;
  END IF;
  
  -- 超过限制
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 获取剩余配额函数
CREATE OR REPLACE FUNCTION get_rate_limit_remaining(
  rate_key TEXT,
  limit_count INTEGER,
  window_seconds INTEGER
) RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start_time := NOW() - (window_seconds || ' seconds')::INTERVAL;
  
  SELECT count INTO current_count 
  FROM rate_limits 
  WHERE key = rate_key AND window_start >= window_start_time;
  
  IF current_count IS NULL THEN
    RETURN limit_count;
  END IF;
  
  RETURN GREATEST(0, limit_count - current_count);
END;
$$ LANGUAGE plpgsql;

-- 添加注释
COMMENT ON TABLE rate_limits IS '速率限制表，用于防止API滥用';
COMMENT ON COLUMN rate_limits.key IS '限制键，格式：类型:标识符:操作，如ip:1.2.3.4:signup';
COMMENT ON COLUMN rate_limits.count IS '当前窗口内的请求计数';
COMMENT ON COLUMN rate_limits.window_start IS '限制窗口开始时间';