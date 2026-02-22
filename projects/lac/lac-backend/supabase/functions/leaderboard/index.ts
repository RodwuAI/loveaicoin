import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  level: number;
  score: number;
  change?: number; // 排名变化
  metrics?: any; // 详细指标
  is_current_user?: boolean;
}

interface LeaderboardResponse {
  success: boolean;
  data?: {
    board_type: string;
    period: string;
    period_start: string;
    entries: LeaderboardEntry[];
    current_user_rank?: {
      rank: number;
      score: number;
      entry: LeaderboardEntry;
    };
    total_participants: number;
    last_updated: string;
  };
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ success: false, error: '只支持GET请求' }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. 解析查询参数
    const url = new URL(req.url);
    const boardType = url.searchParams.get('type') || 'learning'; // learning, teaching, creation, wealth
    const period = url.searchParams.get('period') || 'weekly'; // daily, weekly, monthly, all_time
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);

    // 2. 验证参数
    const validBoardTypes = ['learning', 'teaching', 'creation', 'wealth'];
    const validPeriods = ['daily', 'weekly', 'monthly', 'all_time'];

    if (!validBoardTypes.includes(boardType)) {
      return new Response(
        JSON.stringify({ success: false, error: '无效的排行榜类型' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!validPeriods.includes(period)) {
      return new Response(
        JSON.stringify({ success: false, error: '无效的时间周期' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. 获取用户ID（用于标记当前用户）
    let currentUserId = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: session } = await supabase
        .from('user_sessions')
        .select('user_id')
        .eq('session_token', token)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (session) {
        currentUserId = session.user_id;
      }
    }

    // 4. 计算时间范围
    const periodStart = calculatePeriodStart(period);

    // 5. 获取排行榜数据
    let leaderboardData;
    
    if (boardType === 'wealth') {
      // 财富排行榜直接从用户表获取
      leaderboardData = await getWealthLeaderboard(supabase, limit, offset, currentUserId);
    } else {
      // 其他排行榜从缓存表获取
      leaderboardData = await getCachedLeaderboard(supabase, boardType, period, periodStart, limit, offset, currentUserId);
    }

    if (!leaderboardData.success) {
      return new Response(
        JSON.stringify({ success: false, error: leaderboardData.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. 构造响应
    const response: LeaderboardResponse = {
      success: true,
      data: {
        board_type: boardType,
        period,
        period_start: periodStart,
        entries: leaderboardData.entries,
        current_user_rank: leaderboardData.currentUserRank,
        total_participants: leaderboardData.totalParticipants,
        last_updated: new Date().toISOString()
      }
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('获取排行榜失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '获取排行榜失败'
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// 计算时间周期开始日期
function calculatePeriodStart(period: string): string {
  const now = new Date();
  let periodStart = new Date();

  switch (period) {
    case 'daily':
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      // 计算本周一
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToMonday);
      break;
    case 'monthly':
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'all_time':
      periodStart = new Date('2026-01-01'); // LAC项目开始时间
      break;
  }

  return periodStart.toISOString().split('T')[0];
}

// 获取财富排行榜
async function getWealthLeaderboard(supabase: any, limit: number, offset: number, currentUserId: string | null) {
  try {
    // 获取排行榜数据
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, avatar_url, level, lac_balance, total_mining_earned')
      .eq('status', 'active')
      .order('lac_balance', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return { success: false, error: '获取财富排行榜失败' };
    }

    // 格式化数据
    const entries: LeaderboardEntry[] = users.map((user, index) => ({
      rank: offset + index + 1,
      user_id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      level: user.level,
      score: parseFloat(user.lac_balance),
      metrics: {
        lac_balance: parseFloat(user.lac_balance),
        total_mining_earned: parseFloat(user.total_mining_earned)
      },
      is_current_user: currentUserId === user.id
    }));

    // 获取当前用户排名（如果已认证）
    let currentUserRank = null;
    if (currentUserId) {
      const { data: userRankData } = await supabase
        .rpc('get_user_wealth_rank', { user_id: currentUserId });
      
      if (userRankData) {
        const { data: currentUser } = await supabase
          .from('users')
          .select('username, avatar_url, level, lac_balance')
          .eq('id', currentUserId)
          .single();

        if (currentUser) {
          currentUserRank = {
            rank: userRankData.rank,
            score: parseFloat(currentUser.lac_balance),
            entry: {
              rank: userRankData.rank,
              user_id: currentUserId,
              username: currentUser.username,
              avatar_url: currentUser.avatar_url,
              level: currentUser.level,
              score: parseFloat(currentUser.lac_balance),
              is_current_user: true
            } as LeaderboardEntry
          };
        }
      }
    }

    // 获取总参与人数
    const { count: totalParticipants } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('status', 'active')
      .gt('lac_balance', 0);

    return {
      success: true,
      entries,
      currentUserRank,
      totalParticipants: totalParticipants || 0
    };

  } catch (error) {
    console.error('获取财富排行榜失败:', error);
    return { success: false, error: '获取财富排行榜失败' };
  }
}

// 获取缓存的排行榜数据
async function getCachedLeaderboard(supabase: any, boardType: string, period: string, periodStart: string, limit: number, offset: number, currentUserId: string | null) {
  try {
    // 检查是否需要更新缓存
    await updateLeaderboardIfNeeded(supabase, boardType, period, periodStart);

    // 获取排行榜数据
    const { data: leaderboardData, error } = await supabase
      .from('leaderboard_cache')
      .select(`
        rank,
        user_id,
        score,
        metrics,
        user:users(username, avatar_url, level)
      `)
      .eq('board_type', boardType)
      .eq('period', period)
      .eq('period_start', periodStart)
      .order('rank', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return { success: false, error: '获取排行榜数据失败' };
    }

    // 格式化数据
    const entries: LeaderboardEntry[] = leaderboardData.map(item => ({
      rank: item.rank,
      user_id: item.user_id,
      username: item.user.username,
      avatar_url: item.user.avatar_url,
      level: item.user.level,
      score: parseFloat(item.score),
      metrics: item.metrics,
      is_current_user: currentUserId === item.user_id
    }));

    // 获取当前用户排名
    let currentUserRank = null;
    if (currentUserId) {
      const { data: userRankData } = await supabase
        .from('leaderboard_cache')
        .select(`
          rank,
          score,
          user:users(username, avatar_url, level)
        `)
        .eq('board_type', boardType)
        .eq('period', period)
        .eq('period_start', periodStart)
        .eq('user_id', currentUserId)
        .single();

      if (userRankData) {
        currentUserRank = {
          rank: userRankData.rank,
          score: parseFloat(userRankData.score),
          entry: {
            rank: userRankData.rank,
            user_id: currentUserId,
            username: userRankData.user.username,
            avatar_url: userRankData.user.avatar_url,
            level: userRankData.user.level,
            score: parseFloat(userRankData.score),
            is_current_user: true
          } as LeaderboardEntry
        };
      }
    }

    // 获取总参与人数
    const { count: totalParticipants } = await supabase
      .from('leaderboard_cache')
      .select('user_id', { count: 'exact' })
      .eq('board_type', boardType)
      .eq('period', period)
      .eq('period_start', periodStart);

    return {
      success: true,
      entries,
      currentUserRank,
      totalParticipants: totalParticipants || 0
    };

  } catch (error) {
    console.error('获取缓存排行榜失败:', error);
    return { success: false, error: '获取排行榜数据失败' };
  }
}

// 检查并更新排行榜缓存
async function updateLeaderboardIfNeeded(supabase: any, boardType: string, period: string, periodStart: string) {
  try {
    // 检查最后更新时间
    const { data: lastUpdate } = await supabase
      .from('leaderboard_cache')
      .select('updated_at')
      .eq('board_type', boardType)
      .eq('period', period)
      .eq('period_start', periodStart)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    const now = new Date();
    const shouldUpdate = !lastUpdate || 
      (now.getTime() - new Date(lastUpdate.updated_at).getTime()) > 5 * 60 * 1000; // 5分钟

    if (shouldUpdate) {
      console.log(`更新排行榜缓存: ${boardType}-${period}-${periodStart}`);
      await supabase.rpc('update_leaderboard', {
        p_board_type: boardType,
        p_period: period,
        p_period_start: periodStart
      });
    }

  } catch (error) {
    console.error('更新排行榜缓存失败:', error);
    // 不抛出错误，继续使用旧缓存
  }
}