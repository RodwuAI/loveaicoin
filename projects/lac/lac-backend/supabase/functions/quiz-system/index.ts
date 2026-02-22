import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// ==========================================
// Quiz System Edge Function
// Actions: get-quiz, submit, history
// ==========================================

const DIFFICULTY_REWARDS: Record<number, number> = {
  1: 10,
  2: 20,
  3: 40,
  4: 80,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ success: false, error: "只支持POST请求" }, 405);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "get-quiz":
        return await getQuiz(supabase, req, body);
      case "submit":
        return await submitQuiz(supabase, req, body);
      case "history":
        return await getHistory(supabase, req, body);
      default:
        return json({ success: false, error: `未知action: ${action}` }, 400);
    }
  } catch (error) {
    console.error("Quiz system error:", error);
    return json({ success: false, error: error.message || "服务器内部错误" }, 500);
  }
});

// ==========================================
// Helpers
// ==========================================

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Authenticate user via Authorization header (Bearer token) */
async function authenticateUser(supabase: any, req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const { data: session } = await supabase
    .from("user_sessions")
    .select("user_id")
    .eq("session_token", token)
    .gt("expires_at", new Date().toISOString())
    .single();

  return session?.user_id || null;
}

/** Fisher-Yates shuffle */
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Count today's attempts for a user+course */
async function getTodayAttempts(supabase: any, userId: string, courseId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase
    .from("quiz_attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .gte("created_at", `${today}T00:00:00.000Z`)
    .lt("created_at", `${today}T23:59:59.999Z`);
  return count || 0;
}

// ==========================================
// Action: get-quiz
// ==========================================

async function getQuiz(supabase: any, req: Request, body: any) {
  const { course_id } = body;
  if (!course_id) return json({ success: false, error: "course_id 不能为空" }, 400);

  // Auth: support both token and body user_id
  let userId = await authenticateUser(supabase, req);
  if (!userId) userId = body.user_id;
  if (!userId) return json({ success: false, error: "认证失败" }, 401);

  // Check daily limit
  const todayAttempts = await getTodayAttempts(supabase, userId, course_id);
  if (todayAttempts >= 3) {
    return json({
      success: false,
      error: "该课程今日答题次数已达上限(3次/天)",
      remaining_attempts: 0,
    }, 429);
  }

  // Verify course exists
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, metadata")
    .eq("id", course_id)
    .single();

  if (!course) return json({ success: false, error: "课程不存在" }, 404);

  // Fetch questions from quiz_questions table first
  const { data: dbQuestions } = await supabase
    .from("quiz_questions")
    .select("id, question_text, options, difficulty, category")
    .eq("course_id", course_id);

  let questions = dbQuestions || [];

  // Fallback: check metadata.quiz if no DB questions
  if (questions.length === 0 && course.metadata?.quiz) {
    questions = course.metadata.quiz.map((q: any, i: number) => ({
      id: `meta_${i}`,
      question_text: q.question || q.question_text || '',
      options: q.options || [],
      difficulty: q.difficulty || 'medium',
      category: 'general',
      correct_answer_index: q.answer ?? q.correct_answer ?? 0
    }));
  }

  if (questions.length === 0) {
    return json({ success: false, error: "该课程暂无测验题目" }, 404);
  }

  // Shuffle and take up to 10
  const selected = shuffleArray(questions).slice(0, 10);

  return json({
    success: true,
    data: {
      course_id,
      course_title: course.title,
      questions: selected,
      total_questions: selected.length,
      remaining_attempts_today: 3 - todayAttempts,
      pass_threshold: 80,
    },
  });
}

// ==========================================
// Action: submit
// ==========================================

async function submitQuiz(supabase: any, req: Request, body: any) {
  const { course_id, answers, time_spent_seconds } = body;

  if (!course_id) return json({ success: false, error: "course_id 不能为空" }, 400);
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return json({ success: false, error: "answers 不能为空" }, 400);
  }

  // Auth: support both token and body user_id
  let userId = await authenticateUser(supabase, req);
  if (!userId) userId = body.user_id;
  if (!userId) return json({ success: false, error: "认证失败" }, 401);

  // Check daily limit
  const todayAttempts = await getTodayAttempts(supabase, userId, course_id);
  if (todayAttempts >= 3) {
    return json({
      success: false,
      error: "该课程今日答题次数已达上限(3次/天)",
      remaining_attempts: 0,
    }, 429);
  }

  const totalQuestions = answers.length;
  const timeSpent = time_spent_seconds || 0;

  // Anti-cheat: 3 seconds per question minimum
  let suspicious = false;
  let suspiciousReason = "";
  if (timeSpent > 0 && timeSpent < totalQuestions * 3) {
    suspicious = true;
    suspiciousReason = `答题过快：${timeSpent}秒完成${totalQuestions}题（低于${totalQuestions * 3}秒阈值）`;
  }

  // Fetch correct answers
  const questionIds = answers.map((a: any) => a.question_id);
  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, correct_answer, question_text")
    .in("id", questionIds);

  if (!questions) return json({ success: false, error: "查询题目失败" }, 500);

  const correctMap = new Map(questions.map((q: any) => [q.id, q.correct_answer]));

  // Grade
  let correctCount = 0;
  const details = answers.map((a: any) => {
    const correct = correctMap.get(a.question_id);
    const isCorrect = correct !== undefined && a.selected === correct;
    if (isCorrect) correctCount++;
    return {
      question_id: a.question_id,
      selected: a.selected,
      correct,
      is_correct: isCorrect,
    };
  });

  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = score >= 80;

  // Calculate reward
  let lacReward = 0;
  if (passed && !suspicious) {
    const { data: course } = await supabase
      .from("courses")
      .select("difficulty")
      .eq("id", course_id)
      .single();

    const difficulty = course?.difficulty || 1;
    const baseReward = DIFFICULTY_REWARDS[difficulty] || 10;
    const scoreBonus = score >= 100 ? 1.5 : score >= 90 ? 1.2 : 1.0;
    lacReward = Math.floor(baseReward * scoreBonus);

    // Update user balance
    const { data: user } = await supabase
      .from("users")
      .select("lac_balance, points_balance, xp")
      .eq("id", userId)
      .single();

    if (user) {
      const pointsReward = Math.floor(lacReward * 0.1);
      await supabase
        .from("users")
        .update({
          lac_balance: parseFloat(user.lac_balance || "0") + lacReward,
          points_balance: (user.points_balance || 0) + pointsReward,
          xp: (user.xp || 0) + pointsReward,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      // Write mining record
      await supabase.from("mining_records").insert({
        user_id: userId,
        mining_type: "learn",
        action: "quiz_pass",
        source_id: course_id,
        source_type: "quiz",
        points_earned: pointsReward,
        lac_earned: lacReward,
        base_amount: baseReward,
        multiplier: scoreBonus,
        metadata: {
          course_id,
          quiz_score: score,
          total_questions: totalQuestions,
          correct_count: correctCount,
          time_spent: timeSpent,
          suspicious,
        },
        status: "completed",
      });

      // Update daily stats (with fallback for different RPC signatures)
      const today = new Date().toISOString().split("T")[0];
      try {
        await supabase.rpc("update_daily_mining_stats", {
          p_user_id: userId,
          p_mining_type: "learn",
          p_lac_amount: lacReward,
          p_points_amount: pointsReward,
          p_date: today,
        });
      } catch (_e) {
        try {
          await supabase.rpc("update_daily_mining_stats", {
            p_user_id: userId,
            p_mining_type: "learn",
            p_lac_amount: lacReward,
            p_points_amount: pointsReward,
          });
        } catch (_e2) {
          console.error("更新每日统计失败");
        }
      }
    }
  }

  // Save attempt
  const { data: attempt, error: insertError } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: userId,
      course_id,
      score,
      total_questions: totalQuestions,
      time_spent_seconds: timeSpent || 0,
      details,
      passed,
      lac_reward: lacReward,
      suspicious,
      suspicious_reason: suspiciousReason || null,
    })
    .select("id")
    .single();

  if (insertError) return json({ success: false, error: insertError.message }, 500);

  return json({
    success: true,
    data: {
      attempt_id: attempt?.id,
      score,
      correct_count: correctCount,
      total_questions: totalQuestions,
      passed,
      lac_reward: lacReward,
      suspicious,
      suspicious_reason: suspicious ? suspiciousReason : undefined,
      details,
      remaining_attempts_today: 3 - todayAttempts - 1,
    },
  });
}

// ==========================================
// Action: history
// ==========================================

async function getHistory(supabase: any, req: Request, body: any) {
  // Support auth via token or body user_id
  let userId = await authenticateUser(supabase, req);
  if (!userId) userId = body.user_id;
  if (!userId) return json({ success: false, error: "user_id 不能为空" }, 400);

  const { data: attempts, error } = await supabase
    .from("quiz_attempts")
    .select("id, course_id, score, total_questions, time_spent_seconds, passed, lac_reward, suspicious, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return json({ success: false, error: error.message }, 500);

  // Compute stats
  const total = attempts?.length || 0;
  const passedAttempts = attempts?.filter((a: any) => a.passed) || [];
  const stats = {
    total_attempts: total,
    total_passed: passedAttempts.length,
    total_lac_earned: attempts?.reduce((s: number, a: any) => s + parseFloat(a.lac_reward || "0"), 0) || 0,
    pass_rate: total > 0 ? Math.round((passedAttempts.length / total) * 100) : 0,
    average_score: total > 0 ? Math.round(attempts!.reduce((s: number, a: any) => s + a.score, 0) / total) : 0,
  };

  return json({ success: true, data: { attempts: attempts || [], stats } });
}
