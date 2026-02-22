// mining-use Edge Function
// 功能：AI工具使用记录+挖矿

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { action, user_id, tool_name, input_text, output_text, limit = 10, page = 1 } = await req.json()

    if (!action) {
      return new Response(
        JSON.stringify({ error: '缺少action参数' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    switch (action) {
      case 'record':
        return await handleRecord(supabaseClient, { user_id, tool_name, input_text, output_text })
      case 'history':
        return await handleHistory(supabaseClient, { user_id, limit, page })
      default:
        return new Response(
          JSON.stringify({ error: '无效的action参数' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function handleRecord(supabaseClient, { user_id, tool_name, input_text, output_text }) {
  // 验证参数
  if (!user_id || !tool_name || !input_text || !output_text) {
    return new Response(
      JSON.stringify({ error: '缺少必要参数: user_id, tool_name, input_text, output_text' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // 验证输入输出长度
  const inputLength = input_text.trim().length
  const outputLength = output_text.trim().length

  if (inputLength < 20) {
    return new Response(
      JSON.stringify({ error: '输入文本至少需要20字', input_length: inputLength }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  if (outputLength < 50) {
    return new Response(
      JSON.stringify({ error: '输出文本至少需要50字', output_length: outputLength }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // 检查每日使用限制
  const { data: limitCheck, error: limitError } = await supabaseClient.rpc('check_daily_usage_limit', {
    p_user_id: user_id,
    p_tool_name: tool_name,
  })

  if (limitError) {
    console.error('Limit check error:', limitError)
    return new Response(
      JSON.stringify({ error: '检查使用限制失败', details: limitError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  if (!limitCheck || !limitCheck.allowed) {
    return new Response(
      JSON.stringify({ 
        error: '已达到每日使用限制',
        details: limitCheck
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // 计算LAC奖励
  const { data: rewardData, error: rewardError } = await supabaseClient.rpc('calculate_lac_reward', {
    p_input_length: inputLength,
    p_output_length: outputLength,
  })

  if (rewardError) {
    console.error('Reward calculation error:', rewardError)
    return new Response(
      JSON.stringify({ error: '计算奖励失败', details: rewardError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  const lacReward = rewardData || 10.0

  // 插入使用记录
  const { data: usageData, error: usageError } = await supabaseClient
    .from('user_ai_tool_usage')
    .insert({
      user_id,
      tool_name,
      input_text,
      output_text,
      input_length: inputLength,
      output_length: outputLength,
      lac_reward: lacReward,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (usageError) {
    console.error('Usage insert error:', usageError)
    return new Response(
      JSON.stringify({ error: '记录使用失败', details: usageError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // 更新每日使用计数
  const { error: updateError } = await supabaseClient.rpc('update_daily_usage_count', {
    p_user_id: user_id,
    p_tool_name: tool_name,
  })

  if (updateError) {
    console.error('Update usage count error:', updateError)
    // 这里不返回错误，因为使用记录已经成功插入
  }

  // 更新挖矿记录
  const { error: miningError } = await supabaseClient
    .from('mining_records')
    .insert({
      user_id,
      mining_type: 'use',
      action: 'use_tool',
      source_id: usageData.id,
      source_type: 'ai_tool',
      source_name: tool_name,
      base_amount: lacReward,
      lac_earned: lacReward,
      metadata: {
        tool_name,
        input_length: inputLength,
        output_length: outputLength,
      },
    })

  if (miningError) {
    console.error('Mining record error:', miningError)
    // 这里不返回错误，因为使用记录已经成功插入
  }

  // 更新每日挖矿统计
  const { error: statsError } = await supabaseClient.rpc('update_daily_mining_stats', {
    p_user_id: user_id,
    p_mining_type: 'use',
    p_lac_amount: lacReward,
  })

  if (statsError) {
    console.error('Stats update error:', statsError)
    // 这里不返回错误，因为使用记录已经成功插入
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: '使用记录已保存',
      data: {
        id: usageData.id,
        tool_name,
        input_length: inputLength,
        output_length: outputLength,
        lac_reward: lacReward,
        created_at: usageData.created_at,
        daily_limits: limitCheck,
      },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function handleHistory(supabaseClient, { user_id, limit, page }) {
  if (!user_id) {
    return new Response(
      JSON.stringify({ error: '缺少user_id参数' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  const offset = (page - 1) * limit

  // 获取使用历史
  const { data: historyData, error: historyError } = await supabaseClient.rpc('get_user_tool_usage_history', {
    p_user_id: user_id,
    p_limit: limit,
    p_offset: offset,
  })

  if (historyError) {
    console.error('History fetch error:', historyError)
    return new Response(
      JSON.stringify({ error: '获取历史记录失败', details: historyError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // 获取总记录数
  const { count, error: countError } = await supabaseClient
    .from('user_ai_tool_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user_id)

  if (countError) {
    console.error('Count error:', countError)
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: historyData || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}