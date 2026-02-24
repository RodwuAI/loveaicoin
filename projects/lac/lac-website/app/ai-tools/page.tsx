'use client';

import { useState } from 'react';

const categories = ['全部', '文本生成', '图像生成', '代码助手', '翻译', '数据分析'];

const tools = [
  {
    id: 1,
    icon: '🤖',
    name: 'AI写作助手',
    description: '智能生成文章、报告、邮件等各类文本内容，提升写作效率',
    category: '文本生成',
    price: '免费',
    isPaid: false,
    usageCount: 12340,
    rating: 4.8,
    url: 'https://chat.openai.com',
  },
  {
    id: 2,
    icon: '🎨',
    name: 'AI绘图',
    description: '基于文本描述生成高质量图像，释放创意想象力',
    category: '图像生成',
    price: '5 LAC/次',
    isPaid: true,
    usageCount: 8920,
    rating: 4.6,
    url: 'https://www.midjourney.com',
  },
  {
    id: 3,
    icon: '💻',
    name: '代码生成器',
    description: '自动生成、优化和调试代码，提升开发效率',
    category: '代码助手',
    price: '3 LAC/次',
    isPaid: true,
    usageCount: 15670,
    rating: 4.9,
    url: 'https://github.com/features/copilot',
  },
  {
    id: 4,
    icon: '🌐',
    name: '智能翻译',
    description: '精准翻译多种语言，保持语境和语调的一致性',
    category: '翻译',
    price: '免费',
    isPaid: false,
    usageCount: 23450,
    rating: 4.7,
    url: 'https://www.deepl.com',
  },
  {
    id: 5,
    icon: '📊',
    name: '数据分析',
    description: '快速分析数据趋势，生成可视化图表和深度报告',
    category: '数据分析',
    price: '10 LAC/次',
    isPaid: true,
    usageCount: 5230,
    rating: 4.5,
    url: 'https://julius.ai',
  },
];

export default function AIToolsPage() {
  const [activeCategory, setActiveCategory] = useState('全部');

  const filteredTools = activeCategory === '全部' 
    ? tools 
    : tools.filter(tool => tool.category === activeCategory);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span 
            key={i} 
            className={`text-sm ${
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

  return (
    <div className="pt-[72px] min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-label justify-center">AI Toolbox</span>
          <h1 className="text-4xl lg:text-5xl font-black text-navy mb-4">
            AI工具箱
          </h1>
          <p className="text-xl text-gray-500 max-w-[600px] mx-auto">
            用LAC解锁AI超能力
          </p>
        </div>
      </section>

      {/* Category Tabs */}
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

      {/* Tools Grid */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTools.map((tool) => (
              <div key={tool.id} className="card p-8 text-center relative">
                <div className="w-20 h-20 rounded-3xl bg-surface flex items-center justify-center text-4xl mx-auto mb-6">
                  {tool.icon}
                </div>
                
                <h3 className="text-xl font-bold text-navy mb-3">{tool.name}</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  {tool.description}
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">价格</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      tool.isPaid 
                        ? 'bg-gradient-to-r from-gold/10 to-gold-light/10 text-gold border border-gold/20'
                        : 'bg-green-50 text-green-600 border border-green-200'
                    }`}>
                      {tool.price}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">使用次数</span>
                    <span className="text-sm font-medium text-navy">
                      {tool.usageCount.toLocaleString()}次
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">评分</span>
                    {renderStars(tool.rating)}
                  </div>
                </div>

                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!tool.url) {
                      e.preventDefault();
                      alert('该工具暂未开放');
                    }
                  }}
                  className="w-full btn btn-primary inline-flex items-center justify-center cursor-pointer"
                >
                  开始使用 ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Usage Stats */}
      <section className="py-16 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-2xl mx-auto mb-4">
                🎁
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">今日免费额度</h3>
              <div className="text-3xl font-black text-green-600 mb-1">3</div>
              <p className="text-xs text-gray-500">剩余免费使用次数</p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold-pale flex items-center justify-center text-2xl mx-auto mb-4">
                💰
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">LAC余额</h3>
              <div className="text-3xl font-black text-gold mb-1">1,250</div>
              <p className="text-xs text-gray-500">可用于付费工具</p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-navy/5 flex items-center justify-center text-2xl mx-auto mb-4">
                📈
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">使用历史</h3>
              <div className="text-3xl font-black text-navy mb-1">156</div>
              <p className="text-xs text-gray-500">累计使用次数</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}