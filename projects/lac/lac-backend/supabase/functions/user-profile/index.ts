import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface UpdateProfileRequest {
  username?: string;
  bio?: string;
  avatar_url?: string;
  social_links?: {
    twitter?: string;
    discord?: string;
    github?: string;
    website?: string;
  };
}

interface ProfileResponse {
  success: boolean;
  data?: {
    id: string;
    username: string;
    email?: string;
    avatar_url?: string;
    bio?: string;
    level: number;
    xp: number;
    lac_balance: number;
    points_balance: number;
    streak_days: number;
    total_mining_earned: number;
    social_links?: any;
    created_at: string;
    stats: {
      lessons_completed: number;
      content_published: number;
      achievements_unlocked: number;
      days_active: number;
    };
    wallets: any[];
    recent_achievements?: any[];
    level_progress: {
      current_xp: number;
      next_level_xp: number;
      progress_percentage: number;
    };
  };
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. 验证用户身份
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: '未提供认证信息' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: session } = await supabase
      .from('user_sessions')
      .select('user_id')
      .eq('session_token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session) {
      return new Response(
        JSON.stringify({ success: false, error: '认证失败或会话已过期' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = session.user_id;

    if (req.method === 'GET') {
      return await handleGetProfile(supabase, userId);
    } else if (req.method === 'PUT') {
      return await handleUpdateProfile(req, supabase, userId);
    } else {
      return new Response(
        JSON.stringify({ success: false, error: '不支持的请求方法' }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error('处理用户资料失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '处理用户资料失败'
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// 获取用户资料
async function handleGetProfile(supabase: any, userId: string): Promise<Response> {
  try {
    // 1. 获取用户基本信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: '用户不存在' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. 获取用户钱包
    const { data: wallets } = await supabase
      .from('user_wallets')
      .select('address, chain, is_primary, verified, created_at')
      .eq('user_id', userId);

    // 3. 获取用户统计数据
    const stats = await getUserStats(supabase, userId);

    // 4. 获取最近解锁的成就
    const { data: recentAchievements } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(name, description, icon_url, rarity)
      `)
      .eq('user_id', userId)
      .eq('unlocked', true)
      .order('unlocked_at', { ascending: false })
      .limit(5);

    // 5. 计算等级进度
    const levelProgress = calculateLevelProgress(user.level, user.xp);

    // 6. 构造响应
    const profileData: ProfileResponse['data'] = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      bio: user.bio,
      level: user.level,
      xp: user.xp,
      lac_balance: parseFloat(user.lac_balance),
      points_balance: user.points_balance,
      streak_days: user.streak_days,
      total_mining_earned: parseFloat(user.total_mining_earned),
      social_links: user.social_links,
      created_at: user.created_at,
      stats,
      wallets: wallets || [],
      recent_achievements: recentAchievements || [],
      level_progress: levelProgress
    };

    return new Response(
      JSON.stringify({ success: true, data: profileData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('获取用户资料失败:', error);
    return new Response(
      JSON.stringify({ success: false, error: '获取用户资料失败' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// 更新用户资料
async function handleUpdateProfile(req: Request, supabase: any, userId: string): Promise<Response> {
  try {
    const updates = await req.json() as UpdateProfileRequest;

    // 1. 验证更新数据
    const validation = validateProfileUpdates(updates);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. 检查用户名是否被占用（如果要更新用户名）
    if (updates.username) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', updates.username)
        .neq('id', userId)
        .single();

      if (existingUser) {
        return new Response(
          JSON.stringify({ success: false, error: '用户名已被占用' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 3. 准备更新数据
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;
    if (updates.social_links !== undefined) updateData.social_links = updates.social_links;

    // 4. 执行更新
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('更新用户资料失败:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: '更新失败，请稍后重试' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. 返回更新后的资料（复用GET逻辑）
    return await handleGetProfile(supabase, userId);

  } catch (error) {
    console.error('更新用户资料失败:', error);
    return new Response(
      JSON.stringify({ success: false, error: '更新用户资料失败' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// 获取用户统计数据
async function getUserStats(supabase: any, userId: string) {
  try {
    // 完成的课程数量
    const { count: lessonsCompleted } = await supabase
      .from('user_lesson_progress')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'completed');

    // 发布的教学内容数量
    const { count: contentPublished } = await supabase
      .from('teaching_contents')
      .select('id', { count: 'exact' })
      .eq('author_id', userId)
      .eq('status', 'published');

    // 解锁的成就数量
    const { count: achievementsUnlocked } = await supabase
      .from('user_achievements')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('unlocked', true);

    // 活跃天数（有挖矿记录的天数）
    const { data: miningDays } = await supabase
      .from('daily_mining_stats')
      .select('date')
      .eq('user_id', userId);

    const daysActive = miningDays?.length || 0;

    return {
      lessons_completed: lessonsCompleted || 0,
      content_published: contentPublished || 0,
      achievements_unlocked: achievementsUnlocked || 0,
      days_active: daysActive
    };

  } catch (error) {
    console.error('获取用户统计失败:', error);
    return {
      lessons_completed: 0,
      content_published: 0,
      achievements_unlocked: 0,
      days_active: 0
    };
  }
}

// 计算等级进度
function calculateLevelProgress(currentLevel: number, currentXP: number) {
  const levelRequirements = {
    1: 0,
    2: 500,
    3: 2000,
    4: 8000,
    5: 25000,
    6: 80000
  };

  const currentLevelXP = levelRequirements[currentLevel] || 0;
  const nextLevel = currentLevel + 1;
  const nextLevelXP = levelRequirements[nextLevel] || levelRequirements[6];

  let progressPercentage = 100; // 满级默认100%
  
  if (nextLevel <= 6) {
    const xpNeeded = nextLevelXP - currentLevelXP;
    const xpProgress = currentXP - currentLevelXP;
    progressPercentage = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100));
  }

  return {
    current_xp: currentXP,
    next_level_xp: nextLevel <= 6 ? nextLevelXP : currentXP,
    progress_percentage: Math.round(progressPercentage * 100) / 100
  };
}

// 验证资料更新数据
function validateProfileUpdates(updates: UpdateProfileRequest): { valid: boolean; error?: string } {
  // 用户名验证
  if (updates.username !== undefined) {
    if (!updates.username || updates.username.length < 3 || updates.username.length > 20) {
      return { valid: false, error: '用户名长度必须在3-20个字符之间' };
    }
    
    const usernameRegex = /^[a-zA-Z0-9_\u4e00-\u9fa5]{3,20}$/;
    if (!usernameRegex.test(updates.username)) {
      return { valid: false, error: '用户名格式不正确（支持中英文数字下划线）' };
    }
  }

  // 个人简介验证
  if (updates.bio !== undefined && updates.bio.length > 200) {
    return { valid: false, error: '个人简介不能超过200个字符' };
  }

  // 头像URL验证
  if (updates.avatar_url !== undefined && updates.avatar_url) {
    try {
      new URL(updates.avatar_url);
    } catch {
      return { valid: false, error: '头像URL格式不正确' };
    }
  }

  // 社交链接验证
  if (updates.social_links) {
    const { twitter, discord, github, website } = updates.social_links;
    
    if (twitter && !isValidSocialLink(twitter, 'twitter')) {
      return { valid: false, error: 'Twitter链接格式不正确' };
    }
    
    if (discord && !isValidSocialLink(discord, 'discord')) {
      return { valid: false, error: 'Discord链接格式不正确' };
    }
    
    if (github && !isValidSocialLink(github, 'github')) {
      return { valid: false, error: 'GitHub链接格式不正确' };
    }
    
    if (website && !isValidSocialLink(website, 'website')) {
      return { valid: false, error: '网站链接格式不正确' };
    }
  }

  return { valid: true };
}

// 验证社交链接
function isValidSocialLink(link: string, platform: string): boolean {
  try {
    const url = new URL(link);
    
    switch (platform) {
      case 'twitter':
        return url.hostname === 'twitter.com' || url.hostname === 'x.com';
      case 'discord':
        return url.hostname === 'discord.gg' || url.hostname === 'discord.com';
      case 'github':
        return url.hostname === 'github.com';
      case 'website':
        return url.protocol === 'http:' || url.protocol === 'https:';
      default:
        return false;
    }
  } catch {
    return false;
  }
}