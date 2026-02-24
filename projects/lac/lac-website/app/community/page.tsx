'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { leaderboardAPI, communityQAAPI, governanceAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const channels = [
  {
    name: 'Twitter / X',
    icon: '𝕏',
    stat: '即将开放',
    statLabel: '',
    action: '敬请期待',
    color: 'from-gray-900 to-gray-700',
    href: '#',
  },
  {
    name: 'Telegram',
    icon: '✈️',
    stat: '即将开放',
    statLabel: '',
    action: '敬请期待',
    color: 'from-blue-500 to-blue-400',
    href: '#',
  },
  {
    name: 'Discord',
    icon: '💬',
    stat: '即将开放',
    statLabel: '',
    action: '敬请期待',
    color: 'from-indigo-600 to-indigo-400',
    href: '#',
  },
  {
    name: 'GitHub',
    icon: '⌨',
    stat: '开源代码',
    statLabel: '',
    action: '查看',
    color: 'from-gray-800 to-gray-600',
    href: 'https://github.com/RodwuAI/loveaicoin',
  },
];

const announcements = [
  {
    date: '2026-02-20',
    title: 'LAC白皮书V2发布',
    desc: '全新版本白皮书已上线，详细介绍了三维挖矿机制和代币经济模型的优化方案。',
    tag: '重要',
  },
  {
    date: '2026-02-18',
    title: '学习中心Beta上线',
    desc: '学习中心Beta版本已面向社区开放测试，首批5门课程已上线，欢迎体验和反馈。',
    tag: '产品',
  },
  {
    date: '2026-02-15',
    title: '社区治理提案 #1',
    desc: '第一份社区治理提案已提交：关于早期贡献者空投分配比例的讨论，欢迎参与投票。',
    tag: '治理',
  },
];

const events = [
  {
    title: 'LAC社区AMA',
    date: '2026-02-25',
    time: '20:00 UTC+8',
    desc: '与核心团队对话，了解LAC最新进展和未来规划',
    platform: 'Twitter Space',
    icon: '🎙️',
  },
  {
    title: 'Web3开发Workshop',
    date: '2026-03-01',
    time: '14:00 UTC+8',
    desc: '实战教学：如何在Solana上部署你的第一个智能合约',
    platform: 'Discord',
    icon: '🛠️',
  },
];

