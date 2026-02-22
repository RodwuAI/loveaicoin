import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// 一次性运行的初始化函数，用于设置动态矿池系统
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

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: '仅支持POST请求' }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: 插入系统配置
    const configs = [
      {
        key: 'mining.pool.total_supply',
        value: '100000000000',
        description: '总供应量100亿LAC'
      },
      {
        key: 'mining.pool.daily_ratio',
        value: '0.45',
        description: '每日释放比例45%'
      },
      {
        key: 'mining.pool.decay_factor_annual',
        value: '0.65',
        description: '年化衰减系数'
      },
      {
        key: 'mining.pool.reward_floor',
        value: '5',
        description: '最低奖励5 LAC'
      },
      {
        key: 'mining.pool.reward_ceiling',
        value: '500',
        description: '最高奖励500 LAC'
      },
      {
        key: 'mining.streak.multipliers',
        value: JSON.stringify({"7": 1.2, "14": 1.4, "30": 1.5, "60": 2.0, "90": 2.5}),
        description: '连续签到奖励倍率'
      },
      {
        key: 'mining.streak.milestones',
        value: JSON.stringify([7, 14, 30, 60, 90]),
        description: '连续签到里程碑天数'
      },
      {
        key: 'mining.pool.launch_date',
        value: '"2024-01-01"',
        description: '挖矿系统启动日期'
      },
      {
        key: 'mining.pool.participant_threshold',
        value: '1',
        description: '最低参与人数阈值'
      },
      {
        key: 'mining.pool.base_participants',
        value: '100',
        description: '基础参与人数（用于平滑启动）'
      }
    ];

    // 批量插入配置
    for (const config of configs) {
      await supabase
        .from('system_config')
        .upsert(config, { onConflict: 'key' });
    }

    // Step 2: 创建必需的数据库函数
    const functions = [
      // get_decay_factor 函数
      `
        CREATE OR REPLACE FUNCTION get_decay_factor(target_date DATE DEFAULT CURRENT_DATE)
        RETURNS DECIMAL(10,8) AS $$
        DECLARE
          launch_date DATE;
          years_elapsed DECIMAL(10,4);
          annual_decay DECIMAL(3,2);
          decay_factor DECIMAL(10,8);
        BEGIN
          SELECT (value #>> '{}')::DATE INTO launch_date FROM system_config WHERE key = 'mining.pool.launch_date';
          SELECT (value #>> '{}')::DECIMAL(3,2) INTO annual_decay FROM system_config WHERE key = 'mining.pool.decay_factor_annual';
          
          years_elapsed := EXTRACT(EPOCH FROM (target_date - launch_date)) / (365.25 * 24 * 3600);
          
          IF years_elapsed <= 1 THEN
            decay_factor := 1.0;
          ELSE
            decay_factor := POWER(annual_decay, FLOOR(years_elapsed));
          END IF;
          
          RETURN GREATEST(decay_factor, 0.01);
        END;
        $$ LANGUAGE plpgsql STABLE;
      `,
      
      // calculate_daily_budget 函数
      `
        CREATE OR REPLACE FUNCTION calculate_daily_budget(target_date DATE DEFAULT CURRENT_DATE)
        RETURNS DECIMAL(20,6) AS $$
        DECLARE
          total_supply DECIMAL(20,0);
          daily_ratio DECIMAL(5,4);
          decay_factor DECIMAL(10,8);
          daily_budget DECIMAL(20,6);
        BEGIN
          SELECT (value #>> '{}')::DECIMAL(20,0) INTO total_supply FROM system_config WHERE key = 'mining.pool.total_supply';
          SELECT (value #>> '{}')::DECIMAL(5,4) INTO daily_ratio FROM system_config WHERE key = 'mining.pool.daily_ratio';
          
          decay_factor := get_decay_factor(target_date);
          
          daily_budget := (total_supply * daily_ratio * decay_factor) / 365.0;
          
          RETURN daily_budget;
        END;
        $$ LANGUAGE plpgsql STABLE;
      `,
      
      // get_daily_participants 函数
      `
        CREATE OR REPLACE FUNCTION get_daily_participants(target_date DATE DEFAULT CURRENT_DATE)
        RETURNS INTEGER AS $$
        DECLARE
          participant_count INTEGER;
          threshold INTEGER;
          base_participants INTEGER;
        BEGIN
          SELECT COUNT(DISTINCT user_id) INTO participant_count
          FROM mining_records
          WHERE DATE(created_at) = target_date
          AND status = 'completed';
          
          SELECT (value #>> '{}')::INTEGER INTO threshold FROM system_config WHERE key = 'mining.pool.participant_threshold';
          SELECT (value #>> '{}')::INTEGER INTO base_participants FROM system_config WHERE key = 'mining.pool.base_participants';
          
          RETURN GREATEST(participant_count, threshold, 
                         CASE WHEN participant_count < base_participants THEN base_participants ELSE participant_count END);
        END;
        $$ LANGUAGE plpgsql STABLE;
      `,
      
      // calculate_user_streak 函数
      `
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
          SELECT value INTO config FROM system_config WHERE key = 'mining.streak.multipliers';
          SELECT value INTO milestones FROM system_config WHERE key = 'mining.streak.milestones';
          
          temp_date := p_current_date;
          
          WHILE NOT found_gap AND temp_date >= p_current_date - INTERVAL '365 days' LOOP
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
          
          FOR i IN 1..array_length(milestones, 1) LOOP
            IF current_streak >= milestones[i] THEN
              milestone_multiplier := (config ->> milestones[i]::TEXT)::DECIMAL(3,2);
            END IF;
          END LOOP;
          
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
      `
    ];

    // 执行数据库函数创建
    for (const func of functions) {
      const { error } = await supabase.rpc('exec_sql', { query: func });
      if (error) {
        console.error('创建函数失败:', error);
      }
    }

    // 尝试直接执行SQL（如果有exec_sql函数的话）
    let sqlExecuted = false;
    try {
      for (const func of functions) {
        await supabase.rpc('query', { query: func });
      }
      sqlExecuted = true;
    } catch (error) {
      console.log('直接执行SQL失败，使用其他方法:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '动态矿池系统初始化完成',
        data: {
          configs_inserted: configs.length,
          functions_created: sqlExecuted ? functions.length : 0,
          note: sqlExecuted ? '所有数据库函数已创建' : '配置已插入，请手动创建数据库函数'
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('初始化失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '初始化失败'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});