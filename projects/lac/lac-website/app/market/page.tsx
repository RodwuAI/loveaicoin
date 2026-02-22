'use client';

import { useState, useEffect } from 'react';
import { promptMarketAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const featuredWorks: any[] = []; // 从API获取

const works: any[] = []; // 从API获取

const topCreators: any[] = []; // 从API获取

const categories = ['全部', '教程', '模板', 'AI提示词', '数字艺术', '工具插件'];

export default function MarketPage() {
  const { isLoggedIn } = useAuth();
  const [activeCategory, setActiveCategory] = useState('全部');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [templates, setTemplates] = useState<any[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showTemplateDetail, setShowTemplateDetail] = useState(false);

  // 获取模板数据
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await promptMarketAPI.list(1, 12);
        setTemplates(data.templates || []);
        // 取前3个作为精选
        setFeaturedTemplates((data.templates || []).slice(0, 3));
      } catch (err: any) {
        setError(err.message || '加载模板失败');
        setTemplates([]);
        setFeaturedTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // 处理模板详情
  const handleTemplateClick = async (templateId: string) => {
    if (!isLoggedIn) {
      alert('请先登录查看模板详情');
      return;
    }

    try {
      const data = await promptMarketAPI.detail(templateId);
      setSelectedTemplate(data.template);
      setShowTemplateDetail(true);
    } catch (err: any) {
      alert('获取模板详情失败：' + err.message);
    }
  };

  // 发布表单状态
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [publishForm, setPublishForm] = useState({ title: '', content: '', category: 'prompt', price: 0 });
  const [publishing, setPublishing] = useState(false);

  // 处理发布作品
  const handlePublishWork = () => {
    if (!isLoggedIn) {
      alert('请先登录后再发布作品');
      return;
    }
    setShowPublishForm(true);
  };

  const handleSubmitWork = async () => {
    if (publishForm.title.length < 5) { alert('标题至少5个字'); return; }
    if (publishForm.content.length < 50) { alert('内容至少50个字'); return; }
    setPublishing(true);
    try {
      const token = localStorage.getItem('lac_token');
      await promptMarketAPI.submit({
        title: publishForm.title,
        content: publishForm.content,
        category: publishForm.category,
        price: publishForm.price,
        token,
      });
      alert('🎉 发布成功！审核通过后将展示在市场中');
      setShowPublishForm(false);
      setPublishForm({ title: '', content: '', category: 'prompt', price: 0 });
      // 刷新列表
      const data = await promptMarketAPI.list(1, 12);
      setTemplates(data.templates || []);
      setFeaturedTemplates((data.templates || []).slice(0, 3));
    } catch (err: any) {
      alert('发布失败：' + (err.message || '请稍后重试'));
    } finally {
      setPublishing(false);
    }
  };

  const filteredWorks = activeCategory === '全部' 
    ? templates 
    : templates.filter(work => {
        const categoryMap: { [key: string]: string } = {
          '教程': 'tutorial',
          '模板': 'template',
          'AI提示词': 'prompt',
          '数字艺术': 'design',
          '工具插件': 'plugin',
        };
        return work.category === categoryMap[activeCategory];
      });

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span 
            key={i} 
            className={`text-xs ${
              i < fullStars 
                ? 'text-yellow-400' 
                : i === fullStars && hasHalfStar 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
        <span className="text-xs text-gray-500 ml-1">{rating}</span>
      </div>
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredWorks.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredWorks.length) % featuredWorks.length);
  };

  return (
    <div className="pt-[72px] min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-label justify-center">Creator Market</span>
          <h1 className="text-4xl lg:text-5xl font-black text-navy mb-4">
            创作者市场
          </h1>
          <p className="text-xl text-gray-500 mb-4 max-w-[700px] mx-auto">
            创作即价值，每个作品都是数字资产
          </p>
          <div className="text-sm text-gray-400 mb-8 italic">
            {isLoggedIn ? '已连接真实API数据' : '请登录查看完整内容'}
          </div>
          <button 
            className="btn btn-primary btn-lg"
            onClick={handlePublishWork}
          >
            🚀 发布作品
          </button>
        </div>
      </section>

      {/* Featured Works Carousel */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-navy mb-8 text-center">精选作品</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-gray-500">加载模板中...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="text-lg font-bold text-gray-700 mb-2">加载失败</div>
              <div className="text-sm text-gray-500">{error}</div>
            </div>
          ) : featuredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <div className="text-lg font-bold text-gray-700 mb-2">暂无模板</div>
              <div className="text-sm text-gray-500">敬请期待更多精彩模板</div>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-6 overflow-hidden">
                {featuredTemplates.map((work, index) => (
                  <div 
                    key={work.id}
                    className={`min-w-full md:min-w-[400px] card p-8 text-center transition-all duration-500 cursor-pointer ${
                      index === currentSlide ? 'scale-100 opacity-100' : 'scale-95 opacity-60'
                    }`}
                    style={{ 
                      transform: `translateX(-${currentSlide * 100}%)`,
                    }}
                    onClick={() => handleTemplateClick(work.id)}
                  >
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold-pale to-gold/20 flex items-center justify-center text-4xl mx-auto mb-6">
                      {work.icon || work.cover || '📝'}
                    </div>
                    
                    <h3 className="text-xl font-bold text-navy mb-3">《{work.title || work.name}》</h3>
                    
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center text-sm">
                        {work.author_avatar || '👤'}
                      </div>
                      <span className="text-sm text-gray-600">by {work.author || '创作者'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-2xl font-black text-gold">{work.price || 0}</span>
                        <span className="text-sm text-gray-500 ml-1">LAC</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        已售 {work.sales || 0} 份
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateClick(work.id);
                      }} 
                      className="w-full btn btn-primary"
                    >
                      查看详情
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="relative">
            {featuredTemplates.length > 0 && (
              <>
                {/* Carousel Controls */}
                <button 
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-white shadow-card-hover border border-[#E8EAF0] flex items-center justify-center text-navy hover:border-gold transition-all duration-200"
                >
                  ←
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-white shadow-card-hover border border-[#E8EAF0] flex items-center justify-center text-navy hover:border-gold transition-all duration-200"
                >
                  →
                </button>
                
                {/* Dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {featuredTemplates.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentSlide ? 'bg-gold w-6' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-[#E8EAF0]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? 'bg-navy text-white shadow-card-hover'
                    : 'bg-surface text-gray-600 hover:bg-gold-pale hover:text-gold'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Works Grid */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-gray-500">加载模板中...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="text-lg font-bold text-gray-700 mb-2">加载失败</div>
              <div className="text-sm text-gray-500">{error}</div>
            </div>
          ) : filteredWorks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <div className="text-lg font-bold text-gray-700 mb-2">暂无模板</div>
              <div className="text-sm text-gray-500">该分类下暂无模板，敬请期待</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredWorks.map((work) => (
                <div key={work.id} className="card p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleTemplateClick(work.id)}>
                  <div className="w-full h-40 rounded-2xl bg-gradient-to-br from-navy/5 to-gold/10 flex items-center justify-center text-4xl mb-6">
                    {work.icon || work.cover || '📝'}
                  </div>
                  
                  <h3 className="text-lg font-bold text-navy mb-3 line-clamp-2">{work.title || work.name}</h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-sm">
                      {work.author_avatar || '👤'}
                    </div>
                    <span className="text-sm text-gray-600">{work.author || '创作者'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xl font-black text-gold">{work.price || 0}</span>
                      <span className="text-sm text-gray-500 ml-1">LAC</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {work.sales || 0}份销量
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    {work.rating ? renderStars(work.rating) : (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">暂无评分</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLoggedIn) {
                        alert('请先登录后购买');
                        return;
                      }
                      handleTemplateClick(work.id);
                    }} 
                    className="w-full btn btn-primary btn-sm"
                  >
                    {isLoggedIn ? '查看详情' : '登录购买'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Creators */}
      <section className="py-16 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-navy mb-8">本周明星创作者</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topCreators.map((creator, index) => (
              <div key={creator.name} className="card p-8 text-center relative">
                {index === 0 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                    👑
                  </div>
                )}
                
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gold-pale to-gold/20 flex items-center justify-center text-4xl mx-auto mb-6">
                  {creator.avatar}
                </div>
                
                <h3 className="text-xl font-bold text-navy mb-4">{creator.name}</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">作品数量</span>
                    <span className="text-sm font-semibold text-navy">{creator.works}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">总收入</span>
                    <span className="text-lg font-bold text-gold">{creator.earnings.toLocaleString()} LAC</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => window.__toast?.('关注功能即将开放')}
                  className="w-full btn btn-secondary btn-sm mt-6"
                >
                  关注
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 发布作品弹窗 */}
      {showPublishForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPublishForm(false)}>
          <div className="bg-white rounded-3xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-navy">🚀 发布作品</h2>
              <button onClick={() => setShowPublishForm(false)} className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">作品标题 *</label>
                <input
                  type="text"
                  placeholder="给你的作品起个好名字（至少5个字）"
                  value={publishForm.title}
                  onChange={e => setPublishForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">分类</label>
                <select
                  value={publishForm.category}
                  onChange={e => setPublishForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all bg-white"
                >
                  <option value="prompt">AI提示词</option>
                  <option value="tutorial">教程</option>
                  <option value="template">模板</option>
                  <option value="design">数字艺术</option>
                  <option value="plugin">工具插件</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">作品内容 *</label>
                <textarea
                  placeholder="详细描述你的作品内容（至少50个字）"
                  value={publishForm.content}
                  onChange={e => setPublishForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all min-h-[160px] resize-y"
                  maxLength={5000}
                />
                <div className="text-xs text-gray-400 mt-1 text-right">{publishForm.content.length}/5000</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">定价（LAC）</label>
                <input
                  type="number"
                  placeholder="0 = 免费"
                  value={publishForm.price}
                  onChange={e => setPublishForm(f => ({ ...f, price: Math.max(0, Number(e.target.value)) }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                  min={0}
                />
              </div>

              <button
                onClick={handleSubmitWork}
                disabled={publishing}
                className="w-full btn btn-primary btn-lg disabled:opacity-50"
              >
                {publishing ? '发布中...' : '✨ 确认发布'}
              </button>

              <p className="text-xs text-gray-400 text-center">发布后将进入审核，审核通过后展示在创作者市场</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}