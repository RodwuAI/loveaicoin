// content-submit Edge Function
// 功能：内容创作提交+审核

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

    const { 
      action, 
      user_id, 
      title, 
      content, 
      content_type = 'article',
      content_id,
      status,
      reviewer_note,
      limit = 10,
      page = 1
    } = await req.json()

    if (!action) {
      return new Response(
        JSON.stringify({ error: '缺少action参数' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    switch (action) {
      case 'submit':
        return await handleSubmit(supabaseClient, { user_id, title, content, content_type })
      case 'list':
        return await handleList(supabaseClient, { user_id, status, limit, page })
      case 'review':
        return await handleReview(supabaseClient, { content_id, status, reviewer_note })
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

async function handleSubmit(supabaseClient, { user_id, title, content, content_type }) {
  // 验证参数
  if (!user_id || !title || !content) {
    return new Response(
      JSON.stringify({ error: '缺少必要参数: user_id, title, content' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // 验证内容类型
  if (!['article', 'video'].includes(content_type)) {
    return new Response(
      JSON.stringify({ error: '内容类型必须是 article 或 video' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // 验证内容要求
  const { data: isValid, error: validationError } = await supabaseClient.rpc('validate_content_submission', {
    p_content: content,
    p_content_type: content_type,
  })

  if (validationError) {
    console.error('Validation error:', validationError)
    return new Response(
      JSON.stringify({ error: '内容验证失败', details: validationError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  if (!isValid) {
    const requirement = content_type === 'article' ? '至少800字' : '至少150字（3分钟说明）'
    return new Response(
      JSON.stringify({ 
        error: `内容不符合要求：${requirement}`,
        content_length: content.trim().length,
        content_type
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // 插入内容记录
  const { data: contentData, error: insertError } = await supabaseClient
    .from('teaching_contents')
    .insert({
      author_id: user_id,
      title,
      content,
      content_type,
      status: 'pending', // 初始状态为待审核
      category: 'user_generated',
      difficulty: 2,
      metadata: {
        submitted_at: new Date().toISOString(),
        content_length: content.trim().length,
      },
    })
    .select()
    .single()

  if (insertError) {
    console.error('Insert content error:', insertError)
    return new Response(
      JSON.stringify({ error: '提交内容失败', details: insertError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // 创建挖矿记录（内容创作挖矿）
  const { error: miningError } = await supabaseClient
    .from('mining_records')
    .insert({
      user_id,
      mining_type: 'create',
      action: 'submit_content',
      source_id: contentData.id,
      source_type: 'teaching_content',
      source_name: title,
      base_amount: 200, // 基础奖励200 LAC
      lac_earned: 200,
      status: 'pending', // 挖矿奖励待审核
      metadata: {
        title,
        content_type,
        content_length: content.trim().length,
      },
    })

  if (miningError) {
    console.error('Mining record error:', miningError)
    // 这里不返回错误，因为内容记录已经成功插入
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: '内容提交成功，等待审核',
      data: {
        id: contentData.id,
        title,
        content_type,
        content_length: content.trim().length,
        status: 'pending',
        created_at: contentData.created_at,
      },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function handleList(supabaseClient, { user_id, status, limit, page }) {
  const offset = (page - 1) * limit

  // 获取内容列表
  const { data: contentData, error: contentError } = await supabaseClient.rpc('get_content_list', {
    p_user_id: user_id || null,
    p_status: status || null,
    p_limit: limit,
    p_offset: offset,
  })

  if (contentError) {
    console.error('Get content error:', contentError)
    return new Response(
      JSON.stringify({ error: '获取内容列表失败', details: contentError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // 获取总记录数
  let totalCount = 0
  let countError = null

  if (user_id) {
    const { count, error } = await supabaseClient
      .from('teaching_contents')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', user_id)
      .eq('status', status || 'published')
    
    totalCount = count || 0
    countError = error
  } else {
    const { count, error } = await supabaseClient
      .from('teaching_contents')
      .select('*', { count: 'exact', head: true })
      .eq('status', status || 'published')
    
    totalCount = count || 0
    countError = error
  }

  if (countError) {
    console.error('Count error:', countError)
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: contentData || [],
      pagination: {
        page,
        limit,
        total: totalCount,
        total_pages: Math.ceil(totalCount / limit),
      },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

async function handleReview(supabaseClient, { content_id, status, reviewer_note }) {
  // 验证参数
  if (!content_id || !status) {
    return new Response(
      JSON.stringify({ error: '缺少必要参数: content_id, status' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // 验证状态
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return new Response(
      JSON.stringify({ error: '状态必须是 approved, rejected 或 pending' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // 获取内容信息
  const { data: contentData, error: contentError } = await supabaseClient
    .from('teaching_contents')
    .select('*')
    .eq('id', content_id)
    .single()

  if (contentError) {
    console.error('Get content error:', contentError)
    return new Response(
      JSON.stringify({ error: '获取内容失败', details: contentError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // 更新内容状态
  const { data: updatedContent, error: updateError } = await supabaseClient
    .from('teaching_contents')
    .update({
      status,
      reviewer_note,
      reviewed_at: new Date().toISOString(),
      metadata: {
        ...contentData.metadata,
        reviewed_at: new Date().toISOString(),
        review_status: status,
      },
    })
    .eq('id', content_id)
    .select()
    .single()

  if (updateError) {
    console.error('Update content error:', updateError)
    return new Response(
      JSON.stringify({ error: '更新内容状态失败', details: updateError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // 如果审核通过，更新挖矿记录状态
  if (status === 'approved') {
    // 更新挖矿记录状态为完成
    const { error: miningUpdateError } = await supabaseClient
      .from('mining_records')
      .update({
        status: 'completed',
        metadata: {
          ...contentData.metadata,
          approved_at: new Date().toISOString(),
        },
      })
      .eq('source_id', content_id)
      .eq('source_type', 'teaching_content')

    if (miningUpdateError) {
      console.error('Update mining record error:', miningUpdateError)
      // 这里不返回错误，因为内容状态已经成功更新
    }

    // 更新每日挖矿统计
    const { error: statsError } = await supabaseClient.rpc('update_daily_mining_stats', {
      p_user_id: contentData.author_id,
      p_mining_type: 'create',
      p_lac_amount: 200,
    })

    if (statsError) {
      console.error('Stats update error:', statsError)
      // 这里不返回错误，因为内容状态已经成功更新
    }
  } else if (status === 'rejected') {
    // 如果审核拒绝，更新挖矿记录状态为取消
    const { error: miningUpdateError } = await supabaseClient
      .from('mining_records')
      .update({
        status: 'cancelled',
        metadata: {
          ...contentData.metadata,
          rejected_at: new Date().toISOString(),
          reviewer_note,
        },
      })
      .eq('source_id', content_id)
      .eq('source_type', 'teaching_content')

    if (miningUpdateError) {
      console.error('Update mining record error:', miningUpdateError)
      // 这里不返回错误，因为内容状态已经成功更新
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `内容已${status === 'approved' ? '审核通过' : status === 'rejected' ? '审核拒绝' : '重新待审核'}`,
      data: {
        id: updatedContent.id,
        title: updatedContent.title,
        status: updatedContent.status,
        reviewer_note: updatedContent.reviewer_note,
        reviewed_at: updatedContent.reviewed_at,
      },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}