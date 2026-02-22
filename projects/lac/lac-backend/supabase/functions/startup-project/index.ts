import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const json = (data: any, status = 200) => new Response(
  JSON.stringify(data),
  { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { action } = body;

    // === 提交创业项目 ===
    if (action === 'submit') {
      const { user_id, name, description, category, team_size, website, pitch_deck_url } = body;
      if (!user_id || !name || !description) {
        return json({ error: '请填写项目名称和描述' }, 400);
      }

      const { data, error } = await supabase
        .from('startup_projects')
        .insert({
          submitter_id: user_id,
          name,
          description,
          category: category || 'ai',
          team_size: team_size || 1,
          website: website || null,
          pitch_deck_url: pitch_deck_url || null,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) return json({ error: error.message }, 500);
      return json({ success: true, data });
    }

    // === 项目列表 ===
    if (action === 'list') {
      const { status: filterStatus, category, limit = 20, page = 1 } = body;
      let query = supabase
        .from('startup_projects')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (filterStatus) query = query.eq('status', filterStatus);
      if (category) query = query.eq('category', category);

      const { data, error, count } = await query;
      if (error) return json({ error: error.message }, 500);
      return json({ success: true, data, total: count, page, limit });
    }

    // === 项目详情 ===
    if (action === 'detail') {
      const { project_id } = body;
      if (!project_id) return json({ error: 'project_id required' }, 400);

      const { data, error } = await supabase
        .from('startup_projects')
        .select('*')
        .eq('id', project_id)
        .single();

      if (error || !data) return json({ error: '项目不存在' }, 404);
      return json({ success: true, data });
    }

    // === 项目审核（管理员） ===
    if (action === 'review') {
      const { project_id, status: newStatus, reviewer_note } = body;
      if (!project_id || !newStatus) return json({ error: 'project_id and status required' }, 400);

      const validStatuses = ['approved', 'rejected', 'incubating', 'graduated'];
      if (!validStatuses.includes(newStatus)) {
        return json({ error: `status must be one of: ${validStatuses.join(', ')}` }, 400);
      }

      const { data, error } = await supabase
        .from('startup_projects')
        .update({
          status: newStatus,
          reviewer_note: reviewer_note || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', project_id)
        .select()
        .single();

      if (error) return json({ error: error.message }, 500);
      return json({ success: true, data });
    }

    // === 我的项目 ===
    if (action === 'my-projects') {
      const { user_id } = body;
      if (!user_id) return json({ error: 'user_id required' }, 400);

      const { data, error } = await supabase
        .from('startup_projects')
        .select('*')
        .eq('submitter_id', user_id)
        .order('created_at', { ascending: false });

      if (error) return json({ error: error.message }, 500);
      return json({ success: true, data });
    }

    return json({ error: `unknown action: ${action}` }, 400);

  } catch (error) {
    return json({ error: error.message || '服务器错误' }, 500);
  }
});
