'use client';

import { useState, useEffect } from 'react';
import { inviteSystemAPI, contentSubmitAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const teachingPosts: any[] = []; // 真实数据从API获取，暂无教学内容时显示空状态

const filters = [
  { key: 'all', label: '全部主题' },
  { key: 'ai', label: 'AI技术' },
  { key: 'web3', label: 'Web3' },
  { key: 'dev', label: '编程开发' },
];

const typeFilters = [
  { key: 'all', label: '全部类型' },
  { key: 'live', label: '直播' },
  { key: 'tutorial', label: '图文' },
  { key: 'video', label: '视频' },
];

const difficultyFilters = [
  { key: 'all', label: '全部难度' },
  { key: 'beginner', label: '入门' },
  { key: 'intermediate', label: '进阶' },
  { key: 'advanced', label: '高级' },
];

const sortOptions = [
  { key: 'latest', label: '最新发布' },
  { key: 'popular', label: '最多参与' },
  { key: 'tips', label: '打赏最多' },
];

const myTabs = ['我发布的', '我参与的', '收藏的'];

export default function TeachPage() {
  const { isLoggedIn, token, userId } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [activeDifficultyFilter, setActiveDifficultyFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('latest');
  const [activeMyTab, setActiveMyTab] = useState('我发布的');
  const [inviteLink, setInviteLink] = useState('');
  const [showContentForm, setShowContentForm] = useState(false);
  const [contentForm, setContentForm] = useState({
    title: '',
    content: '',
    type: 'tutorial',
    category: 'ai',
    difficulty: 'beginner',
  });

  // 生成邀请链接
  const generateInviteLink = async () => {
    if (!isLoggedIn) {
      alert('请先登录');
      return;
    }

    try {
      // 这里应该从用户信息中获取用户ID，暂时模拟
      if (!userId) { alert('请先登录'); return; }
      const data = await inviteSystemAPI.generate(userId);
      
      if (data.invite_code) {
        const baseUrl = window.location.origin;
        const fullInviteLink = `${baseUrl}/register?invite=${data.invite_code}`;
        setInviteLink(fullInviteLink);
      }
    } catch (err: any) {
      alert('生成邀请链接失败：' + err.message);
    }
  };

  // 复制邀请链接
  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert('邀请链接已复制到剪贴板！');
    }
  };

  // 处理内容表单提交
  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert('请先登录');
      return;
    }

    try {
      const submitData = {
        ...contentForm,
        user_id: userId || '',
      };
      
      await contentSubmitAPI.submit(submitData);
      
      alert('内容提交成功！');
      setShowContentForm(false);
      setContentForm({
        title: '',
        content: '',
        type: 'tutorial',
        category: 'ai',
        difficulty: 'beginner',
      });
    } catch (err: any) {
      alert('提交失败：' + err.message);
    }
  };

  // 处理表单输入变化
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setContentForm({
      ...contentForm,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="pt-[72px] min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-label justify-center">Teaching Plaza</span>
          <h1 className="text-4xl lg:text-5xl font-black text-navy mb-4">
            教学广场
          </h1>
          <p className="text-xl text-gray-500 mb-8 max-w-[600px] mx-auto">
            教是最好的学
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => setShowContentForm(true)} 
              className="btn btn-primary btn-lg"
            >
              🎯 发起教学
            </button>
            <button 
              onClick={generateInviteLink} 
              className="btn btn-secondary btn-lg"
            >
              📨 生成邀请
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-[#E8EAF0]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="space-y-4">
            {/* Topic Filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 px-3 py-2">主题：</span>
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                    activeFilter === filter.key
                      ? 'bg-navy text-white'
                      : 'bg-surface text-gray-600 hover:bg-gold-pale'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Type, Difficulty, Sort Filters */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">类型：</span>
                <select 
                  value={activeTypeFilter}
                  onChange={(e) => setActiveTypeFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#E8EAF0] text-sm bg-white"
                >
                  {typeFilters.map((filter) => (
                    <option key={filter.key} value={filter.key}>{filter.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">难度：</span>
                <select 
                  value={activeDifficultyFilter}
                  onChange={(e) => setActiveDifficultyFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#E8EAF0] text-sm bg-white"
                >
                  {difficultyFilters.map((filter) => (
                    <option key={filter.key} value={filter.key}>{filter.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-500">排序：</span>
                <select 
                  value={activeSort}
                  onChange={(e) => setActiveSort(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#E8EAF0] text-sm bg-white"
                >
                  {sortOptions.map((option) => (
                    <option key={option.key} value={option.key}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Teaching Posts */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-navy">教学动态</h2>
              
              <div className="space-y-4">
                {teachingPosts.map((post) => (
                  <div key={post.id} className={`card p-6 ${post.isLive ? 'border-red-200 bg-red-50/30' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy/10 to-gold/10 flex items-center justify-center text-lg flex-shrink-0">
                        {post.avatar}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-navy">{post.author}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            post.isLive 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {post.typeLabel}
                          </span>
                          {post.isLive && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white animate-pulse">
                              LIVE
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-bold text-navy mb-3">《{post.title}》</h3>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span>👥 参与 {post.participants}人</span>
                          {!post.isLive && (
                            <span>💝 打赏 {post.tips} LAC</span>
                          )}
                          {post.isLive ? (
                            <span className="text-red-500 font-medium">🔴 观看 {post.participants}人</span>
                          ) : (
                            <span>{post.time}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Invite Link Generation */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                  📨 邀请链接生成
                </h3>
                
                {isLoggedIn ? (
                  <div className="space-y-4">
                    <button 
                      onClick={generateInviteLink}
                      className="w-full btn btn-primary btn-sm"
                    >
                      生成邀请链接
                    </button>
                    
                    {inviteLink && (
                      <div className="p-3 bg-gold/5 border border-gold/20 rounded-lg">
                        <div className="text-xs text-gray-500 mb-2">您的邀请链接：</div>
                        <div className="text-xs font-mono bg-white p-2 rounded border break-all">
                          {inviteLink}
                        </div>
                        <button 
                          onClick={copyInviteLink}
                          className="w-full mt-2 btn btn-ghost btn-sm"
                        >
                          复制链接
                        </button>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-400">
                      邀请好友加入LAC，共同学习成长！
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500 mb-2">请先登录</div>
                    <div className="text-xs text-gray-400">登录后可生成专属邀请链接</div>
                  </div>
                )}
              </div>

              {/* Live Streaming */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                  🔴 正在直播
                </h3>
                
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-lg flex-shrink-0">
                      🤖
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-navy mb-1">AITeacher</div>
                      <div className="text-sm text-gray-600 mb-2">《ChatGPT高级Prompt技巧》</div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">直播中</span>
                        <span className="text-red-600 font-medium">342人观看</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* My Teaching */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-navy mb-4">我的教学</h3>
                
                <div className="space-y-3">
                  {myTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveMyTab(tab)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeMyTab === tab
                          ? 'bg-navy text-white'
                          : 'bg-surface text-gray-600 hover:bg-gold-pale'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-[#E8EAF0]">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-navy">12</div>
                      <div className="text-xs text-gray-500">发布教程</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gold">1,234</div>
                      <div className="text-xs text-gray-500">获得打赏</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Submission Form Modal */}
      {showContentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-navy">📝 提交内容</h2>
              <button 
                onClick={() => setShowContentForm(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleContentSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">标题</label>
                <input
                  type="text"
                  name="title"
                  value={contentForm.title}
                  onChange={handleFormChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                  placeholder="请输入内容标题"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">内容</label>
                <textarea
                  name="content"
                  value={contentForm.content}
                  onChange={handleFormChange}
                  required
                  rows={8}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gold resize-none"
                  placeholder="请输入内容详情..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">类型</label>
                  <select
                    name="type"
                    value={contentForm.type}
                    onChange={handleFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                  >
                    <option value="tutorial">图文教程</option>
                    <option value="video">视频教程</option>
                    <option value="live">直播教学</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">分类</label>
                  <select
                    name="category"
                    value={contentForm.category}
                    onChange={handleFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                  >
                    <option value="ai">AI技术</option>
                    <option value="web3">Web3</option>
                    <option value="dev">编程开发</option>
                    <option value="design">设计</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">难度</label>
                  <select
                    name="difficulty"
                    value={contentForm.difficulty}
                    onChange={handleFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                  >
                    <option value="beginner">入门</option>
                    <option value="intermediate">进阶</option>
                    <option value="advanced">高级</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContentForm(false)}
                  className="flex-1 btn btn-ghost"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 btn btn-primary"
                >
                  提交内容
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}