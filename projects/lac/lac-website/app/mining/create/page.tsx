'use client';

import Link from 'next/link';
import { useState } from 'react';

const rewardData = [
  { action: 'AI文章/教程', icon: '📝', reward: '50-200 LAC', desc: '发布后一次性奖励+每次被学习2 LAC' },
  { action: 'AI视频课程', icon: '🎬', reward: '100-300 LAC', desc: '视频制作奖励更高+持续观看收益' },
  { action: '开发AI工具', icon: '🔨', reward: '200-1000 LAC', desc: '工具上架奖励+70%销售分成' },
  { action: '付费课程', icon: '💎', reward: '80%销售收入', desc: '平台抽成20%，创作者获得80%' },
  { action: 'Prompt模板', icon: '🎯', reward: '30-100 LAC', desc: '模板上架奖励+每次使用分成' },
  { action: 'AI作品集', icon: '🎨', reward: '无上限', desc: '根据作品质量和受欢迎程度' },
];

const creationTypes = [
  { 
    type: '内容创作',
    icon: '📝',
    items: ['AI应用文章', '技术教程', '使用指南', '案例分析', '行业报告'],
    desc: '分享AI知识和经验，每篇内容都是数字资产'
  },
  {
    type: '工具开发',
    icon: '🔨',
    items: ['AI插件', '自动化脚本', '数据处理工具', 'API封装', '界面工具'],
    desc: '开发实用的AI工具，让技能变现为持续收入'
  },
  {
    type: '课程制作',
    icon: '🎓',
    items: ['视频课程', '互动教程', '实操训练', '项目指导', 'Workshop'],
    desc: '制作高质量教育内容，建立知识付费收入'
  },
  {
    type: '模板市场',
    icon: '🎯',
    items: ['Prompt模板', '工作流程', 'AI配置', '自动化模板', '最佳实践'],
    desc: '创建可重复使用的模板，让经验标准化变现'
  }
];

const revenueCalculator = {
  content: [
    { metric: '1篇优质文章', views: '1000次阅读', earning: '50 + 2000 LAC' },
    { metric: '10篇文章/月', views: '平均800次/篇', earning: '~16,500 LAC/月' },
    { metric: '持续创作1年', views: '累计影响力', earning: '200,000+ LAC' },
  ],
  tools: [
    { metric: '开发1个工具', sales: '100次销售', earning: '1000 + 7000 LAC' },
    { metric: '热门工具', sales: '1000次销售/月', earning: '70,000 LAC/月' },
    { metric: '工具矩阵', sales: '多工具组合', earning: '500,000+ LAC' },
  ],
  courses: [
    { metric: '1门课程($99)', students: '100个学生', earning: '$7,920 (63,360 LAC)' },
    { metric: '5门课程组合', students: '平均50学生/课', earning: '$19,800 (158,400 LAC)' },
    { metric: '知名讲师', students: '大量学生+复购', earning: '无上限' },
  ]
};

const faqData = [
  {
    question: '什么是创造挖矿？',
    answer: '创造挖矿是LAC最具潜力的挖矿方式。通过创作AI相关内容、开发工具、制作课程等，创作者不仅获得创作奖励，还能通过销售、订阅、使用分成等方式获得持续收入。'
  },
  {
    question: '如何确定内容的价值和定价？',
    answer: '内容价值由社区评议和市场反馈决定。平台提供参考定价机制，创作者可以根据内容质量、制作成本、市场需求等因素自主定价。优质内容会获得平台推荐加成。'
  },
  {
    question: '创作者收益如何计算？',
    answer: '收益包含：1）创作奖励(发布时一次性)；2）使用分成(每次被使用时)；3）销售分成(付费内容销售时)；4）订阅收入(付费订阅用户)；5）推荐奖励(内容被平台推荐)。'
  },
  {
    question: '知识产权如何保护？',
    answer: '所有创作内容都会生成区块链指纹记录创作时间和所有权。平台提供版权保护机制，对抄袭和侵权行为进行识别和处理。创作者保留内容的完整知识产权。'
  },
  {
    question: '如何提升创作收益？',
    answer: '提升收益的方法：1）持续创作高质量内容；2）建立个人品牌和粉丝群体；3）开发热门工具和课程；4）参与平台活动获得曝光；5）与其他创作者合作互推。'
  }
];

