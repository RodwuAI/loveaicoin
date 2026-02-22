'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import WalletButton from '@/components/WalletButton';
import { userProfileAPI, inviteSystemAPI, achievementAPI, aiRewardAPI } from '@/lib/api';

const achievements = [
  { icon: '🎓', title: '学习先锋', desc: '完成首门课程', date: '2026-02-15' },
  { icon: '🔥', title: '签到专家', desc: '连续签到7天', date: '2026-02-20' },
  { icon: '🏆', title: 'LAC百元户', desc: '累计获得100 LAC', date: '2026-02-18' },
  { icon: '👑', title: 'AI专家', desc: '达到Lv.5等级', date: '2026-02-19' },
];

const transactions = [
  { type: '学习', course: 'AI基础入门', amount: '+50', date: '2026-02-21' },
  { type: '签到', course: '每日签到', amount: '+10', date: '2026-02-21' },
  { type: '学习', course: '区块链入门', amount: '+80', date: '2026-02-20' },
  { type: '签到', course: '每日签到', amount: '+15', date: '2026-02-20' },
  { type: '教导', course: 'DeFi答疑', amount: '+120', date: '2026-02-19' },
];

export default function ProfilePage() {
  const { isLoggedIn, token, logout, loading: authLoading } = useAuth();
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [loadingSolBalance, setLoadingSolBalance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteStats, setInviteStats] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [acpScore, setAcpScore] = useState<any>(null);
  const [acpLoading, setAcpLoading] = useState(false);

  // 获取用户信息
  useEffect(() => {
    if (!isLoggedIn || !token) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await userProfileAPI.getProfile(token);
        setUserProfile(data);
        
        // 如果有用户ID，获取邀请统计和成就
        if (data.id) {
          fetchInviteStats(data.id);
          fetchAchievements(data.id);
          fetchInviteCode(data.id);
        }
        // Fetch ACP score
        fetchAcpScore();
      } catch (err: any) {
        if (err.message.includes('401')) {
          logout();
        } else {
          setError(err.message || '加载用户信息失败');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn, token, logout]);

  // 获取邀请统计
  const fetchInviteStats = async (userId: string) => {
    setInviteLoading(true);
    try {
      const data = await inviteSystemAPI.getStats(userId);
      setInviteStats(data);
    } catch (err: any) {
      console.error('获取邀请统计失败:', err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  // 获取邀请码
  const fetchInviteCode = async (userId: string) => {
    try {
      const data = await inviteSystemAPI.getInviteCode(userId);
      setInviteCode(data.invite_code || '');
    } catch (err: any) {
      console.error('获取邀请码失败:', err.message);
    }
  };

  // 获取成就列表
  const fetchAchievements = async (userId: string) => {
    setAchievementsLoading(true);
    try {
      const data = await achievementAPI.list(userId);
      setUserAchievements(data.achievements || []);
    } catch (err: any) {
      console.error('获取成就失败:', err.message);
    } finally {
      setAchievementsLoading(false);
    }
  };

  // 获取ACP积分
  const fetchAcpScore = async () => {
    if (!token) return;
    setAcpLoading(true);
    try {
      const data = await aiRewardAPI.score(token);
      setAcpScore(data);
    } catch (err: any) {
      console.error('获取ACP积分失败:', err.message);
    } finally {
      setAcpLoading(false);
    }
  };

  // 生成新的邀请码
  const generateNewInviteCode = async () => {
    if (!userProfile?.id) return;
    
    try {
      const data = await inviteSystemAPI.generate(userProfile.id);
      setInviteCode(data.invite_code || '');
      alert('新邀请码已生成！');
    } catch (err: any) {
      alert('生成邀请码失败：' + err.message);
    }
  };

  // 复制邀请码
  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      alert('邀请码已复制到剪贴板！');
    }
  };

  // 获取SOL余额
  useEffect(() => {
    if (connected && publicKey) {
      const fetchSolBalance = async () => {
        setLoadingSolBalance(true);
        try {
          const balance = await connection.getBalance(publicKey);
          setSolBalance(balance / LAMPORTS_PER_SOL);
        } catch (err) {
          console.error('获取SOL余额失败:', err);
        } finally {
          setLoadingSolBalance(false);
        }
      };

      fetchSolBalance();
    } else {
      setSolBalance(null);
    }
  }, [connected, publicKey, connection]);

  // 格式化钱包地址显示
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  if (!isLoggedIn) {
    return (
      <>
        {/* Hero */}
        <section className="pt-32 pb-16 lg:pb-20 bg-gradient-to-b from-white to-surface">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <span className="section-label justify-center">Profile</span>
            <h1 className="text-4xl lg:text-[56px] font-black text-navy leading-[1.1] mb-6 tracking-tight">
              个人中心
            </h1>
            <p className="text-lg text-gray-500 max-w-[680px] mx-auto leading-relaxed">
              登录后查看你的学习进度和收益详情
            </p>
          </div>
        </section>

        {/* Login Options */}
        <section className="py-16 lg:py-24">
          <div className="max-w-[600px] mx-auto px-6">
            <div className="card p-12 text-center">
              <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center text-5xl mx-auto mb-6">
                🔒
              </div>
              <h2 className="text-2xl font-bold text-navy mb-4">需要先登录</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                连接你的钱包或使用邮箱登录，开始你的LAC之旅
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login" className="btn btn-primary btn-lg">
                  ✉️ 邮箱登录
                </Link>
                <Link href="/register" className="btn btn-secondary btn-lg">
                  👋 立即注册
                </Link>
              </div>
              <div className="text-xs text-gray-400 mt-6">
                支持 MetaMask、Phantom、WalletConnect 等主流钱包
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pb-20 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-pale to-gold/[0.15] border-4 border-gold-light flex items-center justify-center text-4xl">
              🧑‍💻
            </div>
            <div className="text-center sm:text-left">
              {loading ? (
                <div>
                  <div className="h-10 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ) : error ? (
                <div>
                  <h1 className="text-3xl lg:text-[40px] font-black text-navy leading-tight mb-2">
                    加载失败
                  </h1>
                  <div className="text-sm text-red-500">{error}</div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl lg:text-[40px] font-black text-navy leading-tight mb-2">
                    {userProfile?.username || 'LAC Explorer'}
                  </h1>
                  <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 rounded-full text-sm font-semibold text-gold">
                      ⭐ Lv.{userProfile?.level || 1}
                    </span>
                    {userProfile?.wallet && (
                      <span className="text-sm text-gray-400">
                        {userProfile.wallet.slice(0, 6)}...{userProfile.wallet.slice(-4)}
                      </span>
                    )}
                    <span className="text-sm text-gray-400">
                      加入于 {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : '2026-02-21'}
                    </span>
                    <button
                      onClick={logout}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Wallet Connection */}
              <div className="card p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-navy">🔗 钱包连接</h2>
                  <WalletButton size="sm" />
                </div>
                {connected && publicKey ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-xl">
                        ✅
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-navy">
                          {formatAddress(publicKey.toString())}
                        </div>
                        <div className="text-xs text-gray-500">Solana钱包</div>
                        <button
                          onClick={() => navigator.clipboard.writeText(publicKey.toString())}
                          className="text-xs text-gold hover:text-gold-light mt-1"
                        >
                          点击复制完整地址
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-xl">
                        💎
                      </div>
                      <div>
                        <div className="text-lg font-black text-navy">
                          {loadingSolBalance ? (
                            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                          ) : (
                            `${solBalance?.toFixed(4) || '0.0000'} SOL`
                          )}
                        </div>
                        <div className="text-xs text-gray-500">钱包余额</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl mx-auto mb-4">
                      👛
                    </div>
                    <h3 className="text-lg font-semibold text-navy mb-2">未连接钱包</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                      连接您的Solana钱包以查看余额和进行链上操作
                    </p>
                    <div className="text-xs text-gray-400">
                      支持 Phantom、Solflare、Backpack 等钱包
                    </div>
                  </div>
                )}
              </div>

              {/* Asset Overview */}
              <div className="card p-8">
                <h2 className="text-xl font-bold text-navy mb-6">💰 资产概览</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-black gold-text mb-2">
                      {userProfile?.lac_balance?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-500">总LAC余额</div>
                    <div className="text-xs text-gray-400 mt-1">数据库余额</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-navy mb-2">
                      {userProfile?.monthly_earned?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-500">本月获得</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-green-500 mb-2">
                      {userProfile?.growth_rate ? `+${userProfile.growth_rate}%` : '+0%'}
                    </div>
                    <div className="text-sm text-gray-500">月增长率</div>
                  </div>
                </div>
              </div>

              {/* Learning Achievement */}
              <div className="card p-8">
                <h2 className="text-xl font-bold text-navy mb-6">🎓 学习成就</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-xl">
                      📚
                    </div>
                    <div>
                      <div className="text-2xl font-black text-navy">
                        {userProfile?.completed_courses || 0}/{userProfile?.total_courses || 5}
                      </div>
                      <div className="text-sm text-gray-500">已完成课程</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-xl">
                      ⏱️
                    </div>
                    <div>
                      <div className="text-2xl font-black text-navy">
                        {userProfile?.total_study_time || 0}
                      </div>
                      <div className="text-sm text-gray-500">学习总时长（分钟）</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-xl">
                      🏆
                    </div>
                    <div>
                      <div className="text-2xl font-black text-navy">
                        {userProfile?.badges_count || 0}
                      </div>
                      <div className="text-sm text-gray-500">获得徽章</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-xl">
                      📊
                    </div>
                    <div>
                      <div className="text-2xl font-black text-navy">
                        #{userProfile?.rank || '未排名'}
                      </div>
                      <div className="text-sm text-gray-500">学习排行榜</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Records */}
              <div className="card p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-navy">💳 交易记录</h2>
                  <button 
                    onClick={() => window.__toast?.('交易记录功能即将开放')}
                    className="text-sm text-gold hover:text-gold-light"
                  >
                    查看全部
                  </button>
                </div>
                <div className="space-y-3">
                  {transactions.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-[#E8EAF0] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                          tx.type === '学习' 
                            ? 'bg-blue-100 text-blue-600' 
                            : tx.type === '签到'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          {tx.type === '学习' ? '📚' : tx.type === '签到' ? '✅' : '📣'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-navy">{tx.course}</div>
                          <div className="text-xs text-gray-400">{tx.date}</div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-green-600">{tx.amount} LAC</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* ACP Score */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
                  🧠 ACP 积分
                </h3>
                {acpLoading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-2"></div>
                    <div className="text-xs text-gray-500">加载中...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-black gold-text mb-1">
                        {acpScore?.score?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-gray-500">AI贡献积分</div>
                    </div>
                    <div className="h-px bg-[#E8EAF0]" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">🏅 等级</span>
                      <span className="text-lg font-bold text-navy">
                        {acpScore?.level || 'Lv.1'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">📈 本月新增</span>
                      <span className="text-lg font-bold text-green-500">
                        +{acpScore?.monthly_earned?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Check-in Stats */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
                  📅 签到统计
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">🔥 连续签到</span>
                    <span className="text-xl font-black text-navy">
                      {userProfile?.checkin_streak || 0} 天
                    </span>
                  </div>
                  <div className="h-px bg-[#E8EAF0]" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">📅 本月已签到</span>
                    <span className="text-xl font-black text-navy">
                      {userProfile?.monthly_checkins || 0} 天
                    </span>
                  </div>
                  <div className="h-px bg-[#E8EAF0]" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">💰 签到收益</span>
                    <span className="text-xl font-black gold-text">
                      {userProfile?.checkin_earnings?.toLocaleString() || '0'} LAC
                    </span>
                  </div>
                </div>
              </div>

              {/* Invite Stats */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
                  👥 邀请统计
                </h3>
                {inviteLoading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-2"></div>
                    <div className="text-xs text-gray-500">加载中...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">🔗 我的邀请码</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {inviteCode || '未生成'}
                        </code>
                        <button
                          onClick={copyInviteCode}
                          disabled={!inviteCode}
                          className="text-xs text-gold hover:text-gold-light disabled:text-gray-400"
                        >
                          复制
                        </button>
                      </div>
                    </div>
                    <div className="h-px bg-[#E8EAF0]" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">👥 已邀请人数</span>
                      <span className="text-xl font-black text-navy">
                        {inviteStats?.total_invites || 0}
                      </span>
                    </div>
                    <div className="h-px bg-[#E8EAF0]" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">💰 邀请收益</span>
                      <span className="text-xl font-black gold-text">
                        {inviteStats?.total_rewards?.toLocaleString() || '0'} LAC
                      </span>
                    </div>
                    <button
                      onClick={generateNewInviteCode}
                      className="w-full btn btn-ghost btn-sm mt-4"
                    >
                      生成新邀请码
                    </button>
                  </div>
                )}
              </div>

              {/* Achievements */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
                  🏆 成就徽章
                </h3>
                {achievementsLoading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-2"></div>
                    <div className="text-xs text-gray-500">加载中...</div>
                  </div>
                ) : userAchievements.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="text-sm text-gray-500">暂无解锁成就</div>
                    <div className="text-xs text-gray-400 mt-1">继续学习解锁更多成就</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userAchievements.map((ach, i) => (
                      <div key={ach.id || i} className="flex items-start gap-3">
                        <span className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-lg flex-shrink-0">
                          {ach.icon || '🏆'}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-navy">{ach.title || ach.name}</div>
                          <div className="text-xs text-gray-400 mb-1">{ach.description || ach.desc}</div>
                          <div className="text-xs text-gray-300">
                            {ach.unlocked_at ? new Date(ach.unlocked_at).toLocaleDateString() : ach.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
                  ⚡ 快捷操作
                </h3>
                <div className="space-y-3">
                  <Link href="/learn" className="w-full btn btn-secondary btn-sm block text-center">📚 继续学习</Link>
                  <Link href="/checkin" className="w-full btn btn-secondary btn-sm block text-center">✅ 每日签到</Link>
                  <button onClick={() => window.__toast?.("提现功能即将开放")} className="w-full btn btn-secondary btn-sm">💱 提现LAC</button>
                  <button onClick={() => window.__toast?.("设置功能即将开放")} className="w-full btn btn-ghost btn-sm">🔧 设置</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}