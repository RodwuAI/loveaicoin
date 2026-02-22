'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { charityAPI, startupAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const projectCategories = [
  { icon: '🏫', label: 'AI教育公益' },
  { icon: '🌱', label: 'AI创业支持' },
  { icon: '🔬', label: '开源研究' },
  { icon: '♿', label: '无障碍计划' },
  { icon: '🌍', label: '环保监测' },
  { icon: '🤝', label: '社区互助' },
];

const donationTiers = [
  { amount: 10, label: '种子', icon: '🌱', perks: '公益贡献者徽章', display: '$10 / 10 USDT' },
  { amount: 50, label: '守护者', icon: '🛡️', perks: '专属NFT + 项目投票权', display: '$50 / 50 USDT' },
  { amount: 200, label: '领航者', icon: '🚀', perks: '理事会席位 + 项目提名权', display: '$200 / 200 USDT' },
  { amount: 1000, label: '创始捐赠人', icon: '👑', perks: '永久荣誉墙 + 生态分红', display: '$1,000 / 1,000 USDT' },
];

// Fallback projects when API unavailable
const fallbackProjects = [
  { id: 'p1', name: 'AI识字计划', category: '教育公益', status: '进行中', raised: 6250, goal: 25000, progress: 25, author: 'Alice.eth' },
  { id: 'p2', name: '盲人AI语音助手', category: '无障碍', status: '筹款中', raised: 1600, goal: 15000, progress: 11, author: '0xBuilder' },
  { id: 'p3', name: 'AI农业监测（柬埔寨）', category: '环保', status: '筹款中', raised: 4050, goal: 12500, progress: 32, author: 'GreenDAO' },
];

