import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { checkRateLimit, RATE_LIMITS, getClientIP, createRateLimitKey } from '../_shared/rate-limiter.ts';

interface CheckinRequest {
  answer: string;
  question?: string; // 如果提供，表示是回答特定问题
}

interface CheckinResponse {
  success: boolean;
  data?: {
    question: string;
    answer: string;
    ai_feedback: string;
    quality_score: number;
    lac_reward: number;
    points_reward: number;
    streak_days: number;
    streak_multiplier: number;
    already_checked_in?: boolean;
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

    // 速率限制检查：签到每IP每小时最多20次
    const ipRateLimit = await checkRateLimit(
      supabase,
      createRateLimitKey('ip', clientIP, 'checkin'),
      RATE_LIMITS.CHECKIN_IP
    );

    if (!ipRateLimit.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '签到请求过于频繁，请稍后重试',
          retryAfter: ipRateLimit.retryAfter
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            'Retry-After': ipRateLimit.retryAfter?.toString() || '1800'
          }
        }
      );
    }

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
    const today = new Date().toISOString().split('T')[0];

    // 2. 检查是否已经签到
    const { data: existingCheckin } = await supabase
      .from('checkin_records')
      .select('*')
      .eq('user_id', userId)
      .eq('checkin_date', today)
      .single();

    if (existingCheckin) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            question: existingCheckin.question,
            answer: existingCheckin.answer,
            ai_feedback: existingCheckin.ai_feedback,
            quality_score: existingCheckin.answer_quality_score,
            lac_reward: parseFloat(existingCheckin.lac_reward),
            points_reward: existingCheckin.points_reward,
            streak_days: existingCheckin.streak_days,
            streak_multiplier: await getStreakMultiplier(existingCheckin.streak_days),
            already_checked_in: true
          }
        } as CheckinResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. 处理签到
    if (req.method === 'GET') {
      // 获取今日签到问题
      const question = await generateDailyQuestion();
      return new Response(
        JSON.stringify({
          success: true,
          data: { question }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === 'POST') {
      const { answer, question: providedQuestion } = await req.json() as CheckinRequest;

      if (!answer || answer.trim().length < 10) {
        return new Response(
          JSON.stringify({ success: false, error: '回答内容不能少于10个字符' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 4. 获取或生成签到问题
      const question = providedQuestion || await generateDailyQuestion();

      // 5. AI评估答案质量
      const { qualityScore, feedback } = await evaluateAnswerQuality(question, answer);

      // 6. 调用mining-streak服务获取连续签到信息
      const streakInfo = await getStreakInfo(userId);

      // 7. 计算奖励
      const streakMultiplier = streakInfo.multiplier;
      const baseReward = 50; // 基础签到奖励50 LAC
      const lacReward = Math.floor(baseReward * qualityScore * streakMultiplier);
      const pointsReward = Math.floor(lacReward * 0.1); // 10%的积分奖励

      // 8. 记录签到
      const { error: checkinError } = await supabase
        .from('checkin_records')
        .insert({
          user_id: userId,
          checkin_date: today,
          question,
          answer,
          ai_feedback: feedback,
          lac_reward: lacReward,
          points_reward: pointsReward,
          streak_days: streakInfo.streak_days,
          answer_quality_score: qualityScore
        });

      if (checkinError) {
        console.error('签到记录失败:', checkinError);
        return new Response(
          JSON.stringify({ success: false, error: '签到失败，请稍后重试' }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 9. 更新用户状态 (fetch current balance first, then add)
      const { data: currentUser } = await supabase
        .from('users')
        .select('lac_balance, points_balance')
        .eq('id', userId)
        .single();

      const newLacBalance = parseFloat(currentUser?.lac_balance || '0') + lacReward;
      const newPointsBalance = (currentUser?.points_balance || 0) + pointsReward;

      await supabase
        .from('users')
        .update({
          lac_balance: newLacBalance,
          points_balance: newPointsBalance,
          streak_days: streakInfo.streak_days,
          last_checkin: today,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      // 10. 记录挖矿记录
      await supabase
        .from('mining_records')
        .insert({
          user_id: userId,
          mining_type: 'learn',
          action: 'daily_checkin',
          source_id: userId, // 签到以用户自己为源
          source_type: 'checkin',
          points_earned: pointsReward,
          lac_earned: lacReward,
          base_amount: baseReward,
          multiplier: qualityScore * streakMultiplier,
          metadata: {
            streak_days: streakInfo.streak_days,
            quality_score: qualityScore,
            answer_length: answer.length
          },
          status: 'completed'
        });

      // 11. 更新每日统计
      await supabase.rpc('update_daily_mining_stats', {
        p_user_id: userId,
        p_mining_type: 'learn',
        p_lac_amount: lacReward,
        p_points_amount: pointsReward,
        p_date: today
      });

      // 12. 检查签到相关成就
      await checkCheckinAchievements(supabase, userId, streakInfo.streak_days);

      const response: CheckinResponse = {
        success: true,
        data: {
          question,
          answer,
          ai_feedback: feedback,
          quality_score: qualityScore,
          lac_reward: lacReward,
          points_reward: pointsReward,
          streak_days: streakInfo.streak_days,
          streak_multiplier: streakMultiplier
        }
      };

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error('签到失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '签到失败'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

// 生成每日签到问题
async function generateDailyQuestion(): Promise<string> {
  const questions = [
    "今天你学到了什么新知识？请简单分享一下。",
    "分享一个你觉得有趣的AI应用或工具。",
    "你对未来科技发展有什么期待？",
    "描述一下你理想中的数字化生活。",
    "如果你能创造一个AI工具，它会有什么功能？",
    "你认为AI技术会如何改变教育？",
    "分享一个你最近解决的问题或挑战。",
    "你觉得什么技能在未来最有价值？",
    "描述一下你今天最有成就感的时刻。",
    "如果要向朋友推荐LAC，你会怎么说？"
  ];

  // 基于日期生成固定问题，确保同一天所有用户看到相同问题
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const questionIndex = dayOfYear % questions.length;
  
  return questions[questionIndex];
}

// AI评估答案质量（简化版本）
async function evaluateAnswerQuality(question: string, answer: string): Promise<{qualityScore: number, feedback: string}> {
  try {
    // 这里应该调用真实的AI API进行评估
    // 目前使用基于规则的简化评估
    
    let score = 0.5; // 基础分数
    let feedback = "感谢你的分享！";

    // 长度评估
    if (answer.length >= 100) score += 0.2;
    else if (answer.length >= 50) score += 0.1;

    // 关键词匹配
    const keywords = ['AI', '人工智能', '学习', '技术', '创新', '未来', '数字化', '区块链', 'LAC'];
    const keywordCount = keywords.filter(keyword => answer.toLowerCase().includes(keyword.toLowerCase())).length;
    score += Math.min(keywordCount * 0.1, 0.3);

    // 避免太简短的回答
    if (answer.length < 20) {
      score = Math.min(score, 0.3);
      feedback += " 建议下次回答更详细一些。";
    }

    // 避免重复内容（简化检测）
    const uniqueWords = new Set(answer.toLowerCase().split(/\s+/)).size;
    const totalWords = answer.split(/\s+/).length;
    if (totalWords > 0 && uniqueWords / totalWords < 0.6) {
      score *= 0.8;
      feedback += " 尽量避免重复表达。";
    }

    // 积极的回答给予更高评分
    const positiveWords = ['好', '棒', '优秀', '有趣', '喜欢', '期待', '希望', '创新', '进步'];
    const positiveCount = positiveWords.filter(word => answer.includes(word)).length;
    if (positiveCount > 0) {
      score += Math.min(positiveCount * 0.05, 0.15);
      feedback += " 很高兴看到你积极的想法！";
    }

    // 确保分数在合理范围内
    score = Math.max(0.2, Math.min(1.0, score));

    // 根据分数生成不同的反馈
    if (score >= 0.8) {
      feedback = "优秀的回答！你的分享很有深度和思考。" + feedback.replace("感谢你的分享！", "");
    } else if (score >= 0.6) {
      feedback = "不错的分享！" + feedback.replace("感谢你的分享！", "");
    } else if (score >= 0.4) {
      feedback = "感谢你的回答。" + feedback.replace("感谢你的分享！", "");
    } else {
      feedback = "感谢参与签到。建议下次可以分享更多想法。";
    }

    return {
      qualityScore: Math.round(score * 100) / 100,
      feedback
    };

  } catch (error) {
    console.error('AI评估失败:', error);
    return {
      qualityScore: 0.5,
      feedback: "感谢你的分享！"
    };
  }
}

// 计算连续签到天数
async function calculateStreakDays(supabase: any, userId: string): Promise<number> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // 获取用户当前连续天数
  const { data: user } = await supabase
    .from('users')
    .select('streak_days, last_checkin')
    .eq('id', userId)
    .single();

  if (!user) return 1;

  // 如果昨天有签到，连续天数+1
  if (user.last_checkin === yesterdayStr) {
    return user.streak_days + 1;
  }
  
  // 如果断签了，重置为1
  return 1;
}

// 获取连续打卡倍率
async function getStreakMultiplier(streakDays: number): Promise<number> {
  if (streakDays >= 90) return 6.0;
  if (streakDays >= 60) return 5.0;
  if (streakDays >= 30) return 3.0;
  if (streakDays >= 14) return 2.0;
  if (streakDays >= 7) return 1.5;
  if (streakDays >= 3) return 1.2;
  return 1.0;
}

// 检查签到相关成就
async function checkCheckinAchievements(supabase: any, userId: string, streakDays: number): Promise<void> {
  try {
    // 检查连续签到成就
    const achievements = [
      { id: '880e8400-e29b-41d4-a716-446655440001', streak: 1 },   // 初来乍到
      { id: '880e8400-e29b-41d4-a716-446655440002', streak: 7 },   // 坚持不懈
    ];

    for (const achievement of achievements) {
      if (streakDays >= achievement.streak) {
        await supabase.rpc('check_achievement_progress', {
          p_user_id: userId,
          p_achievement_id: achievement.id
        });
      }
    }
  } catch (error) {
    console.error('检查签到成就失败:', error);
  }
}

// 调用mining-streak服务获取连续签到信息
async function getStreakInfo(userId: string): Promise<{streak_days: number, multiplier: number}> {
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/mining-streak-simple?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get streak info');
    }

    const data = await response.json();
    if (data.success) {
      return {
        streak_days: data.data.streak_days,
        multiplier: data.data.multiplier
      };
    } else {
      throw new Error(data.error || 'Failed to get streak info');
    }
  } catch (error) {
    console.error('获取连续签到信息失败:', error);
    // 如果调用失败，回退到原有逻辑
    return {
      streak_days: 1,
      multiplier: 1.0
    };
  }
}