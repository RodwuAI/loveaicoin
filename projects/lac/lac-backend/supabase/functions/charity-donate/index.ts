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

    if (action === "donate") {
      const { user_id, project_id, amount, message } = body;
      if (!user_id || !project_id || !amount) return json({ error: "missing fields" }, 400);
      if (amount < 10) return json({ error: "minimum donation is 10 LAC" }, 400);

      // Check project exists and is active
      const { data: project } = await supabase.from("charity_projects")
        .select("id, status").eq("id", project_id).single();
      if (!project) return json({ error: "project not found" }, 404);
      if (project.status !== "active") return json({ error: "project is not active" }, 400);

      // Check user balance
      const { data: user } = await supabase.from("users")
        .select("lac_balance").eq("id", user_id).single();
      if (!user) return json({ error: "user not found" }, 404);
      if ((user.lac_balance || 0) < amount) return json({ error: "insufficient balance" }, 400);

      // Deduct balance
      const { error: updateErr } = await supabase.from("users")
        .update({ lac_balance: (user.lac_balance || 0) - amount })
        .eq("id", user_id);
      if (updateErr) return json({ error: updateErr.message }, 500);

      // Create donation record
      const { data: donation, error: donErr } = await supabase.from("charity_donations")
        .insert({ donor_id: user_id, project_id, amount, message })
        .select().single();
      if (donErr) {
        // Rollback balance
        await supabase.from("users").update({ lac_balance: user.lac_balance }).eq("id", user_id);
        return json({ error: donErr.message }, 500);
      }

      // Update project current_amount
      const { data: proj } = await supabase.from("charity_projects")
        .select("current_amount").eq("id", project_id).single();
      if (proj) {
        await supabase.from("charity_projects")
          .update({ current_amount: (proj.current_amount || 0) + amount })
          .eq("id", project_id);
      }

      return json({ success: true, donation });
    }

    if (action === "history") {
      const { user_id, page = 1, limit = 20 } = body;
      if (!user_id) return json({ error: "missing user_id" }, 400);
      const from = (page - 1) * limit;
      const { data, count, error } = await supabase.from("charity_donations")
        .select("*", { count: "exact" })
        .eq("donor_id", user_id)
        .order("created_at", { ascending: false })
        .range(from, from + limit - 1);
      if (error) return json({ error: error.message }, 500);
      return json({ donations: data, total: count, page, limit });
    }

    if (action === "project-stats") {
      const { project_id } = body;
      if (!project_id) return json({ error: "missing project_id" }, 400);
      const { data: project } = await supabase.from("charity_projects")
        .select("id, name, target_amount, current_amount, status")
        .eq("id", project_id).single();
      if (!project) return json({ error: "project not found" }, 404);
      const { count } = await supabase.from("charity_donations")
        .select("id", { count: "exact", head: true })
        .eq("project_id", project_id);
      return json({
        project_id: project.id,
        name: project.name,
        target_amount: project.target_amount,
        current_amount: project.current_amount,
        status: project.status,
        total_donors: count || 0,
        progress: project.target_amount > 0 ? ((project.current_amount || 0) / project.target_amount * 100).toFixed(1) + "%" : "0%"
      });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
