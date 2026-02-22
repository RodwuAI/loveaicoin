import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { checkRateLimit, getClientIP, createRateLimitKey } from '../_shared/rate-limiter.ts';

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
    pool_utilization: number;
    estimated_personal_reward: number;
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

    // 速率限制检查
    const ipRateLimit = await checkRateLimit(
      supabase,
      createRateLimitKey('ip', clientIP, 'dynamic-pool'),
      { limit: 20, window: 60, penalty: 300 }
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
    const dateParam = url.searchParams.get('date');
    const userId = url.searchParams.get('user_id');

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const dateStr = targetDate.toISOString().split('T')[0];

    // 硬编码配置（简化版本，实际生产中应该从配置表读取）
    const config = {
      totalSupply: 100000000000, // 100亿
      dailyRatio: 0.45, // 45%
      annualDecay: 0.65,
      floor: 5,
      ceiling: 500,
      launchDate: new Date('2024-01-01')
    };

    // 计算经过年数
    const yearsElapsed = (targetDate.getTime() - config.launchDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    // 计算衰减系数
    let decayFactor = 1.0;
    if (yearsElapsed > 1) {
      decayFactor = Math.pow(config.annualDecay, Math.floor(yearsElapsed));
    }
    decayFactor = Math.max(decayFactor, 0.01); // 最低0.01

    // 计算每日预算
    const dailyBudget = (config.totalSupply * config.dailyRatio * decayFactor) / 365.0;

    // 获取今日参与挖矿的用户数（简化查询）
    const { data: miningData, error: miningError } = await supabase
      .from('mining_records')
      .select('user_id')
      .gte('created_at', `${dateStr}T00:00:00Z`)
      .lt('created_at', `${dateStr}T23:59:59Z`)
      .eq('status', 'completed');

    if (miningError) {
      console.error('获取挖矿数据失败:', miningError);
    }

    // 计算独特参与用户数
    const uniqueUsers = new Set((miningData || []).map(record => record.user_id));
    const participants = Math.max(uniqueUsers.size, 100); // 至少100（平滑启动）

    // 计算基础奖励
    const baseReward = Math.max(config.floor, Math.min(config.ceiling, dailyBudget / participants));

    // 计算矿池使用率
    const { data: rewardsData } = await supabase
      .from('mining_records')
      .select('lac_earned')
      .gte('created_at', `${dateStr}T00:00:00Z`)
      .lt('created_at', `${dateStr}T23:59:59Z`)
      .eq('status', 'completed');

    const totalActualRewards = (rewardsData || []).reduce((sum, record) => 
      sum + parseFloat(record.lac_earned), 0);
    
    const poolUtilization = dailyBudget > 0 ? (totalActualRewards / dailyBudget) * 100 : 0;

    // 估算个人奖励
    let estimatedPersonalReward = baseReward;
    if (userId) {
      const { data: userData } = await supabase
        .from('users')
        .select('level, streak_days')
        .eq('id', userId)
        .single();

      if (userData) {
        const levelBonus = 1 + (userData.level - 1) * 0.05;
        let streakBonus = 1.0;
        
        if (userData.streak_days >= 30) streakBonus = 1.5;
        else if (userData.streak_days >= 14) streakBonus = 1.4;
        else if (userData.streak_days >= 7) streakBonus = 1.2;
        
        estimatedPersonalReward = baseReward * levelBonus * streakBonus;
        estimatedPersonalReward = Math.max(config.floor, Math.min(config.ceiling, estimatedPersonalReward));
      }
    }

    // 明日预览
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    const nextYearsElapsed = (nextDay.getTime() - config.launchDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    let nextDecayFactor = 1.0;
    if (nextYearsElapsed > 1) {
      nextDecayFactor = Math.pow(config.annualDecay, Math.floor(nextYearsElapsed));
    }
    nextDecayFactor = Math.max(nextDecayFactor, 0.01);

    const nextDayBudget = (config.totalSupply * config.dailyRatio * nextDecayFactor) / 365.0;

    const response: DynamicPoolResponse = {
      success: true,
      data: {
        date: dateStr,
        daily_budget: Math.round(dailyBudget * 100) / 100,
        decay_factor: Math.round(decayFactor * 10000) / 10000,
        participants: participants,
        base_reward: Math.round(baseReward * 100) / 100,
        floor: config.floor,
        ceiling: config.ceiling,
        years_elapsed: Math.round(yearsElapsed * 100) / 100,
        pool_utilization: Math.round(poolUtilization * 100) / 100,
        estimated_personal_reward: Math.round(estimatedPersonalReward * 100) / 100,
        next_day_preview: {
          date: nextDayStr,
          estimated_budget: Math.round(nextDayBudget * 100) / 100,
          decay_factor: Math.round(nextDecayFactor * 10000) / 10000
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