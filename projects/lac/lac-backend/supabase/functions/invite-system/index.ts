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

    if (action === 'generate') {
      const { user_id } = body;
      if (!user_id) return jsonRes({ error: 'user_id required' }, 400);

      // Check if user already has an invite code
      const { data: existing } = await supabase
        .from('invitations').select('*').eq('inviter_id', user_id).maybeSingle();
      if (existing) return jsonRes({ success: true, data: existing });

      // Generate unique 6-char code
      const code = generateCode();
      const { data, error } = await supabase.from('invitations').insert({
        inviter_id: user_id,
        invite_code: code,
      }).select().single();
      if (error) return jsonRes({ error: error.message }, 500);
      return jsonRes({ success: true, data });

    } else if (action === 'bind') {
      const { student_id, invite_code } = body;
      if (!student_id || !invite_code) return jsonRes({ error: 'student_id and invite_code required' }, 400);

      // Find invitation
      const { data: inv } = await supabase
        .from('invitations').select('*').eq('invite_code', invite_code).maybeSingle();
      if (!inv) return jsonRes({ error: 'Invalid invite code' }, 404);
      if (inv.inviter_id === student_id) return jsonRes({ error: 'Cannot invite yourself' }, 400);
      if (inv.uses_count >= inv.max_uses) return jsonRes({ error: 'Invite code exhausted' }, 400);

      // Check if student already has a teacher
      const { data: existingBind } = await supabase
        .from('teacher_student').select('*').eq('student_id', student_id).maybeSingle();
      if (existingBind) return jsonRes({ error: 'Already bound to a teacher' }, 400);

      // Bind
      const { error: bindErr } = await supabase.from('teacher_student').insert({
        teacher_id: inv.inviter_id,
        student_id,
      });
      if (bindErr) return jsonRes({ error: bindErr.message }, 500);

      // Increment uses count
      await supabase.from('invitations').update({ uses_count: inv.uses_count + 1 }).eq('id', inv.id);

      return jsonRes({ success: true, message: 'Bound successfully' });

    } else if (action === 'stats') {
      const { user_id } = body;
      if (!user_id) return jsonRes({ error: 'user_id required' }, 400);

      const { data: inv } = await supabase
        .from('invitations').select('*').eq('inviter_id', user_id).maybeSingle();
      const { data: students, count } = await supabase
        .from('teacher_student').select('*', { count: 'exact' }).eq('teacher_id', user_id);
      const totalCommission = (students || []).reduce((s: number, r: any) => s + (r.total_commission || 0), 0);

      return jsonRes({
        success: true,
        data: {
          invite_code: inv?.invite_code || null,
          total_invites: inv?.uses_count || 0,
          active_students: count || 0,
          total_commission: totalCommission,
        }
      });

    } else if (action === 'get_code') {
      const { user_id } = body;
      if (!user_id) return jsonRes({ error: 'user_id required' }, 400);

      const { data: existing } = await supabase
        .from('invitations').select('invite_code').eq('inviter_id', user_id).maybeSingle();

      return jsonRes({
        success: true,
        invite_code: existing?.invite_code || null
      });

    } else if (action === 'commission') {
      const { student_id, amount } = body;
      if (!student_id || !amount) return jsonRes({ error: 'student_id and amount required' }, 400);

      const commission = Number(amount) * 0.03;
      const { data: rel } = await supabase
        .from('teacher_student').select('*').eq('student_id', student_id).eq('is_active', true).maybeSingle();
      if (!rel) return jsonRes({ success: true, commission: 0, message: 'No active teacher' });

      await supabase.from('teacher_student').update({
        total_commission: (rel.total_commission || 0) + commission
      }).eq('id', rel.id);

      return jsonRes({ success: true, commission, teacher_id: rel.teacher_id });

    } else {
      return jsonRes({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    return jsonRes({ error: e.message }, 500);
  }
});

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function jsonRes(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
