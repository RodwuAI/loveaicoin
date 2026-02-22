import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { checkRateLimit, RATE_LIMITS, getClientIP, createRateLimitKey } from '../_shared/rate-limiter.ts';

interface StreakResponse {
  success: boolean;
  data?: {
    user_id: string;
    streak_days: number;
    multiplier: number;
    next_milestone: number | null;
    milestones_achieved: number[];
    current_date: string;
  };
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const clientIP = getClientIP(req);

    // 速率限制检查：每IP每分钟最多30次
    const ipRateLimit = await checkRateLimit(
      supabase,
      createRateLimitKey('ip', clientIP, 'mining-streak'),
      { limit: 30, window: 60, penalty: 300 } // 30 requests per minute
    );

    if (!ipRateLimit.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '请求过于频繁，请稍后重试',
          retryAfter: ipRateLimit.retryAfter
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            'Retry-After': ipRateLimit.retryAfter?.toString() || '60'
          }
        }
      );
    }

    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ success: false, error: '仅支持GET请求' }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 获取用户ID参数
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    const dateParam = url.searchParams.get('date'); // 可选的日期参数，用于查看历史数据

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少必需的user_id参数' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 验证用户存在
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: '用户不存在' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 确定查询日期
    const currentDate = dateParam ? new Date(dateParam) : new Date();
    const dateStr = currentDate.toISOString().split('T')[0];

    // 调用数据库函数计算连续签到天数
    const { data: streakData, error: streakError } = await supabase
      .rpc('calculate_user_streak', {
        p_user_id: userId,
        p_current_date: dateStr
      });

    if (streakError) {
      console.error('计算连续签到失败:', streakError);
      return new Response(
        JSON.stringify({ success: false, error: '计算连续签到失败' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 获取已达成的里程碑
    const { data: milestoneConfig } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'mining.streak.milestones')
      .single();

    const allMilestones = milestoneConfig?.value as number[] || [7, 14, 30, 60, 90];
    const achievedMilestones = allMilestones.filter(milestone => 
      streakData && streakData.length > 0 && streakData[0].streak_days >= milestone
    );

    const response: StreakResponse = {
      success: true,
      data: {
        user_id: userId,
        streak_days: streakData?.[0]?.streak_days || 0,
        multiplier: streakData?.[0]?.multiplier || 1.0,
        next_milestone: streakData?.[0]?.next_milestone || null,
        milestones_achieved: achievedMilestones,
        current_date: dateStr
      }
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Mining Streak Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '服务器内部错误'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

/* Deno.test("Mining Streak API Test", async () => {
  // Note: This would require proper test setup with test database
  const req = new Request("http://localhost:8000/mining-streak?user_id=test-uuid");
  const response = await serve(req);
  
  // Assertions would go here
}); */