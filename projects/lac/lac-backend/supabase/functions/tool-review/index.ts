// tool-review Edge Function
// 功能：工具评测提交

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

    const { action, user_id, tool_name, rating, review_text, limit = 10 } = await req.json()

    if (!action) {
      return new Response(
        JSON.stringify({ error: '缺少action参数' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    switch (action) {
      case 'submit':
        return await handleSubmit(supabaseClient, { user_id, tool_name, rating, review_text })
      case 'list':
        return await handleList(supabaseClient, { tool_name, limit })
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

async function handleSubmit(supabaseClient, { user_id, tool_name, rating, review_text }) {
  // 验证参数
  if (!user_id || !tool_name || !rating || !review_text) {
    return new Response(
      JSON.stringify({ error: '缺少必要参数: user_id, tool_name, rating, review_text' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // 验证评分范围
  if (rating < 1 || rating > 5) {
    return new Response(
      JSON.stringify({ error: '评分必须在1-5之间' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // 验证评测内容长度
  const reviewLength = review_text.trim().length
  if (reviewLength < 100) {
    return new Response(
      JSON.stringify({ error: '评测内容至少需要100字', review_length: reviewLength }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // 检查用户是否已经评测过该工具
  const { data: existingReview, error: checkError } = await supabaseClient
    .from('tool_reviews')
    .select('id')
    .eq('user_id', user_id)
    .eq('tool_name', tool_name)
    .single()

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Check existing review error:', checkError)
    return new Response(
      JSON.stringify({ error: '检查现有评测失败', details: checkError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  if (existingReview) {
    return new Response(
      JSON.stringify({ error: '您已经评测过该工具，每人每工具只能评测一次' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // 检查用户是否有该工具的使用记录
  const { data: hasUsage, error: usageError } = await supabaseClient.rpc('has_tool_usage_record', {
    p_user_id: user_id,
    p_tool_name: tool_name,
  })

  if (usageError) {
    console.error('Check usage error:', usageError)
    return new Response(
      JSON.stringify({ error: '检查使用记录失败', details: usageError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  if (!hasUsage) {
    return new Response(
      JSON.stringify({ error: '您需要先使用该工具才能进行评测' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // 插入评测记录
  const { data: reviewData, error: insertError } = await supabaseClient
    .from('tool_reviews')
    .insert({
      user_id,
      tool_name,
      rating,
      review_text,
      usage_verified: true,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Insert review error:', insertError)
    return new Response(
      JSON.stringify({ error: '提交评测失败', details: insertError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // 更新挖矿记录（评测作为教导挖矿）
  const { error: miningError } = await supabaseClient
    .from('mining_records')
    .insert({
      user_id,
      mining_type: 'teach',
      action: 'submit_review',
      source_id: reviewData.id,
      source_type: 'tool_review',
      source_name: tool_name,
      base_amount: 30, // 基础奖励30 LAC
      lac_earned: 30,
      metadata: {
        tool_name,
        rating,
        review_length: reviewLength,
      },
    })

  if (miningError) {
    console.error('Mining record error:', miningError)
    // 这里不返回错误，因为评测记录已经成功插入
  }

  // 更新每日挖矿统计
  const { error: statsError } = await supabaseClient.rpc('update_daily_mining_stats', {
    p_user_id: user_id,
    p_mining_type: 'teach',
    p_lac_amount: 30,
  })

  if (statsError) {
    console.error('Stats update error:', statsError)
    // 这里不返回错误，因为评测记录已经成功插入
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: '评测提交成功',
      data: {
        id: reviewData.id,
        tool_name,
        rating,
        review_length: reviewLength,
        usage_verified: true,
        created_at: reviewData.created_at,
      },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function handleList(supabaseClient, { tool_name, limit }) {
  // 获取评测列表
  const { data: reviewsData, error: reviewsError } = await supabaseClient.rpc('get_tool_reviews', {
    p_tool_name: tool_name || null,
    p_limit: limit,
    p_offset: 0,
  })

  if (reviewsError) {
    console.error('Get reviews error:', reviewsError)
    return new Response(
      JSON.stringify({ error: '获取评测列表失败', details: reviewsError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // 计算平均评分
  let averageRating = 0
  let totalReviews = 0
  let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  if (reviewsData && reviewsData.length > 0) {
    totalReviews = reviewsData.length
    let totalRating = 0
    
    reviewsData.forEach(review => {
      totalRating += review.rating
      ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1
    })
    
    averageRating = totalRating / totalReviews
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: reviewsData || [],
      stats: {
        total_reviews: totalReviews,
        average_rating: Math.round(averageRating * 10) / 10,
        rating_distribution: ratingDistribution,
      },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}