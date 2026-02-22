import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { action } = body;

    if (action === 'submit') {
      const { user_id, title, description, template_content, example_output, category, tags } = body;
      if (!user_id || !title || !template_content) return jsonRes({ error: 'user_id, title, template_content required' }, 400);
      if (template_content.length < 50) return jsonRes({ error: 'Template content must be ≥50 characters' }, 400);

      // Daily limit: 3 per user
      const today = new Date().toISOString().slice(0, 10);
      const { count } = await supabase
        .from('prompt_templates').select('*', { count: 'exact', head: true })
        .eq('author_id', user_id)
        .gte('created_at', `${today}T00:00:00Z`);
      if ((count || 0) >= 3) return jsonRes({ error: 'Daily submission limit reached (3/day)' }, 429);

      // Title duplicate check
      const { data: dup } = await supabase
        .from('prompt_templates').select('id').ilike('title', `%${title}%`).limit(1);
      if (dup && dup.length > 0) return jsonRes({ error: 'Similar title already exists' }, 409);

      const { data, error } = await supabase.from('prompt_templates').insert({
        author_id: user_id, title, description, template_content, example_output,
        category: category || 'general', tags: tags || [],
      }).select().single();
      if (error) return jsonRes({ error: error.message }, 500);
      return jsonRes({ success: true, data });

    } else if (action === 'list') {
      const { category, page = 1, limit = 20 } = body;
      const from = (page - 1) * limit;
      let query = supabase.from('prompt_templates').select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);
      if (category) query = query.eq('category', category);
      const { data, count, error } = await query;
      if (error) return jsonRes({ error: error.message }, 500);
      return jsonRes({ success: true, data, total: count, page, limit });

    } else if (action === 'detail') {
      const { template_id } = body;
      if (!template_id) return jsonRes({ error: 'template_id required' }, 400);
      const { data, error } = await supabase.from('prompt_templates').select('*').eq('id', template_id).single();
      if (error) return jsonRes({ error: 'Template not found' }, 404);
      return jsonRes({ success: true, data });

    } else if (action === 'use') {
      const { user_id, template_id } = body;
      if (!user_id || !template_id) return jsonRes({ error: 'user_id and template_id required' }, 400);

      // Record usage
      await supabase.from('prompt_usage').insert({ user_id, template_id });
      // Increment use_count
      const { data: tpl } = await supabase.from('prompt_templates').select('use_count').eq('id', template_id).single();
      await supabase.from('prompt_templates').update({ use_count: (tpl?.use_count || 0) + 1 }).eq('id', template_id);

      return jsonRes({ success: true, message: 'Usage recorded' });

    } else if (action === 'rate') {
      const { user_id, template_id, rating } = body;
      if (!user_id || !template_id || !rating) return jsonRes({ error: 'user_id, template_id, rating required' }, 400);
      if (rating < 1 || rating > 5) return jsonRes({ error: 'Rating must be 1-5' }, 400);

      const { data: tpl } = await supabase.from('prompt_templates').select('rating, rating_count').eq('id', template_id).single();
      if (!tpl) return jsonRes({ error: 'Template not found' }, 404);
      const newCount = (tpl.rating_count || 0) + 1;
      const newRating = ((tpl.rating || 0) * (tpl.rating_count || 0) + rating) / newCount;
      await supabase.from('prompt_templates').update({ rating: newRating, rating_count: newCount }).eq('id', template_id);

      return jsonRes({ success: true, rating: newRating, rating_count: newCount });

    } else {
      return jsonRes({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    return jsonRes({ error: e.message }, 500);
  }
});

function jsonRes(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
