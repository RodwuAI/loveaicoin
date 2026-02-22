import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { checkRateLimit, getClientIP, createRateLimitKey } from '../_shared/rate-limiter.ts';

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

    // 速率限制检查
    const ipRateLimit = await checkRateLimit(
      supabase,
      createRateLimitKey('ip', clientIP, 'mining-streak'),
      { limit: 30, window: 60, penalty: 300 }
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

    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    const dateParam = url.searchParams.get('date');

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

    const currentDate = dateParam ? new Date(dateParam) : new Date();
    const dateStr = currentDate.toISOString().split('T')[0];

    // 连续签到配置
    const milestones = [7, 14, 30, 60, 90];
    const multipliers: Record<number, number> = {
      7: 1.2,
      14: 1.4,
      30: 1.5,
      60: 2.0,
      90: 2.5
    };

    // 计算连续签到天数
    let streakDays = 0;
    let tempDate = new Date(currentDate);
    let foundGap = false;

    // 向前查找连续签到记录，最多查365天
    while (!foundGap && streakDays < 365) {
      const checkDateStr = tempDate.toISOString().split('T')[0];
      
      const { data: checkinRecord, error } = await supabase
        .from('checkin_records')
        .select('id')
        .eq('user_id', userId)
        .eq('checkin_date', checkDateStr)
        .single();

      if (error || !checkinRecord) {
        foundGap = true;
      } else {
        streakDays++;
        tempDate.setDate(tempDate.getDate() - 1);
      }
    }

    // 计算倍率：找到最大的已达到里程碑
    let multiplier = 1.0;
    for (const milestone of milestones) {
      if (streakDays >= milestone) {
        multiplier = multipliers[milestone];
      }
    }

    // 找到下一个里程碑
    let nextMilestone: number | null = null;
    for (const milestone of milestones) {
      if (streakDays < milestone) {
        nextMilestone = milestone;
        break;
      }
    }

    // 找到已达成的里程碑
    const achievedMilestones = milestones.filter(milestone => streakDays >= milestone);

    const response: StreakResponse = {
      success: true,
      data: {
        user_id: userId,
        streak_days: streakDays,
        multiplier: Math.round(multiplier * 100) / 100,
        next_milestone: nextMilestone,
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