export default function CharityJoinPage() {
  const { isLoggedIn, token, userId } = useAuth();
  const [activeTab, setActiveTab] = useState<'donate' | 'submit' | 'projects'>('projects');
  const [projects, setProjects] = useState<any[]>(fallbackProjects);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Donate modal state
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateProjectId, setDonateProjectId] = useState('');
  const [donateAmount, setDonateAmount] = useState<number | ''>('');
  const [donating, setDonating] = useState(false);
  const [donateError, setDonateError] = useState('');
  const [donateSuccess, setDonateSuccess] = useState(false);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await charityAPI.listProjects();
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
        }
      } catch {
        // Use fallback projects
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const openDonateModal = (projectId?: string, presetAmount?: number) => {
    setDonateProjectId(projectId || (projects[0]?.id || ''));
    setDonateAmount(presetAmount || '');
    setDonateError('');
    setDonateSuccess(false);
    setShowDonateModal(true);
  };

  const handleDonate = async () => {
    if (!isLoggedIn || !token) {
      setDonateError('请先登录');
      return;
    }
    if (!donateProjectId) {
      setDonateError('请选择捐赠项目');
      return;
    }
    if (!donateAmount || donateAmount < 1) {
      setDonateError('请输入有效金额（最低$1）');
      return;
    }

    setDonating(true);
    setDonateError('');
    try {
      await charityAPI.donate(userId || "", donateProjectId, donateAmount);
      setDonateSuccess(true);
    } catch (err: any) {
      setDonateError(err.message || '捐赠失败，请稍后重试');
    } finally {
      setDonating(false);
    }
  };

  return (
    <>
      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowDonateModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-[480px] w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {donateSuccess ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-navy mb-2">感谢你的捐赠！</h3>
                <p className="text-gray-500 mb-6">你的善举将帮助更多人受益于AI技术</p>
                <button onClick={() => setShowDonateModal(false)} className="btn btn-primary">关闭</button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-navy mb-6">💛 捐赠</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">选择项目</label>
                    <select
                      value={donateProjectId}
                      onChange={(e) => setDonateProjectId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:outline-none focus:border-gold text-sm"
                    >
                      <option value="">请选择项目</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">捐赠金额 (USD/USDT)</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="输入金额"
                      value={donateAmount}
                      onChange={(e) => setDonateAmount(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:outline-none focus:border-gold text-sm"
                    />
                    <div className="flex gap-2 mt-2">
                      {[10, 50, 200, 1000].map((amt) => (
                        <button key={amt} onClick={() => setDonateAmount(amt)} className="px-3 py-1 rounded-lg border border-[#E8EAF0] text-xs hover:border-gold hover:text-gold transition-colors">
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>
                  {donateError && <div className="text-sm text-red-500">{donateError}</div>}
                  <div className="flex gap-3">
                    <button onClick={() => setShowDonateModal(false)} className="flex-1 btn btn-secondary">取消</button>
                    <button onClick={handleDonate} disabled={donating} className="flex-1 btn btn-primary">
                      {donating ? '处理中...' : '💛 确认捐赠'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative pt-[120px] pb-16 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-pale to-gold/[0.15] border-[3px] border-gold-light flex items-center justify-center text-5xl mx-auto mb-6 animate-float">
            💛
          </div>
          <h1 className="text-3xl lg:text-[48px] font-black leading-[1.1] text-navy mb-4">
            参与<span className="gold-text">公益</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-[600px] mx-auto">
            捐赠LAC支持公益项目，或提交你的项目申请获得创业资助
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex justify-center gap-2 mb-12">
            {[
              { key: 'projects' as const, label: '🌍 公益项目', desc: '浏览和支持' },
              { key: 'donate' as const, label: '💰 捐赠', desc: '贡献力量' },
              { key: 'submit' as const, label: '📝 提交项目', desc: '申请创业支持' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === tab.key
                    ? 'bg-navy text-white shadow-lg'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-[#E8EAF0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div>
              <h2 className="text-2xl font-bold text-navy mb-8 text-center">正在进行的公益项目</h2>
              {projectsLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
                  <div className="text-gray-500">加载项目中...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {projects.map((project) => (
                    <div key={project.id || project.name} className="card p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gold/10 text-gold">{project.category}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          project.status === '进行中' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                        }`}>{project.status}</span>
                      </div>
                      <h3 className="text-lg font-bold text-navy mb-2">{project.name}</h3>
                      <p className="text-xs text-gray-400 mb-4">发起人：{project.author}</p>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>${typeof project.raised === 'number' ? project.raised.toLocaleString() : project.raised}</span>
                          <span>目标 ${typeof project.goal === 'number' ? project.goal.toLocaleString() : project.goal}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#E8EAF0] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <button onClick={() => openDonateModal(project.id)} className="w-full btn btn-primary btn-sm mt-2">
                        💛 支持这个项目
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center">
                <p className="text-gray-400 text-sm mb-4">更多项目即将上线...</p>
                <button onClick={() => setActiveTab('submit')} className="btn btn-secondary">
                  📝 提交你的公益项目
                </button>
              </div>
            </div>
          )}

          {/* Donate Tab */}
          {activeTab === 'donate' && (
            <div>
              <h2 className="text-2xl font-bold text-navy mb-4 text-center">选择捐赠等级</h2>
              <p className="text-center text-gray-500 mb-10">支持法币和USDT捐赠，100%用于公益项目</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {donationTiers.map((tier) => (
                  <div key={tier.label} className="card p-6 text-center hover:shadow-lg transition-shadow hover:-translate-y-1">
                    <div className="text-4xl mb-3">{tier.icon}</div>
                    <h3 className="text-lg font-bold text-navy mb-1">{tier.label}</h3>
                    <div className="text-2xl font-black gold-text mb-3">{tier.display}</div>
                    <p className="text-xs text-gray-400 mb-4">{tier.perks}</p>
                    <button onClick={() => openDonateModal(undefined, tier.amount)} className="w-full btn btn-primary btn-sm">捐赠</button>
                  </div>
                ))}
              </div>

              <div className="card p-8 max-w-[600px] mx-auto">
                <h3 className="text-lg font-bold text-navy mb-4 text-center">自定义捐赠</h3>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="输入金额（USD/USDT）"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value ? Number(e.target.value) : '')}
                    className="flex-1 px-4 py-3 rounded-xl border border-[#E8EAF0] focus:outline-none focus:border-gold text-sm"
                  />
                  <button onClick={() => openDonateModal(undefined, typeof donateAmount === 'number' ? donateAmount : undefined)} className="btn btn-primary">💛 捐赠</button>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">支持法币（USD）和 USDT 捐赠，最低 $1</p>
              </div>

              {/* Transparency */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: '🔗', title: '链上透明', desc: '每笔捐赠都记录在Solana区块链上，永久可查' },
                  { icon: '📊', title: '定期报告', desc: '每月发布公益基金使用报告，社区可审计' },
                  { icon: '🗳️', title: '社区治理', desc: '捐赠者拥有投票权，决定资金流向' },
                ].map((item) => (
                  <div key={item.title} className="card p-6 text-center">
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h4 className="font-bold text-navy mb-2">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Project Tab */}
          {activeTab === 'submit' && (
            <div className="max-w-[700px] mx-auto">
              <h2 className="text-2xl font-bold text-navy mb-4 text-center">提交公益项目申请</h2>
              <p className="text-center text-gray-500 mb-10">通过审核的项目将获得LAC公益基金资助</p>

              <div className="card p-8">
                <div className="space-y-6 startup-form">
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">项目名称 *</label>
                    <input type="text" placeholder="给你的公益项目取个名字" className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:outline-none focus:border-gold text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">项目类别 *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {projectCategories.map((cat) => (
                        <button key={cat.label} className="px-3 py-2 rounded-lg border border-[#E8EAF0] text-xs font-medium text-gray-500 hover:border-gold hover:text-gold transition-colors">
                          {cat.icon} {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">项目描述 *</label>
                    <textarea rows={4} placeholder="详细描述你的项目：解决什么问题？目标受众是谁？预期成果？" className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:outline-none focus:border-gold text-sm resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-2">申请资助金额 (LAC) *</label>
                      <input type="number" placeholder="例：50000" className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:outline-none focus:border-gold text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-2">预计周期</label>
                      <input type="text" placeholder="例：3个月" className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:outline-none focus:border-gold text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">团队介绍</label>
                    <textarea rows={3} placeholder="介绍你的团队成员和背景" className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:outline-none focus:border-gold text-sm resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">联系方式 *</label>
                    <input type="text" placeholder="邮箱、Telegram或Discord ID" className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:outline-none focus:border-gold text-sm" />
                  </div>
                  <button onClick={async () => {
                    if (!userId) { window.__toast?.('请先登录'); return; }
                    const form = document.querySelector('.startup-form') as HTMLElement;
                    const inputs = form?.querySelectorAll('input, textarea') as NodeListOf<HTMLInputElement>;
                    const name = inputs[0]?.value?.trim();
                    const desc = inputs[1]?.value?.trim();
                    if (!name || !desc) { window.__toast?.('请填写项目名称和描述'); return; }
                    try {
                      await startupAPI.submit({ user_id: userId, name, description: desc, category: 'ai' });
                      window.__toast?.('🎉 项目提交成功！将进入社区评审');
                      inputs.forEach(i => i.value = '');
                    } catch (e: any) { window.__toast?.(e.message || '提交失败'); }
                  }} className="w-full btn btn-primary btn-lg">📝 提交申请</button>
                  <p className="text-xs text-gray-400 text-center">提交后将进入社区评审流程，预计7个工作日内收到反馈</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
