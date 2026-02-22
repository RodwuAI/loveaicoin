import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: '只支持POST请求' }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. 验证用户身份
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: '未提供认证信息' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: session } = await supabase
      .from('user_sessions')
      .select('user_id')
      .eq('session_token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session) {
      return new Response(
        JSON.stringify({ success: false, error: '认证失败或会话已过期' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = session.user_id;
    // Accept both courseId and lessonId for compatibility
    const body = await req.json();
    const courseId = body.courseId || body.lessonId || body.course_id;
    const timeSpent = body.timeSpent || body.time_spent || 30;

    if (!courseId) {
      return new Response(
        JSON.stringify({ success: false, error: '课程ID不能为空' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. 获取课程信息（直接从courses表）
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return new Response(
        JSON.stringify({ success: false, error: '课程不存在' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. 检查是否已完成过（防止重复奖励）
    const { data: existingRecord } = await supabase
      .from('mining_records')
      .select('id')
      .eq('user_id', userId)
      .eq('source_id', courseId)
      .eq('mining_type', 'learn')
      .single();

    const isFirstCompletion = !existingRecord;

    // 4. 防作弊：时间太短
    if (timeSpent < 30) {
      return new Response(
        JSON.stringify({ success: false, error: '学习时间太短，请认真学习后再提交' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. 计算奖励（仅首次完成）
    let lacReward = 0;
    let pointsReward = 0;
    const now = new Date().toISOString();

    if (isFirstCompletion) {
      // 基础奖励 by difficulty
      const difficultyRewards: Record<string, number> = {
        '入门': 10, '入門': 10,
        '基础': 20, '基礎': 20,
        '进阶': 40, '進階': 40,
        '高级': 80, '高級': 80
      };
      lacReward = difficultyRewards[course.difficulty] || 10;
      pointsReward = Math.floor(lacReward * 0.2);

      // 更新用户余额
      const { data: currentUser } = await supabase
        .from('users')
        .select('lac_balance, points_balance, xp')
        .eq('id', userId)
        .single();

      if (currentUser) {
        const curLac = parseFloat(currentUser.lac_balance || '0');
        await supabase
          .from('users')
          .update({
            lac_balance: curLac + lacReward,
            points_balance: (currentUser.points_balance || 0) + pointsReward,
            xp: (currentUser.xp || 0) + pointsReward,
            updated_at: now
          })
          .eq('id', userId);
      }

      // 记录挖矿
      await supabase
        .from('mining_records')
        .insert({
          user_id: userId,
          mining_type: 'learn',
          action: 'complete_course',
          source_id: courseId,
          source_type: 'course',
          points_earned: pointsReward,
          lac_earned: lacReward,
          base_amount: lacReward,
          multiplier: 1.0,
          metadata: {
            course_title: course.title,
            difficulty: course.difficulty,
            time_spent: timeSpent
          },
          status: 'completed'
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          course: { id: course.id, title: course.title, difficulty: course.difficulty },
          first_completion: isFirstCompletion,
          rewards: { lac_earned: lacReward, points_earned: pointsReward }
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('学习完成处理失败:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || '处理失败' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
