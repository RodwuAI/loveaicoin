/**
 * LAC Rate Limiter Utility
 * 基于IP和用户的速率限制
 */

export interface RateLimitConfig {
  limit: number;    // 限制次数
  window: number;   // 时间窗口（秒）
  penalty: number;  // 超限惩罚时间（秒）
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number; // 如果被限制，多少秒后可重试
}

// 预定义的速率限制规则
export const RATE_LIMITS = {
  // 注册：每IP每小时最多5次
  SIGNUP_IP: { limit: 5, window: 3600, penalty: 3600 },
  
  // 登录：每IP每分钟最多10次
  SIGNIN_IP: { limit: 10, window: 60, penalty: 300 },
  
  // 登录：每邮箱每分钟最多3次
  SIGNIN_EMAIL: { limit: 3, window: 60, penalty: 180 },
  
  // 签到：每IP每小时最多20次
  CHECKIN_IP: { limit: 20, window: 3600, penalty: 1800 },
  
  // 学习：每IP每小时最多100次
  LEARN_IP: { limit: 100, window: 3600, penalty: 1800 }
} as const;

/**
 * 检查速率限制
 */
export async function checkRateLimit(
  supabase: any,
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    // 调用数据库函数检查限制
    const { data: allowed } = await supabase
      .rpc('check_rate_limit', {
        rate_key: key,
        limit_count: config.limit,
        window_seconds: config.window
      });

    if (allowed) {
      // 获取剩余配额
      const { data: remaining } = await supabase
        .rpc('get_rate_limit_remaining', {
          rate_key: key,
          limit_count: config.limit,
          window_seconds: config.window
        });

      return {
        allowed: true,
        remaining: remaining || config.limit - 1,
        resetTime: new Date(Date.now() + config.window * 1000)
      };
    } else {
      // 被限制，计算重试时间
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(Date.now() + config.penalty * 1000),
        retryAfter: config.penalty
      };
    }

  } catch (error) {
    console.error('Rate limit check failed:', error);
    // 出错时允许通过，避免阻塞正常用户
    return {
      allowed: true,
      remaining: config.limit,
      resetTime: new Date(Date.now() + config.window * 1000)
    };
  }
}

/**
 * 获取客户端IP地址
 */
export function getClientIP(request: Request): string {
  // 尝试从多个header获取真实IP
  const headers = [
    'cf-connecting-ip',      // Cloudflare
    'x-real-ip',            // Nginx
    'x-forwarded-for',      // Load balancer
    'x-client-ip',          // Apache
    'cf-ray'                // Cloudflare备选
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for可能包含多个IP，取第一个
      const ip = value.split(',')[0].trim();
      if (isValidIP(ip)) {
        return ip;
      }
    }
  }

  return 'unknown';
}

/**
 * 验证IP地址格式
 */
function isValidIP(ip: string): boolean {
  // IPv4正则
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6正则（简化）
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * 创建速率限制键
 */
export function createRateLimitKey(prefix: string, identifier: string, action: string): string {
  return `${prefix}:${identifier}:${action}`;
}

/**
 * 速率限制中间件包装器
 */
export async function withRateLimit(
  request: Request,
  supabase: any,
  limitType: keyof typeof RATE_LIMITS,
  identifier: string,
  handler: () => Promise<Response>
): Promise<Response> {
  const config = RATE_LIMITS[limitType];
  const key = createRateLimitKey(limitType.split('_')[1].toLowerCase(), identifier, limitType.split('_')[0].toLowerCase());
  
  const rateLimitResult = await checkRateLimit(supabase, key, config);
  
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: '请求过于频繁，请稍后重试',
        retryAfter: rateLimitResult.retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          'X-RateLimit-Limit': config.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString()
        }
      }
    );
  }

  // 执行原始处理器
  const response = await handler();
  
  // 添加速率限制headers
  response.headers.set('X-RateLimit-Limit', config.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toISOString());
  
  return response;
}

/**
 * 批量检查多个速率限制
 */
export async function checkMultipleRateLimits(
  supabase: any,
  checks: Array<{ key: string; config: RateLimitConfig }>
): Promise<RateLimitResult[]> {
  const results = await Promise.all(
    checks.map(check => checkRateLimit(supabase, check.key, check.config))
  );
  
  return results;
}

/**
 * 手动重置速率限制（管理员功能）
 */
export async function resetRateLimit(supabase: any, key: string): Promise<boolean> {
  try {
    await supabase
      .from('rate_limits')
      .delete()
      .eq('key', key);
    return true;
  } catch (error) {
    console.error('Failed to reset rate limit:', error);
    return false;
  }
}