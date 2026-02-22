import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface ConnectWalletRequest {
  address: string;
  signature: string;
  message: string;
  chain?: string;
  username?: string; // 新用户注册时提供
}

interface ConnectWalletResponse {
  success: boolean;
  data?: {
    user: any;
    session: any;
    accessToken: string;
    isNewUser: boolean;
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

    const { address, signature, message, chain = 'solana', username } = await req.json() as ConnectWalletRequest;

    // 1. 验证钱包签名
    const isValidSignature = await verifyWalletSignature(address, signature, message, chain);
    
    if (!isValidSignature) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '钱包签名验证失败' 
        } as ConnectWalletResponse),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // 2. 检查钱包是否已存在
    const { data: existingWallet } = await supabase
      .from('user_wallets')
      .select(`
        *,
        user:users(*)
      `)
      .eq('address', address)
      .eq('chain', chain)
      .single();

    let user;
    let isNewUser = false;
    let accessToken;

    if (existingWallet) {
      // 3a. 已存在用户，直接登录
      user = existingWallet.user;
      
      // 创建会话
      const sessionToken = generateSessionToken();
      const refreshToken = generateRefreshToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时

      // 插入会话记录
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

      accessToken = sessionToken;

    } else {
      // 3b. 新用户，需要注册
      if (!username) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: '新用户需要提供用户名' 
          } as ConnectWalletResponse),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // 检查用户名是否已被占用
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (existingUser) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: '用户名已被占用' 
          } as ConnectWalletResponse),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // 创建新用户
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          username,
          level: 1,
          xp: 0,
          lac_balance: 0,
          points_balance: 0,
          status: 'active',
          streak_days: 0
        })
        .select()
        .single();

      if (userError || !newUser) {
        console.error('创建用户失败:', userError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: '创建用户失败' 
          } as ConnectWalletResponse),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // 绑定钱包
      await supabase
        .from('user_wallets')
        .insert({
          user_id: newUser.id,
          address,
          chain,
          is_primary: true,
          verified: true
        });

      user = newUser;
      isNewUser = true;

      // 创建会话
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

      accessToken = sessionToken;

      // 触发新用户成就检查
      await checkAchievementProgress(supabase, user.id, '880e8400-e29b-41d4-a716-446655440001'); // 初来乍到
    }

    // 4. 返回成功响应
    const response: ConnectWalletResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          level: user.level,
          xp: user.xp,
          lac_balance: parseFloat(user.lac_balance),
          points_balance: user.points_balance,
          streak_days: user.streak_days,
          avatar_url: user.avatar_url,
          bio: user.bio
        },
        session: {
          access_token: accessToken,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        accessToken,
        isNewUser
      }
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error('钱包连接失败:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || '钱包连接失败' 
      } as ConnectWalletResponse),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// 验证钱包签名（简化版本，实际需要根据不同链实现）
async function verifyWalletSignature(address: string, signature: string, message: string, chain: string): Promise<boolean> {
  try {
    // 这里应该根据不同的区块链实现具体的签名验证逻辑
    // 对于Solana，需要使用@solana/web3.js
    // 对于以太坊，需要使用ethers.js
    
    // 简化实现：检查基本格式
    if (!address || !signature || !message) {
      return false;
    }

    // TODO: 实际的签名验证逻辑
    // 这里应该验证message是否是我们生成的challenge
    // 并且signature是否是用对应私钥签名的
    
    console.log(`验证${chain}链钱包签名: ${address}, 消息: ${message}`);
    
    // 暂时返回true，实际部署时需要实现真实的签名验证
    return true;

  } catch (error) {
    console.error('签名验证失败:', error);
    return false;
  }
}

// 生成会话Token
function generateSessionToken(): string {
  return 'lac_session_' + crypto.randomUUID();
}

// 生成刷新Token
function generateRefreshToken(): string {
  return 'lac_refresh_' + crypto.randomUUID();
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