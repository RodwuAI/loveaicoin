'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { checkinAPI } from '@/lib/api';

const leaderboard: any[] = []; // 真实排行榜数据从API获取

// Generate calendar data for current month
function getCalendarData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  // Simulate checked-in days (random past days)
  const checkedDays = new Set([1, 2, 3, 5, 6, 7, 8, 10, 11, 13, 14, 15, 17, 18, 20]);

  const days: { day: number; checked: boolean; isToday: boolean; empty: boolean }[] = [];

  // Empty slots for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: 0, checked: false, isToday: false, empty: true });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      day: d,
      checked: d < today && checkedDays.has(d),
      isToday: d === today,
      empty: false,
    });
  }

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月',
  ];

  return { days, monthName: monthNames[month], year };
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const streakRewards = [
  { days: 1, multiplier: '1x', bonus: 0, icon: '🌱', label: '首日签到', desc: '基础奖励' },
  { days: 2, multiplier: '1x', bonus: 2, icon: '🌿', label: '连续2天', desc: '+2 LAC' },
  { days: 3, multiplier: '1.1x', bonus: 5, icon: '🍀', label: '连续3天', desc: '1.1倍 +5 LAC' },
  { days: 5, multiplier: '1.2x', bonus: 10, icon: '🌳', label: '连续5天', desc: '1.2倍 +10 LAC' },
  { days: 7, multiplier: '1.3x', bonus: 20, icon: '🔥', label: '连续7天', desc: '1.3倍 +20 LAC' },
  { days: 14, multiplier: '1.4x', bonus: 50, icon: '💎', label: '连续14天', desc: '1.4倍 +50 LAC' },
  { days: 30, multiplier: '1.5x', bonus: 100, icon: '👑', label: '连续30天', desc: '1.5倍 +100 LAC' },
];

