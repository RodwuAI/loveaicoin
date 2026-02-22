import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase.from("users").select("role").eq("id", userId).single();
  return data?.role === "admin";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { user_id, name, description, target_amount, image_url } = body;
      if (!user_id || !name || !description || !target_amount) return json({ error: "missing fields" }, 400);
      if (!await isAdmin(user_id)) return json({ error: "admin only" }, 403);

      const { data, error } = await supabase.from("charity_projects")
        .insert({
          name, description, target_amount, current_amount: 0,
          status: "active", image_url: image_url || null,
          created_by: user_id, submitter_id: user_id
        })
        .select().single();
      if (error) return json({ error: error.message }, 500);
      return json({ success: true, project: data });
    }

    if (action === "list") {
      const { status, page = 1, limit = 20 } = body;
      let query = supabase.from("charity_projects").select("*", { count: "exact" })
        .order("created_at", { ascending: false });
      if (status) query = query.eq("status", status);
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);
      const { data, count, error } = await query;
      if (error) return json({ error: error.message }, 500);
      return json({ projects: data, total: count, page, limit });
    }

    if (action === "detail") {
      const { project_id } = body;
      if (!project_id) return json({ error: "missing project_id" }, 400);
      const { data, error } = await supabase.from("charity_projects")
        .select("*").eq("id", project_id).single();
      if (error || !data) return json({ error: "not found" }, 404);
      return json({ project: data });
    }

    if (action === "update") {
      const { user_id, project_id, status: newStatus, description, name, image_url } = body;
      if (!user_id || !project_id) return json({ error: "missing fields" }, 400);
      if (!await isAdmin(user_id)) return json({ error: "admin only" }, 403);

      const updates: Record<string, unknown> = {};
      if (newStatus && ["active", "completed", "cancelled"].includes(newStatus)) updates.status = newStatus;
      if (description) updates.description = description;
      if (name) updates.name = name;
      if (image_url !== undefined) updates.image_url = image_url;

      if (Object.keys(updates).length === 0) return json({ error: "nothing to update" }, 400);

      const { data, error } = await supabase.from("charity_projects")
        .update(updates).eq("id", project_id).select().single();
      if (error) return json({ error: error.message }, 500);
      return json({ success: true, project: data });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