export default function CreateMiningPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('content');

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-[120px] pb-20 bg-gradient-to-b from-white to-surface overflow-x-hidden">
        <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(197,151,91,0.06)_0%,transparent_70%)]" />
        
        <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold-pale to-gold/[0.15] border-[3px] border-gold-light flex items-center justify-center text-6xl mx-auto mb-8 animate-float">
            🎨
          </div>
          
          <h1 className="text-4xl lg:text-[56px] font-black leading-[1.1] text-navy mb-6">
            创造<span className="gold-text">挖矿</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed mb-4 font-medium">
            创造价值，让知识变成链上资产，开始你的创作变现之旅
          </p>
          <p className="text-sm text-gray-400 italic mb-8">
            Create to Earn, Turn Ideas into Digital Assets
          </p>
          
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-gold-pale rounded-full text-sm font-semibold text-gold mb-10">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            预估收益：无上限
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/market" className="btn btn-primary btn-lg">
              🎨 开始创造
            </Link>
            <Link href="/register" className="btn btn-secondary btn-lg">
              🎯 注册账户
            </Link>
          </div>
        </div>
      </section>

      {/* Creation Types Section */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            什么算创造行为？
          </h2>
          <p className="text-[17px] text-gray-500 text-center max-w-[600px] mx-auto mb-16">
            LAC支持所有形式的AI相关创作，让每一份原创都能产生持续价值。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {creationTypes.map((category) => (
              <div key={category.type} className="card p-8 rounded-2xl group hover:shadow-card-hover hover:border-gold-light transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl group-hover:bg-gold-pale transition-colors">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-2">{category.type}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{category.desc}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Calculator */}
      <section className="py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            创作者收益计算器
          </h2>
          <p className="text-[17px] text-gray-500 text-center max-w-[600px] mx-auto mb-16">
            了解不同类型创作的收益潜力，选择最适合你的创作方向。
          </p>

          {/* Category Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white rounded-2xl p-2 shadow-card">
              {[
                { key: 'content', label: '内容创作', icon: '📝' },
                { key: 'tools', label: '工具开发', icon: '🔨' },
                { key: 'courses', label: '课程制作', icon: '🎓' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                    selectedCategory === tab.key
                      ? 'bg-gold text-white shadow-gold'
                      : 'text-gray-600 hover:bg-surface'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calculator Results */}
          <div className="max-w-[800px] mx-auto">
            <div className="space-y-4">
              {revenueCalculator[selectedCategory as keyof typeof revenueCalculator].map((item, index) => (
                <div key={index} className="card p-6 rounded-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <div className="font-bold text-navy">{item.metric}</div>
                      <div className="text-sm text-gray-500">{'views' in item ? item.views : ('sales' in item ? item.sales : ('students' in item ? item.students : ''))}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">→</div>
                    </div>
                    <div className="text-right md:text-left">
                      <div className="text-lg font-bold text-gold">{item.earning}</div>
                      <div className="text-sm text-gray-500">预估收益</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-white rounded-2xl border border-[#E8EAF0]">
              <div className="text-center">
                <div className="text-2xl mb-4">💡</div>
                <div className="font-semibold text-navy mb-2">收益提示</div>
                <div className="text-sm text-gray-500 leading-relaxed">
                  {selectedCategory === 'content' && '优质内容具有长尾效应，持续创作能建立稳定收益流。'}
                  {selectedCategory === 'tools' && '实用工具一旦成功，能带来长期被动收入，投入回报比很高。'}
                  {selectedCategory === 'courses' && '课程制作需要前期投入，但成功后能带来可观的知识付费收入。'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reward Rules */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            奖励规则详情
          </h2>
          <p className="text-[17px] text-gray-500 text-center max-w-[600px] mx-auto mb-16">
            透明的创作奖励机制，让你的每一份创作都获得应有回报。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewardData.map((item) => (
              <div key={item.action} className="card p-6 rounded-2xl group hover:shadow-card-hover hover:border-gold-light transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-2xl group-hover:bg-gold-pale transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy">{item.action}</h3>
                    <div className="text-sm font-semibold text-gold">{item.reward}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Journey */}
      <section className="py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            创作者成长路径
          </h2>
          <p className="text-[17px] text-gray-500 text-center max-w-[600px] mx-auto mb-16">
            从新手到知名创作者，LAC为你规划完整的成长道路。
          </p>

          <div className="max-w-[800px] mx-auto">
            <div className="space-y-8">
              {[
                {
                  level: '新手创作者',
                  icon: '🌱',
                  requirements: '发布第1份作品',
                  benefits: ['基础创作奖励', '社区新人支持', '免费推广机会'],
                  color: 'border-green-200 bg-green-50'
                },
                {
                  level: '活跃创作者',
                  icon: '📈',
                  requirements: '发布10+作品，获得100+好评',
                  benefits: ['奖励加成+20%', 'VIP创作者标识', '优先推荐位'],
                  color: 'border-blue-200 bg-blue-50'
                },
                {
                  level: '优质创作者',
                  icon: '⭐',
                  requirements: '作品被收藏500+次',
                  benefits: ['奖励加成+50%', '专属创作者页面', '平台合作机会'],
                  color: 'border-purple-200 bg-purple-50'
                },
                {
                  level: '知名创作者',
                  icon: '👑',
                  requirements: '粉丝数1000+，月收入过万',
                  benefits: ['最高奖励加成', '品牌合作资源', 'LAC代言人候选'],
                  color: 'border-gold bg-gold-pale'
                }
              ].map((stage, index) => (
                <div key={stage.level} className={`p-6 rounded-2xl border-2 ${stage.color} transition-all hover:shadow-card-hover`}>
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                      {stage.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-navy mb-2">{stage.level}</h3>
                      <p className="text-sm text-gray-600 mb-4">{stage.requirements}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {stage.benefits.map((benefit) => (
                          <div key={benefit} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                            <span className="text-sm text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gold">Lv.{index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            常见问题
          </h2>
          <p className="text-[17px] text-gray-500 text-center mb-16">
            关于创造挖矿的详细解答，助你开启创作变现之旅。
          </p>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="card rounded-2xl overflow-hidden">
                <button
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-surface transition-colors"
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                >
                  <span className="font-semibold text-navy">{faq.question}</span>
                  <div className={`transition-transform ${openFaqIndex === index ? 'rotate-45' : ''}`}>
                    ➕
                  </div>
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}