export default function CommunityPage() {
  const { isLoggedIn } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState('');
  const [communityQA, setCommunityQA] = useState<any[]>([]);
  const [qaLoading, setQaLoading] = useState(true);
  const [qaError, setQaError] = useState('');
  const [proposals, setProposals] = useState<any[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);

  // 获取排行榜数据
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await leaderboardAPI.getLeaderboard('learning', 10);
        setLeaderboard(data.users || []);
      } catch (err: any) {
        setLeaderboardError(err.message || '加载排行榜失败');
        setLeaderboard([]);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // 获取社区问答数据
  useEffect(() => {
    const fetchCommunityQA = async () => {
      try {
        const data = await communityQAAPI.list(5);
        setCommunityQA(data.questions || []);
      } catch (err: any) {
        setQaError(err.message || '加载问答失败');
        setCommunityQA([]);
      } finally {
        setQaLoading(false);
      }
    };

    fetchCommunityQA();
  }, []);

  // 获取治理提案
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const data = await governanceAPI.listProposals();
        setProposals(data.proposals || []);
      } catch {
        setProposals([]);
      } finally {
        setProposalsLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const handleVote = async (proposalId: string, choice: string) => {
    if (!isLoggedIn) {
      window.__toast?.('请先登录');
      return;
    }
    setVotingId(proposalId);
    try {
      await governanceAPI.vote('', proposalId, choice);
      window.__toast?.('投票成功！');
      // Refresh proposals
      const data = await governanceAPI.listProposals();
      setProposals(data.proposals || []);
    } catch (err: any) {
      window.__toast?.(err.message || '投票失败');
    } finally {
      setVotingId(null);
    }
  };

  const colors = ['bg-amber-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-pink-400', 'bg-cyan-400'];
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pb-20 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-label justify-center">Community</span>
          <h1 className="text-4xl lg:text-[56px] font-black text-navy leading-[1.1] mb-6 tracking-tight">
            加入LAC社区
          </h1>
          <div className="flex items-center justify-center gap-3 text-lg text-gray-500">
            <span>🌍</span>
            <span>社区即将启动，敬请期待</span>
          </div>
        </div>
      </section>

      {/* Channel Cards */}
      <section className="py-12 lg:py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {channels.map((ch) => (
              <div key={ch.name} className="card overflow-hidden group">
                <div
                  className={`h-28 bg-gradient-to-br ${ch.color} flex items-center justify-center`}
                >
                  <span className="text-4xl text-white group-hover:scale-110 transition-transform duration-300">
                    {ch.icon}
                  </span>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-bold text-navy mb-1">{ch.name}</h3>
                  <div className="text-sm text-gray-400 mb-4">
                    {ch.statLabel}{' '}
                    <span className="font-semibold text-navy">{ch.stat}</span>
                  </div>
                  {ch.href === '#' ? (
                    <button
                      disabled
                      className="btn btn-primary btn-sm w-full opacity-50 cursor-not-allowed"
                    >
                      {ch.action}
                    </button>
                  ) : (
                    <a
                      href={ch.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm w-full"
                    >
                      {ch.action}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="py-12 lg:py-16 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <span className="section-label">Announcements</span>
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-8">
            最新公告
          </h2>
          <div className="space-y-4">
            {announcements.map((a, i) => (
              <div key={i} className="card p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      a.tag === '重要'
                        ? 'bg-red-50 text-red-500'
                        : a.tag === '产品'
                        ? 'bg-blue-50 text-blue-500'
                        : 'bg-gold/10 text-gold'
                    }`}
                  >
                    {a.tag}
                  </span>
                  <span className="text-xs text-gray-400">{a.date}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-navy mb-1">{a.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="py-12 lg:py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <span className="section-label">Upcoming Events</span>
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-8">
            社区活动
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((ev, i) => (
              <div key={i} className="card p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {ev.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-1">{ev.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span>📅 {ev.date}</span>
                      <span>🕐 {ev.time}</span>
                      <span className="text-gold font-medium">{ev.platform}</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{ev.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-12 lg:py-16 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-10">
            <span className="section-label justify-center">Weekly Leaderboard</span>
            <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-4">
              学习排行榜
            </h2>
            <p className="text-gray-500 max-w-[500px] mx-auto">
              本周学习积分排行榜，看看谁是最勤奋的 AI 学习者。
            </p>
          </div>
          
          {leaderboardLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-gray-500">加载排行榜中...</div>
            </div>
          ) : leaderboardError ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="text-lg font-bold text-gray-700 mb-2">加载失败</div>
              <div className="text-sm text-gray-500">{leaderboardError}</div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-lg font-bold text-gray-700 mb-2">暂无数据</div>
              <div className="text-sm text-gray-500">本周排行榜还没有数据，成为第一个学习者吧！</div>
              <Link href="/learn" className="btn btn-primary btn-sm mt-4">
                开始学习
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {leaderboard.slice(0, 10).map((user, index) => (
                <div key={user.id || index} className="card p-6 text-center">
                  <div className="relative">
                    {index < 3 && (
                      <div className="absolute -top-2 -right-2 text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                    )}
                    <div
                      className={`w-16 h-16 rounded-full ${colors[index % colors.length]} flex items-center justify-center text-white text-xl font-bold mx-auto mb-3`}
                    >
                      {(user.username || user.name || `用户${index + 1}`).charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-navy mb-1">
                    {user.username || user.name || `用户${index + 1}`}
                  </div>
                  <div className="text-xs text-gold font-semibold">
                    {(user.points || user.score || 0).toLocaleString()} 积分
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Community Q&A */}
      <section className="py-12 lg:py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-10">
            <span className="section-label justify-center">Community Q&A</span>
            <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-4">
              社区问答
            </h2>
            <p className="text-gray-500 max-w-[500px] mx-auto">
              {isLoggedIn ? '分享知识，解答疑惑，共同成长' : '登录后可参与问答互动'}
            </p>
          </div>
          
          {qaLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-gray-500">加载问答中...</div>
            </div>
          ) : qaError ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">❓</div>
              <div className="text-lg font-bold text-gray-700 mb-2">加载失败</div>
              <div className="text-sm text-gray-500">{qaError}</div>
            </div>
          ) : !isLoggedIn ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔒</div>
              <div className="text-lg font-bold text-gray-700 mb-2">请先登录</div>
              <div className="text-sm text-gray-500 mb-4">登录后即可查看和参与社区问答</div>
              <Link href="/login" className="btn btn-primary btn-sm">
                立即登录
              </Link>
            </div>
          ) : communityQA.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💡</div>
              <div className="text-lg font-bold text-gray-700 mb-2">暂无问题</div>
              <div className="text-sm text-gray-500">成为第一个提问的人吧！</div>
            </div>
          ) : (
            <div className="space-y-6">
              {communityQA.slice(0, 5).map((question, index) => (
                <div key={question.id || index} className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-xl flex-shrink-0">
                      {question.author_avatar || '❓'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-navy">
                          {question.author || 'AI学习者'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {question.created_at ? new Date(question.created_at).toLocaleDateString() : '今天'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-navy mb-3">
                        {question.title || question.question}
                      </h3>
                      {question.content && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {question.content}
                        </p>
                      )}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>👁️ {question.views || 0} 查看</span>
                        <span>💬 {question.answers_count || 0} 回答</span>
                        <span>👍 {question.likes || 0} 点赞</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center">
                <button 
                  onClick={() => window.__toast?.('问答功能即将完善')}
                  className="btn btn-secondary btn-sm"
                >
                  查看更多问题
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Governance Proposals */}
      <section className="py-12 lg:py-16 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-10">
            <span className="section-label justify-center">Governance</span>
            <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-4">
              治理提案
            </h2>
            <p className="text-gray-500 max-w-[500px] mx-auto">
              参与社区治理，为LAC的未来投票
            </p>
          </div>

          {proposalsLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-gray-500">加载提案中...</div>
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🗳️</div>
              <div className="text-lg font-bold text-gray-700 mb-2">暂无活跃提案</div>
              <div className="text-sm text-gray-500">新的治理提案即将发布，敬请关注</div>
            </div>
          ) : (
            <div className="space-y-6">
              {proposals.map((proposal: any) => (
                <div key={proposal.id} className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-xl flex-shrink-0">
                      🗳️
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          proposal.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {proposal.status === 'active' ? '投票中' : proposal.status === 'passed' ? '已通过' : proposal.status === 'rejected' ? '未通过' : proposal.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {proposal.created_at ? new Date(proposal.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-navy mb-2">{proposal.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">{proposal.description}</p>
                      {proposal.status === 'active' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleVote(proposal.id, 'for')}
                            disabled={votingId === proposal.id}
                            className="btn btn-primary btn-sm"
                          >
                            👍 赞成 {proposal.votes_for ? `(${proposal.votes_for})` : ''}
                          </button>
                          <button
                            onClick={() => handleVote(proposal.id, 'against')}
                            disabled={votingId === proposal.id}
                            className="btn btn-secondary btn-sm"
                          >
                            👎 反对 {proposal.votes_against ? `(${proposal.votes_against})` : ''}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 text-center">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-navy mb-4">开始你的LAC之旅</h2>
          <p className="text-gray-500 mb-8 max-w-[500px] mx-auto">
            学习、签到、贡献——在LAC社区，每一步都有价值。
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/learn" className="btn btn-primary btn-lg">
              📚 开始学习
            </Link>
            <Link href="/checkin" className="btn btn-secondary btn-lg">
              ✅ 每日签到
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