export default function CheckinPage() {
  const { isLoggedIn, token } = useAuth();
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [checkinResult, setCheckinResult] = useState<{
    feedback?: string;
    reward?: number;
    error?: string;
  }>({});
  const [streakData, setStreakData] = useState<{
    streak_days?: number;
    multiplier?: number;
    total_earned?: number;
    monthly_checkins?: number;
  }>({});
  const [poolData, setPoolData] = useState<{
    pool_size?: number;
    daily_reward?: number;
    question?: string;
  }>({});
  const calendar = getCalendarData();

  // Fetch real data from APIs
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        // Fetch daily pool data
        const poolResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/dynamic-pool-simple`, {
          headers: { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' }
        });
        if (poolResponse.ok) {
          const poolResult = await poolResponse.json();
          setPoolData(poolResult);
        }
        
        // Fetch daily question
        if (token && isLoggedIn) {
          try {
            const qData = await checkinAPI.getQuestion(token);
            if (qData?.data?.question) {
              setPoolData(prev => ({ ...prev, question: qData.data.question }));
            }
          } catch(e) { /* fallback to default question */ }
        }

        // Fetch user status and streak data if logged in
        if (token && isLoggedIn) {
          // Get checkin status — the backend returns already_checked_in inside data
          const statusResult = await checkinAPI.status(token);
          const statusData = statusResult.data || statusResult;
          
          // Get streak data
          const streakResult = await checkinAPI.streak(token);
          const streakInfo = streakResult.data || streakResult;
          setStreakData(streakInfo);
          
          // Check if already submitted today
          if (statusData.already_checked_in || statusData.checked_in_today) {
            setSubmitted(true);
            setCheckinResult({
              feedback: statusData.ai_feedback || '今日已签到',
              reward: statusData.lac_reward || statusData.today_reward || 10,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [token, isLoggedIn]);

  const handleSubmit = async () => {
    if (!answer.trim() || !token || loading || submitted) return;
    if (answer.trim().length < 10) {
      setCheckinResult({ error: '回答至少需要10个字哦 ✍️' });
      return;
    }

    setLoading(true);
    try {
      // Use the new checkinAPI
      const data = await checkinAPI.checkin(token, answer);

      if (data.success) {
        const resultData = data.data || data;
        setCheckinResult({
          feedback: resultData.ai_feedback || resultData.feedback || '',
          reward: resultData.lac_reward || resultData.reward || 10,
        });
        setSubmitted(true);
        
        // Refresh streak data
        const streakResult = await checkinAPI.streak(token);
        setStreakData(streakResult);
      } else {
        setCheckinResult({
          error: data.error || '签到失败，请稍后重试',
        });
      }
    } catch (err: any) {
      setCheckinResult({
        error: err.message || '网络错误，请稍后重试',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pb-20 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-label justify-center">Daily Check-in</span>
          <h1 className="text-4xl lg:text-[56px] font-black text-navy leading-[1.1] mb-6 tracking-tight">
            每日AI签到
          </h1>
          <p className="text-lg text-gray-500 max-w-[680px] mx-auto leading-relaxed">
            回答AI问题，获取LAC奖励
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Question + Calendar */}
            <div className="lg:col-span-2 space-y-8">
              {/* Today's Question */}
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-xl">
                    🧠
                  </div>
                  <h2 className="text-xl font-bold text-navy">今日AI问题</h2>
                </div>
                <div className="bg-surface rounded-2xl p-6 mb-6">
                  {dataLoading ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ) : (
                    <p className="text-lg text-navy font-medium leading-relaxed">
                      &ldquo;{poolData.question || '什么是大语言模型（LLM）？请用一句话解释。'}&rdquo;
                    </p>
                  )}
                </div>
{!isLoggedIn ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-3">🔐</div>
                    <div className="text-lg font-bold text-yellow-700 mb-2">请先登录</div>
                    <div className="text-sm text-yellow-600 mb-4">登录后即可参与每日签到获取LAC奖励</div>
                    <div className="flex gap-3 justify-center">
                      <Link href="/login" className="btn btn-primary btn-sm">
                        登录
                      </Link>
                      <Link href="/register" className="btn btn-secondary btn-sm">
                        注册
                      </Link>
                    </div>
                  </div>
                ) : !submitted ? (
                  <>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="请输入你的回答..."
                      className="w-full h-32 p-4 rounded-2xl border border-[#E8EAF0] bg-white text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none transition-all duration-200"
                      disabled={loading}
                    />
                    {checkinResult.error && (
                      <div className="mt-4 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">
                        {checkinResult.error}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-2">{answer.trim().length}/10 字（至少10字）</div>
                    <button
                      onClick={handleSubmit}
                      disabled={answer.trim().length < 10 || loading}
                      className="btn btn-primary btn-lg mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? '提交中...' : answer.trim().length < 10 ? `✍️ 还需${10 - answer.trim().length}字` : '✅ 提交签到'}
                    </button>
                  </>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-3">🎉</div>
                      <div className="text-lg font-bold text-green-700 mb-1">签到成功！</div>
                      <div className="text-sm text-green-600">+{checkinResult.reward || poolData.daily_reward || 10} LAC 已到账</div>
                      {streakData.multiplier && streakData.multiplier > 1 && (
                        <div className="text-xs text-gold mt-1">连续签到加成 {streakData.multiplier}x</div>
                      )}
                    </div>
                    {checkinResult.feedback && (
                      <div className="bg-white rounded-xl p-4 border-l-4 border-gold">
                        <div className="text-sm font-semibold text-navy mb-2">AI 反馈：</div>
                        <div className="text-sm text-gray-600 leading-relaxed">
                          {checkinResult.feedback}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Calendar */}
              <div className="card p-8">
                <h2 className="text-xl font-bold text-navy mb-6">
                  📅 签到日历 — {calendar.year}年{calendar.monthName}
                </h2>
                <div className="grid grid-cols-7 gap-2">
                  {/* Weekday headers */}
                  {weekDays.map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-semibold text-gray-400 pb-2"
                    >
                      {d}
                    </div>
                  ))}
                  {/* Days */}
                  {calendar.days.map((d, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all duration-200 ${
                        d.empty
                          ? ''
                          : d.isToday
                          ? 'bg-navy text-white font-bold'
                          : d.checked
                          ? 'bg-surface text-navy font-medium'
                          : 'text-gray-400'
                      }`}
                    >
                      {!d.empty && (
                        <>
                          <span>{d.day}</span>
                          {d.checked && (
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-0.5" />
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Stats + Rules + Leaderboard */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
                  签到统计
                </h3>
                {!isLoggedIn ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🔐</div>
                    <div className="text-sm text-gray-500 mb-4">请先登录查看签到统计</div>
                    <Link href="/login" className="btn btn-primary btn-sm">登录</Link>
                  </div>
                ) : dataLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="flex justify-between items-center">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-6 bg-gray-200 rounded w-12"></div>
                        </div>
                        <div className="h-px bg-gray-200 mt-4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">🔥 连续签到</span>
                      <span className="text-xl font-black text-navy">{streakData.streak_days || 0} 天</span>
                    </div>
                    <div className="h-px bg-[#E8EAF0]" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">📅 本月已签到</span>
                      <span className="text-xl font-black text-navy">{streakData.monthly_checkins || 0} 天</span>
                    </div>
                    <div className="h-px bg-[#E8EAF0]" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">💰 累计获得</span>
                      <span className="text-xl font-black gold-text">{streakData.total_earned || 0} LAC</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Streak Rewards - Game Style */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
                  🎮 连续签到奖励
                </h3>
                <div className="space-y-3">
                  {streakRewards.map((reward, i) => {
                    const currentStreak = streakData.streak_days || 0;
                    const achieved = currentStreak >= reward.days;
                    return (
                      <div key={reward.days} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${achieved ? 'border-gold/30 bg-gold/[0.04]' : 'border-[#E8EAF0] bg-white'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${achieved ? 'bg-gold/10' : 'bg-gray-50'}`}>
                          {achieved ? reward.icon : '🔒'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold ${achieved ? 'text-navy' : 'text-gray-400'}`}>{reward.label}</div>
                          <div className="text-xs text-gray-400">{reward.desc}</div>
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded-lg ${achieved ? 'bg-gold/10 text-gold' : 'bg-gray-50 text-gray-300'}`}>
                          {achieved ? '✅' : `${reward.days}天`}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>当前连续 {streakData.streak_days || 0} 天</span>
                    <span>下一档：{streakRewards.find(r => r.days > (streakData.streak_days || 0))?.days || 30}天</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#E8EAF0] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full" style={{ 
                      width: `${Math.min(100, ((streakData.streak_days || 0) / (streakRewards.find(r => r.days > (streakData.streak_days || 0))?.days || 30)) * 100)}%` 
                    }} />
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
                  🏆 签到排行榜
                </h3>
                {leaderboard.length === 0 && <div className="text-center py-6 text-gray-400 text-sm">暂无排行数据，快来签到抢占榜首！</div>}
                <div className="space-y-3">
                  {leaderboard.map((user) => (
                    <div
                      key={user.rank}
                      className="flex items-center gap-3"
                    >
                      <span className="text-sm font-bold text-gray-300 w-5 text-center">
                        {user.rank}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-navy truncate">
                          {user.name}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gold">
                        {user.streak}天
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
