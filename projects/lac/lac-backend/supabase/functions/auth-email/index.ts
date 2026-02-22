import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// bcrypt removed — incompatible with Deno edge runtime (salt.charAt error)
// Using SHA-256 with random salt instead
import { corsHeaders } from '../_shared/cors.ts';
import { withRateLimit, RATE_LIMITS, getClientIP, createRateLimitKey, checkRateLimit } from '../_shared/rate-limiter.ts';

interface EmailSignupRequest {
  email: string;
  username: string;
  password: string;
  inviteCode?: string;
}

interface EmailSigninRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: any;
    session: any;
    accessToken: string;
    isNewUser?: boolean;
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

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop(); // 'signup' or 'signin'

    if (action === 'signup') {
      return await handleEmailSignup(req, supabase);
    } else if (action === 'signin') {
      return await handleEmailSignin(req, supabase);
    } else {
      return new Response(
        JSON.stringify({ success: false, error: '无效的操作' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

  } catch (error) {
    console.error('认证失败:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || '认证失败' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function handleEmailSignup(req: Request, supabase: any): Promise<Response> {
  const clientIP = getClientIP(req);
  
  // 速率限制检查：注册每IP每小时最多5次
  const ipRateLimit = await checkRateLimit(
    supabase, 
    createRateLimitKey('ip', clientIP, 'signup'), 
    RATE_LIMITS.SIGNUP_IP
  );
  
  if (!ipRateLimit.allowed) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: '注册请求过于频繁，请稍后重试',
        retryAfter: ipRateLimit.retryAfter
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          'Retry-After': ipRateLimit.retryAfter?.toString() || '3600'
        }
      }
    );
  }

  const { email, username, password, inviteCode } = await req.json() as EmailSignupRequest;

  // 1. 基础验证
  if (!email || !username || !password) {
    return new Response(
      JSON.stringify({ success: false, error: '邮箱、用户名和密码不能为空' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({ success: false, error: '邮箱格式不正确' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  // 验证密码强度
  if (password.length < 8) {
    return new Response(
      JSON.stringify({ success: false, error: '密码长度不能少于8位' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  // 验证用户名格式
  const usernameRegex = /^[a-zA-Z0-9_\u4e00-\u9fa5]{3,20}$/;
  if (!usernameRegex.test(username)) {
    return new Response(
      JSON.stringify({ success: false, error: '用户名格式不正确（3-20位，支持中英文数字下划线）' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  // 2. 检查邮箱和用户名是否已存在
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email, username')
    .or(`email.eq.${email},username.eq.${username}`)
    .single();

  if (existingUser) {
    const error = existingUser.email === email ? '邮箱已被注册' : '用户名已被占用';
    return new Response(
      JSON.stringify({ success: false, error }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  // 3. 验证邀请码（如果提供）
  let inviterUserId = null;
  if (inviteCode) {
    // TODO: 实现邀请码验证逻辑
    console.log('邀请码:', inviteCode);
  }

  // 4. 创建用户
  const passwordHash = await hashPassword(password);
  
  const { data: newUser, error: userError } = await supabase
    .from('users')
    .insert({
      username,
      email,
      email_verified: false, // 需要邮箱验证
      level: 1,
      xp: 0,
      lac_balance: 0,
      points_balance: 0,
      status: 'active',
      streak_days: 0,
      preferences: {
        password_hash: passwordHash,
        inviter_id: inviterUserId
      }
    })
    .select()
    .single();

  if (userError || !newUser) {
    console.error('创建用户失败:', userError);
    return new Response(
      JSON.stringify({ success: false, error: '注册失败，请稍后重试' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  // 5. 创建会话
  const sessionToken = generateSessionToken();
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时

  await supabase
    .from('user_sessions')
    .insert({
      user_id: newUser.id,
      session_token: sessionToken,
      refresh_token: refreshToken,
      expires_at: expiresAt.toISOString(),
      ip_address: null,
      user_agent: req.headers.get('user-agent')
    });

  // 6. 触发新用户成就
  await checkAchievementProgress(supabase, newUser.id, '880e8400-e29b-41d4-a716-446655440001');

  // 7. 发送验证邮件（TODO）
  // await sendVerificationEmail(email, newUser.id);

  const response: AuthResponse = {
    success: true,
    data: {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        email_verified: newUser.email_verified,
        level: newUser.level,
        xp: newUser.xp,
        lac_balance: parseFloat(newUser.lac_balance),
        points_balance: newUser.points_balance,
        streak_days: newUser.streak_days,
        avatar_url: newUser.avatar_url,
        bio: newUser.bio
      },
      session: {
        access_token: sessionToken,
        expires_at: expiresAt.toISOString()
      },
      accessToken: sessionToken,
      isNewUser: true
    }
  };

  return new Response(
    JSON.stringify(response),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleEmailSignin(req: Request, supabase: any): Promise<Response> {
  const clientIP = getClientIP(req);
  const { email, password } = await req.json() as EmailSigninRequest;

  // 速率限制检查：IP级别限制
  const ipRateLimit = await checkRateLimit(
    supabase,
    createRateLimitKey('ip', clientIP, 'signin'),
    RATE_LIMITS.SIGNIN_IP
  );

  if (!ipRateLimit.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: '登录请求过于频繁，请稍后重试',
        retryAfter: ipRateLimit.retryAfter
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          'Retry-After': ipRateLimit.retryAfter?.toString() || '60'
        }
      }
    );
  }

  // 速率限制检查：邮箱级别限制
  const emailRateLimit = await checkRateLimit(
    supabase,
    createRateLimitKey('email', email, 'signin'),
    RATE_LIMITS.SIGNIN_EMAIL
  );

  if (!emailRateLimit.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: '该邮箱登录请求过于频繁，请稍后重试',
        retryAfter: emailRateLimit.retryAfter
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          'Retry-After': emailRateLimit.retryAfter?.toString() || '180'
        }
      }
    );
  }

  // 1. 基础验证
  if (!email || !password) {
    return new Response(
      JSON.stringify({ success: false, error: '邮箱和密码不能为空' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  // 2. 查找用户
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('status', 'active')
    .single();

  if (!user) {
    return new Response(
      JSON.stringify({ success: false, error: '邮箱或密码错误' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  // 3. 验证密码（支持旧密码自动迁移）
  const passwordHash = user.preferences?.password_hash;
  if (!passwordHash || !(await verifyPassword(password, passwordHash, user.id, supabase))) {
    return new Response(
      JSON.stringify({ success: false, error: '邮箱或密码错误' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  // 4. 创建新会话
  const sessionToken = generateSessionToken();
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await supabase
    .from('user_sessions')
    .insert({
      user_id: user.id,
      session_token: sessionToken,
      refresh_token: refreshToken,
      expires_at: expiresAt.toISOString(),
      ip_address: null,
      user_agent: req.headers.get('user-agent')
    });

  const response: AuthResponse = {
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        email_verified: user.email_verified,
        level: user.level,
        xp: user.xp,
        lac_balance: parseFloat(user.lac_balance),
        points_balance: user.points_balance,
        streak_days: user.streak_days,
        avatar_url: user.avatar_url,
        bio: user.bio
      },
      session: {
        access_token: sessionToken,
        expires_at: expiresAt.toISOString()
      },
      accessToken: sessionToken,
      isNewUser: false
    }
  };

  return new Response(
    JSON.stringify(response),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// 生成会话Token
function generateSessionToken(): string {
  return 'lac_session_' + crypto.randomUUID();
}

// 生成刷新Token
function generateRefreshToken(): string {
  return 'lac_refresh_' + crypto.randomUUID();
}

// SHA-256 with random salt (compatible with Deno edge runtime)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.randomUUID();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `sha256:${salt}:${hash}`;
}

// 统一密码验证（支持新格式和旧格式）
async function verifyPassword(password: string, stored: string, userId?: string, supabase?: any): Promise<boolean> {
  const encoder = new TextEncoder();
  
  // 新格式: sha256:salt:hash
  if (stored.startsWith('sha256:')) {
    const parts = stored.split(':');
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const expectedHash = parts[2];
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const actualHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return actualHash === expectedHash;
  }
  
  // 旧格式: plain SHA-256 with fixed salt
  const data = encoder.encode(password + 'lac_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const legacyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const isValid = legacyHash === stored;
  
  // 自动迁移到新格式
  if (isValid && userId && supabase) {
    try {
      const newHash = await hashPassword(password);
      const { data: userData } = await supabase.from('users').select('preferences').eq('id', userId).single();
      await supabase.from('users').update({
        preferences: { ...(userData?.preferences || {}), password_hash: newHash },
        updated_at: new Date().toISOString()
      }).eq('id', userId);
    } catch (e) { console.error('密码迁移失败:', e); }
  }
  
  return isValid;
}

// 检查成就进度
async function checkAchievementProgress(supabase: any, userId: string, achievementId: string): Promise<void> {
  try {
    await supabase.rpc('check_achievement_progress', {
      p_user_id: userId,
      p_achievement_id: achievementId
    });
  } catch (error) {
    console.error('检查成就失败:', error);
  }
}