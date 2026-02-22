import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ACP等级系统（按需求修改）
const ACP_TIERS = [
  { name: 'Pioneer', min: 0, max: 99 },
  { name: 'Builder', min: 100, max: 499 },
  { name: 'Architect', min: 500, max: 1999 },
  { name: 'Visionary', min: 2000, max: 4999 },
  { name: 'Oracle', min: 5000, max: 14999 },
  { name: 'Sovereign', min: 15000, max: Infinity }
]

// 贡献类型积分配置
const CONTRIBUTION_POINTS = {
  'content_creation': 10,
  'tool_development': 20,
  'community_support': 8,
  'bug_report': 15,
  'translation': 12
}

function getTier(totalAcp: number): string {
  for (const tier of ACP_TIERS) {
    if (totalAcp >= tier.min && totalAcp <= tier.max) {
      return tier.name
    }
  }
  return 'Pioneer'
}

function getNextTier(currentTier: string): { name: string, minPoints: number } | null {
  const currentIndex = ACP_TIERS.findIndex(t => t.name === currentTier)
  if (currentIndex >= 0 && currentIndex < ACP_TIERS.length - 1) {
    const nextTier = ACP_TIERS[currentIndex + 1]
    return { name: nextTier.name, minPoints: nextTier.min }
  }
  return null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, ai_id, contribution_type, description, amount = 0 } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    switch (action) {
      case 'record': {
        if (!ai_id || !contribution_type) {
          return new Response(
            JSON.stringify({ error: 'ai_id and contribution_type are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const acpPoints = CONTRIBUTION_POINTS[contribution_type as keyof typeof CONTRIBUTION_POINTS] || 5

        // 记录奖励到ai_rewards表
        const { data: reward, error: rewardError } = await supabase
          .from('ai_rewards')
          .insert({
            ai_id,
            contribution_type,
            description,
            acp_points: acpPoints,
            lac_amount: amount
          })
          .select()
          .single()

        if (rewardError) {
          throw new Error(`Failed to record reward: ${rewardError.message}`)
        }

        // 更新或创建ACP积分记录
        const { data: existing, error: existingError } = await supabase
          .from('ai_contribution_scores')
          .select('*')
          .eq('ai_id', ai_id)
          .single()

        if (existingError && existingError.code !== 'PGRST116') {
          throw new Error(`Failed to check existing score: ${existingError.message}`)
        }

        let scoreRecord
        if (existing) {
          // 更新现有记录
          const newTotal = existing.total_acp + acpPoints
          const newTier = getTier(newTotal)
          
          const { data: updated, error: updateError } = await supabase
            .from('ai_contribution_scores')
            .update({
              total_acp: newTotal,
              current_tier: newTier,
              last_contribution_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('ai_id', ai_id)
            .select()
            .single()

          if (updateError) {
            throw new Error(`Failed to update score: ${updateError.message}`)
          }
          scoreRecord = updated
        } else {
          // 创建新记录
          const tier = getTier(acpPoints)
          const { data: created, error: createError } = await supabase
            .from('ai_contribution_scores')
            .insert({
              ai_id,
              total_acp: acpPoints,
              current_tier: tier,
              last_contribution_at: new Date().toISOString()
            })
            .select()
            .single()

          if (createError) {
            throw new Error(`Failed to create score record: ${createError.message}`)
          }
          scoreRecord = created
        }

        return new Response(
          JSON.stringify({
            success: true,
            reward,
            score: scoreRecord,
            acp_earned: acpPoints
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'history': {
        if (!ai_id) {
          return new Response(
            JSON.stringify({ error: 'ai_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: history, error } = await supabase
          .from('ai_rewards')
          .select('*')
          .eq('ai_id', ai_id)
          .order('created_at', { ascending: false })

        if (error) {
          throw new Error(`Failed to fetch history: ${error.message}`)
        }

        return new Response(
          JSON.stringify({
            history: history || [],
            total_records: (history || []).length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'score': {
        if (!ai_id) {
          return new Response(
            JSON.stringify({ error: 'ai_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: score, error } = await supabase
          .from('ai_contribution_scores')
          .select('*')
          .eq('ai_id', ai_id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw new Error(`Failed to fetch score: ${error.message}`)
        }

        if (!score) {
          return new Response(
            JSON.stringify({
              ai_id,
              total_acp: 0,
              current_tier: 'Pioneer',
              tier_progress: 0,
              next_tier: getNextTier('Pioneer'),
              last_contribution_at: null
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const nextTier = getNextTier(score.current_tier)
        let tierProgress = 0
        if (nextTier) {
          const currentTierData = ACP_TIERS.find(t => t.name === score.current_tier)
          if (currentTierData) {
            const progressInTier = score.total_acp - currentTierData.min
            const tierRange = nextTier.minPoints - currentTierData.min
            tierProgress = (progressInTier / tierRange) * 100
          }
        } else {
          tierProgress = 100
        }

        return new Response(
          JSON.stringify({
            ...score,
            tier_progress: Math.round(tierProgress * 100) / 100,
            next_tier: nextTier
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: record, history, or score' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error in ai-reward function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})