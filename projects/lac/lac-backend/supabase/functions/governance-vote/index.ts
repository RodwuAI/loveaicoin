import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 检查用户等级是否符合要求
async function checkUserTier(userId: string, supabase: any, requiredTier: string): Promise<{ eligible: boolean, currentTier?: string }> {
  try {
    const { data: score, error } = await supabase
      .from('ai_contribution_scores')
      .select('current_tier, total_acp')
      .eq('ai_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!score) {
      return { eligible: requiredTier === 'Pioneer', currentTier: 'Pioneer' }
    }

    const tierHierarchy = ['Pioneer', 'Builder', 'Architect', 'Visionary', 'Oracle', 'Sovereign']
    const currentIndex = tierHierarchy.indexOf(score.current_tier)
    const requiredIndex = tierHierarchy.indexOf(requiredTier)
    
    return {
      eligible: currentIndex >= requiredIndex,
      currentTier: score.current_tier
    }
  } catch (error) {
    console.error('Error checking user tier:', error)
    return { eligible: false, currentTier: 'Unknown' }
  }
}

// 获取用户LAC余额作为投票权重
async function getUserVoteWeight(userId: string, supabase: any): Promise<number> {
  try {
    // 这里应该查询用户的LAC余额
    // 暂时返回固定值1.0，实际应用时需要连接钱包余额查询
    return 1.0
  } catch (error) {
    console.error('Error getting vote weight:', error)
    return 1.0
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      action, 
      user_id, 
      proposal_id, 
      title, 
      description, 
      duration_days = 7,
      vote,
      status,
      page = 1,
      limit = 10
    } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    switch (action) {
      case 'create': {
        if (!user_id || !title) {
          return new Response(
            JSON.stringify({ error: 'user_id and title are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 检查用户等级（需要Builder及以上）
        const tierCheck = await checkUserTier(user_id, supabase, 'Builder')
        if (!tierCheck.eligible) {
          return new Response(
            JSON.stringify({ 
              error: `Insufficient tier. Current: ${tierCheck.currentTier}, Required: Builder or above` 
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const endTime = new Date()
        endTime.setDate(endTime.getDate() + duration_days)

        const { data: proposal, error } = await supabase
          .from('governance_proposals')
          .insert({
            author_id: user_id,
            title,
            description,
            end_time: endTime.toISOString(),
            status: 'active'
          })
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to create proposal: ${error.message}`)
        }

        return new Response(
          JSON.stringify({
            success: true,
            proposal
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'vote': {
        if (!user_id || !proposal_id || !vote) {
          return new Response(
            JSON.stringify({ error: 'user_id, proposal_id, and vote are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!['yes', 'no'].includes(vote)) {
          return new Response(
            JSON.stringify({ error: 'vote must be "yes" or "no"' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 检查用户等级（需要Pioneer及以上）
        const tierCheck = await checkUserTier(user_id, supabase, 'Pioneer')
        if (!tierCheck.eligible) {
          return new Response(
            JSON.stringify({ 
              error: `Insufficient tier. Current: ${tierCheck.currentTier}, Required: Pioneer or above` 
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 检查提案状态
        const { data: proposals, error: proposalError } = await supabase
          .from('governance_proposals')
          .select('id, status, end_time')
          .eq('id', proposal_id)

        if (proposalError) {
          throw new Error(`Failed to check proposal: ${proposalError.message}`)
        }

        if (!proposals || proposals.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Proposal not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const proposal = proposals[0]
        if (proposal.status !== 'active') {
          return new Response(
            JSON.stringify({ error: 'Proposal is not active' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (new Date(proposal.end_time) < new Date()) {
          return new Response(
            JSON.stringify({ error: 'Proposal has ended' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 检查重复投票
        const { data: existingVotes, error: voteCheckError } = await supabase
          .from('governance_votes')
          .select('id')
          .eq('proposal_id', proposal_id)
          .eq('voter_id', user_id)

        if (voteCheckError) {
          throw new Error(`Failed to check existing votes: ${voteCheckError.message}`)
        }

        if (existingVotes && existingVotes.length > 0) {
          return new Response(
            JSON.stringify({ error: 'You have already voted on this proposal' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 获取投票权重
        const voteWeight = await getUserVoteWeight(user_id, supabase)

        // 记录投票
        const { data: voteRecord, error: voteError } = await supabase
          .from('governance_votes')
          .insert({
            proposal_id,
            voter_id: user_id,
            vote,
            vote_weight: voteWeight
          })
          .select()
          .single()

        if (voteError) {
          throw new Error(`Failed to record vote: ${voteError.message}`)
        }

        // 更新提案投票统计
        const updateField = vote === 'yes' ? 'yes_votes' : 'no_votes'
        const { error: updateError } = await supabase
          .from('governance_proposals')
          .update({
            [updateField]: supabase.sql`${updateField} + ${voteWeight}`,
            total_votes: supabase.sql`total_votes + ${voteWeight}`
          })
          .eq('id', proposal_id)

        if (updateError) {
          console.error('Failed to update vote counts:', updateError)
        }

        return new Response(
          JSON.stringify({
            success: true,
            vote: voteRecord,
            weight: voteWeight
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'list': {
        let query = supabase
          .from('governance_proposals')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (status) {
          query = query.eq('status', status)
        }

        const offset = (page - 1) * limit
        const { data: proposals, error } = await query.range(offset, offset + limit - 1)

        if (error) {
          throw new Error(`Failed to fetch proposals: ${error.message}`)
        }

        return new Response(
          JSON.stringify({
            proposals: proposals || [],
            page,
            limit
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'detail': {
        if (!proposal_id) {
          return new Response(
            JSON.stringify({ error: 'proposal_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: proposals, error: proposalError } = await supabase
          .from('governance_proposals')
          .select('*')
          .eq('id', proposal_id)

        if (proposalError) {
          throw new Error(`Failed to fetch proposal: ${proposalError.message}`)
        }

        if (!proposals || proposals.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Proposal not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const proposal = proposals[0]

        // 获取投票详情
        const { data: votes, error: votesError } = await supabase
          .from('governance_votes')
          .select('vote, voter_id, vote_weight, created_at')
          .eq('proposal_id', proposal_id)
          .order('created_at', { ascending: false })

        if (votesError) {
          console.error('Error fetching votes:', votesError)
        }

        return new Response(
          JSON.stringify({
            proposal,
            votes: votes || [],
            vote_summary: {
              yes_votes: proposal.yes_votes || 0,
              no_votes: proposal.no_votes || 0,
              total_votes: proposal.total_votes || 0,
              participation: (votes || []).length
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'result': {
        if (!proposal_id) {
          return new Response(
            JSON.stringify({ error: 'proposal_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: proposals, error } = await supabase
          .from('governance_proposals')
          .select('*')
          .eq('id', proposal_id)

        if (error) {
          throw new Error(`Failed to fetch proposal: ${error.message}`)
        }

        if (!proposals || proposals.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Proposal not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const proposal = proposals[0]
        const isExpired = new Date(proposal.end_time) < new Date()
        
        let finalStatus = proposal.status
        if (isExpired && proposal.status === 'active') {
          // 自动更新过期提案的状态
          const yesVotes = proposal.yes_votes || 0
          const noVotes = proposal.no_votes || 0
          
          if (yesVotes > noVotes) {
            finalStatus = 'passed'
          } else if (noVotes > yesVotes) {
            finalStatus = 'rejected'  
          } else {
            finalStatus = 'expired'
          }

          // 更新数据库状态
          await supabase
            .from('governance_proposals')
            .update({ status: finalStatus })
            .eq('id', proposal_id)
        }

        return new Response(
          JSON.stringify({
            proposal: { ...proposal, status: finalStatus },
            result: {
              status: finalStatus,
              yes_votes: proposal.yes_votes || 0,
              no_votes: proposal.no_votes || 0,
              total_votes: proposal.total_votes || 0,
              is_expired: isExpired,
              winner: (proposal.yes_votes || 0) > (proposal.no_votes || 0) ? 'yes' : 
                     (proposal.no_votes || 0) > (proposal.yes_votes || 0) ? 'no' : 'tie'
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: create, vote, list, detail, or result' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error in governance-vote function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})