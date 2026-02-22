import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "ask") {
      const { user_id, title, content, category } = body;
      if (!user_id || !title || !content) return json({ error: "missing fields" }, 400);
      if (title.length < 5 || title.length > 200) return json({ error: "title must be 5-200 chars" }, 400);
      if (content.length < 20 || content.length > 5000) return json({ error: "content must be 20-5000 chars" }, 400);

      // Check daily limit: max 10 questions per user per day
      const today = new Date().toISOString().slice(0, 10);
      const { count } = await supabase.from("questions")
        .select("id", { count: "exact", head: true })
        .eq("author_id", user_id)
        .gte("created_at", today + "T00:00:00Z")
        .lt("created_at", today + "T23:59:59Z");
      if ((count || 0) >= 10) return json({ error: "daily limit reached (max 10 questions)" }, 429);

      const { data, error } = await supabase.from("questions")
        .insert({ author_id: user_id, title, content, category })
        .select().single();
      if (error) return json({ error: error.message }, 500);
      return json({ success: true, question: data });
    }

    if (action === "answer") {
      const { user_id, question_id, content } = body;
      if (!user_id || !question_id || !content) return json({ error: "missing fields" }, 400);
      if (content.length < 20 || content.length > 5000) return json({ error: "content must be 20-5000 chars" }, 400);

      const { data: q } = await supabase.from("questions").select("id").eq("id", question_id).single();
      if (!q) return json({ error: "question not found" }, 404);

      // Check: max 1 answer per user per question
      const { count } = await supabase.from("answers")
        .select("id", { count: "exact", head: true })
        .eq("question_id", question_id).eq("author_id", user_id);
      if ((count || 0) >= 1) return json({ error: "already answered this question" }, 409);

      const { data, error } = await supabase.from("answers")
        .insert({ question_id, author_id: user_id, content })
        .select().single();
      if (error) return json({ error: error.message }, 500);
      return json({ success: true, answer: data });
    }

    if (action === "vote") {
      const { user_id, target_type, target_id, vote_type } = body;
      if (!user_id || !target_type || !target_id || !vote_type) return json({ error: "missing fields" }, 400);
      if (!["question", "answer"].includes(target_type)) return json({ error: "invalid target_type" }, 400);
      if (!["upvote", "downvote"].includes(vote_type)) return json({ error: "invalid vote_type" }, 400);

      // Check existing vote
      const { data: existing } = await supabase.from("community_votes")
        .select("id, vote_type").eq("user_id", user_id)
        .eq("target_type", target_type).eq("target_id", target_id).single();

      if (existing) {
        if (existing.vote_type === vote_type) return json({ error: "already voted" }, 409);
        // Change vote
        await supabase.from("community_votes").update({ vote_type }).eq("id", existing.id);
        // Update vote_count on target: delta is 2 (switching from -1 to +1 or vice versa)
        const delta = vote_type === "upvote" ? 2 : -2;
        const table = target_type === "question" ? "questions" : "answers";
        const { data: t } = await supabase.from(table).select("vote_count").eq("id", target_id).single();
        if (t) await supabase.from(table).update({ vote_count: (t.vote_count || 0) + delta }).eq("id", target_id);
        return json({ success: true, action: "changed" });
      }

      // New vote
      const { error } = await supabase.from("community_votes")
        .insert({ user_id, target_type, target_id, vote_type });
      if (error) return json({ error: error.message }, 500);

      const delta = vote_type === "upvote" ? 1 : -1;
      const table = target_type === "question" ? "questions" : "answers";
      const { data: t } = await supabase.from(table).select("vote_count").eq("id", target_id).single();
      if (t) await supabase.from(table).update({ vote_count: (t.vote_count || 0) + delta }).eq("id", target_id);
      return json({ success: true, action: "voted" });
    }

    if (action === "list") {
      const { category, page = 1, limit = 20 } = body;
      let query = supabase.from("questions").select("*", { count: "exact" })
        .order("created_at", { ascending: false });
      if (category) query = query.eq("category", category);
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);
      const { data, count, error } = await query;
      if (error) return json({ error: error.message }, 500);
      return json({ questions: data, total: count, page, limit });
    }

    if (action === "detail") {
      const { question_id } = body;
      if (!question_id) return json({ error: "missing question_id" }, 400);
      const { data: question } = await supabase.from("questions").select("*").eq("id", question_id).single();
      if (!question) return json({ error: "not found" }, 404);
      await supabase.from("questions").update({ view_count: (question.view_count || 0) + 1 }).eq("id", question_id);
      const { data: answers } = await supabase.from("answers").select("*")
        .eq("question_id", question_id)
        .order("is_accepted", { ascending: false })
        .order("vote_count", { ascending: false });
      return json({ question: { ...question, view_count: (question.view_count || 0) + 1 }, answers: answers || [] });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
