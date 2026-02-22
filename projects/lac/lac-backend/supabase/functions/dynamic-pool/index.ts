import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { checkRateLimit, RATE_LIMITS, getClientIP, createRateLimitKey } from '../_shared/rate-limiter.ts';

interface DynamicPoolResponse {
  success: boolean;
  data?: {
    date: string;
    daily_budget: number;
    decay_factor: number;
    participants: number;
    base_reward: number;
    floor: number;
    ceiling: number;
    years_elapsed: number;
    pool_utilization: number; // 矿池使用率
    estimated_personal_reward: number; // 预估个人奖励
    next_day_preview: {
      date: string;
      estimated_budget: number;
      decay_factor: number;
    };
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

    // 速率限制检查：每IP每分钟最多20次
    const ipRateLimit = await checkRateLimit(
      supabase,
      createRateLimitKey('ip', clientIP, 'dynamic-pool'),
      { limit: 20, window: 60, penalty: 300 } // 20 requests per minute
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

    // 获取查询参数
    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date');
    const userId = url.searchParams.get('user_id'); // 可选，用于计算个人预估奖励

    // 确定查询日期
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const dateStr = targetDate.toISOString().split('T')[0];

    // 获取矿池基础配置
    const { data: configs } = await supabase
      .from('system_config')
      .select('key, value')
      .in('key', [
        'mining.pool.total_supply',
        'mining.pool.daily_ratio', 
        'mining.pool.decay_factor_annual',
        'mining.pool.reward_floor',
        'mining.pool.reward_ceiling',
        'mining.pool.launch_date'
      ]);

    if (!configs || configs.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: '系统配置未找到' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 转换配置为对象
    const config = configs.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, any>);

    // 调用数据库函数计算衰减系数
    const { data: decayResult, error: decayError } = await supabase
      .rpc('get_decay_factor', { target_date: dateStr });

    if (decayError) {
      console.error('计算衰减系数失败:', decayError);
      return new Response(
        JSON.stringify({ success: false, error: '计算衰减系数失败' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 调用数据库函数计算每日预算
    const { data: budgetResult, error: budgetError } = await supabase
      .rpc('calculate_daily_budget', { target_date: dateStr });

    if (budgetError) {
      console.error('计算每日预算失败:', budgetError);
      return new Response(
        JSON.stringify({ success: false, error: '计算每日预算失败' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 调用数据库函数获取参与人数
    const { data: participantsResult, error: participantsError } = await supabase
      .rpc('get_daily_participants', { target_date: dateStr });

    if (participantsError) {
      console.error('获取参与人数失败:', participantsError);
      return new Response(
        JSON.stringify({ success: false, error: '获取参与人数失败' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dailyBudget = parseFloat(budgetResult) || 0;
    const participants = participantsResult || 1;
    const decayFactor = parseFloat(decayResult) || 1.0;
    const floor = parseFloat(config['mining.pool.reward_floor']) || 5;
    const ceiling = parseFloat(config['mining.pool.reward_ceiling']) || 500;

    // 计算人均基础奖励
    let baseReward = participants > 0 ? dailyBudget / participants : floor;
    
    // 应用上下限
    baseReward = Math.max(floor, Math.min(ceiling, baseReward));

    // 计算经过年数
    const launchDate = new Date(config['mining.pool.launch_date']);
    const yearsElapsed = (targetDate.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    // 计算矿池利用率（今日实际发放/预算）
    const { data: actualRewards } = await supabase
      .from('mining_records')
      .select('lac_earned')
      .gte('created_at', `${dateStr}T00:00:00Z`)
      .lt('created_at', `${dateStr}T23:59:59Z`)
      .eq('status', 'completed');

    const totalActualRewards = actualRewards?.reduce((sum, record) => 
      sum + parseFloat(record.lac_earned), 0) || 0;
    
    const poolUtilization = dailyBudget > 0 ? (totalActualRewards / dailyBudget) * 100 : 0;

    // 估算个人奖励（如果提供了user_id）
    let estimatedPersonalReward = baseReward;
    if (userId) {
      // 可以根据用户等级、连续签到等因素调整
      const { data: userData } = await supabase
        .from('users')
        .select('level, streak_days')
        .eq('id', userId)
        .single();

      if (userData) {
        // 等级加成：每级+5%
        const levelBonus = 1 + (userData.level - 1) * 0.05;
        
        // 连续签到加成（简化版本）
        let streakBonus = 1.0;
        if (userData.streak_days >= 30) streakBonus = 1.5;
        else if (userData.streak_days >= 14) streakBonus = 1.4;
        else if (userData.streak_days >= 7) streakBonus = 1.2;
        
        estimatedPersonalReward = baseReward * levelBonus * streakBonus;
        estimatedPersonalReward = Math.max(floor, Math.min(ceiling, estimatedPersonalReward));
      }
    }

    // 计算明日预览
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    const { data: nextDayDecay } = await supabase
      .rpc('get_decay_factor', { target_date: nextDayStr });

    const { data: nextDayBudget } = await supabase
      .rpc('calculate_daily_budget', { target_date: nextDayStr });

    const response: DynamicPoolResponse = {
      success: true,
      data: {
        date: dateStr,
        daily_budget: Math.round(dailyBudget * 100) / 100,
        decay_factor: Math.round(decayFactor * 10000) / 10000,
        participants: participants,
        base_reward: Math.round(baseReward * 100) / 100,
        floor: floor,
        ceiling: ceiling,
        years_elapsed: Math.round(yearsElapsed * 100) / 100,
        pool_utilization: Math.round(poolUtilization * 100) / 100,
        estimated_personal_reward: Math.round(estimatedPersonalReward * 100) / 100,
        next_day_preview: {
          date: nextDayStr,
          estimated_budget: Math.round(parseFloat(nextDayBudget) * 100) / 100,
          decay_factor: Math.round(parseFloat(nextDayDecay) * 10000) / 10000
        }
      }
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Dynamic Pool Error:', error);
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

/* Deno.test("Dynamic Pool API Test", async () => {
  // Note: This would require proper test setup with test database
  const req = new Request("http://localhost:8000/dynamic-pool");
  const response = await serve(req);
  
  // Assertions would go here
}); */