import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Achievement {
  id: string
  name: string
  description: string
  unlock_condition: any
  lac_reward: number
  xp_reward: number
  points_reward: number
  category: string
  unlock_count: number
}

interface UserData {
  consecutive_checkin_days?: number
  total_checkin_days?: number
  lessons_completed?: number
  courses_completed?: number
  invites_count?: number
  prompt_templates_created?: number
  mining_total?: number
  ai_tools_used?: number
}

// 检查用户数据是否满足成就条件
function checkAchievementCondition(condition: any, userData: UserData): boolean {
  switch (condition.type) {
    case 'consecutive_checkin':
      return (userData.consecutive_checkin_days || 0) >= condition.target

    case 'total_checkin':
      return (userData.total_checkin_days || 0) >= condition.target

    case 'lessons_completed':
      return (userData.lessons_completed || 0) >= condition.target

    case 'courses_completed':
      return (userData.courses_completed || 0) >= condition.target

    case 'invites_sent':
      return (userData.invites_count || 0) >= condition.target

    case 'prompt_templates':
      return (userData.prompt_templates_created || 0) >= condition.target

    case 'mining_total':
      return (userData.mining_total || 0) >= condition.target

    case 'ai_tools_used':
      return (userData.ai_tools_used || 0) >= condition.target

    default:
      return false
  }
}

// 获取用户的行为数据
async function getUserData(userId: string, supabase: any): Promise<UserData> {
  const userData: UserData = {}

  try {
    // 获取签到数据
    const { data: streaks } = await supabase
      .from('mining_streak')
      .select('current_streak, total_days')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (streaks && streaks.length > 0) {
      userData.consecutive_checkin_days = streaks[0].current_streak || 0
      userData.total_checkin_days = streaks[0].total_days || 0
    }

    // 获取课程学习数据
    const { data: lessons } = await supabase
      .from('mining_learn')
      .select('id')
      .eq('user_id', userId)

    if (lessons) {
      userData.lessons_completed = lessons.length
      userData.courses_completed = Math.floor(lessons.length / 10)
    }

    // 获取邀请数据
    const { data: invites } = await supabase
      .from('invitations')
      .select('id')
      .eq('inviter_id', userId)

    if (invites) {
      userData.invites_count = invites.length
    }

    // 获取Prompt模板数据
    const { data: prompts } = await supabase
      .from('prompt_market')
      .select('id')
      .eq('author_id', userId)

    if (prompts) {
      userData.prompt_templates_created = prompts.length
    }

    // 获取挖矿数据 - 尝试多种表名
    try {
      const { data: miningData } = await supabase.rpc('get_user_mining_total', {
        user_uuid: userId
      })
      
      if (miningData && miningData.length > 0) {
        userData.mining_total = miningData[0].total_mined || 0
      } else {
        // 尝试从其他表获取挖矿数据
        const { data: miningRecords } = await supabase
          .from('mining_records')
          .select('amount')
          .eq('user_id', userId)
        
        if (miningRecords) {
          userData.mining_total = miningRecords.reduce((sum: number, record: any) => 
            sum + (record.amount || 0), 0)
        }
      }
    } catch (e) {
      userData.mining_total = 0
    }

    // AI工具使用数据
    userData.ai_tools_used = userData.lessons_completed || 0 // 简化处理

  } catch (error) {
    console.error('Error fetching user data:', error)
  }

  return userData
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, user_id } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    switch (action) {
      case 'check': {
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: 'user_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 获取用户数据
        const userData = await getUserData(user_id, supabase)

        // 获取所有活跃的成就
        const { data: achievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .eq('active', true)

        if (achievementsError) {
          throw new Error(`Failed to fetch achievements: ${achievementsError.message}`)
        }

        // 获取用户已解锁的成就
        const { data: unlockedAchievements, error: unlockedError } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', user_id)
          .eq('unlocked', true)

        const unlockedIds = new Set(
          (unlockedAchievements || []).map((ua: any) => ua.achievement_id)
        )

        // 检查可以解锁的新成就
        const newlyUnlocked = []
        
        for (const achievement of (achievements || [])) {
          if (!unlockedIds.has(achievement.id) && 
              checkAchievementCondition(achievement.unlock_condition, userData)) {
            
            // 创建用户成就记录
            const userAchievementData = {
              user_id,
              achievement_id: achievement.id,
              progress: 100,
              current_value: achievement.unlock_condition.target,
              target_value: achievement.unlock_condition.target,
              unlocked: true,
              claimed: false,
              nft_minted: false,
              unlocked_at: new Date().toISOString()
            }

            const { data: userAchievement, error: createError } = await supabase
              .from('user_achievements')
              .insert(userAchievementData)
              .select()

            if (createError) {
              console.error('Failed to create user achievement:', createError)
              continue
            }

            if (userAchievement && userAchievement.length > 0) {
              newlyUnlocked.push({
                achievement,
                user_achievement: userAchievement[0]
              })

              // 更新成就解锁计数
              const { error: countError } = await supabase
                .from('achievements')
                .update({ 
                  unlock_count: (achievement.unlock_count || 0) + 1 
                })
                .eq('id', achievement.id)

              if (countError) {
                console.error('Failed to update unlock count:', countError)
              }
            }
          }
        }

        return new Response(
          JSON.stringify({
            user_data: userData,
            newly_unlocked: newlyUnlocked,
            total_checked: achievements?.length || 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'list': {
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: 'user_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 获取用户的成就列表
        const { data: userAchievements, error } = await supabase
          .from('user_achievements')
          .select(`
            *,
            achievements (
              id,
              name,
              description,
              icon_url,
              rarity,
              category,
              lac_reward,
              xp_reward,
              points_reward
            )
          `)
          .eq('user_id', user_id)
          .eq('unlocked', true)

        if (error) {
          throw new Error(`Failed to fetch user achievements: ${error.message}`)
        }

        return new Response(
          JSON.stringify({
            achievements: userAchievements || [],
            total_unlocked: (userAchievements || []).length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'all': {
        // 获取所有可用成就
        const { data: achievements, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('active', true)
          .order('category')
          .order('name')

        if (error) {
          throw new Error(`Failed to fetch achievements: ${error.message}`)
        }

        // 按类别分组
        const groupedAchievements = (achievements || []).reduce((acc: any, achievement: Achievement) => {
          const category = achievement.category || 'other'
          if (!acc[category]) {
            acc[category] = []
          }
          acc[category].push(achievement)
          return acc
        }, {})

        return new Response(
          JSON.stringify({
            achievements: groupedAchievements,
            total_achievements: (achievements || []).length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: check, list, or all' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error in achievement-unlock function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})