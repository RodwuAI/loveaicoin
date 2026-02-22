'use client';

import Link from 'next/link';
import { useState } from 'react';

const rewardData = [
  { action: 'AI写作工具', icon: '✍️', reward: '5-10 LAC', desc: '每次有效使用AI写作助手' },
  { action: 'AI翻译工具', icon: '🌐', reward: '3-8 LAC', desc: '使用AI翻译，按字数计算奖励' },
  { action: 'AI编程助手', icon: '💻', reward: '8-15 LAC', desc: '使用AI编程工具解决问题' },
  { action: '完成实操任务', icon: '🎯', reward: '30-100 LAC', desc: '用AI完成实际项目任务' },
  { action: '提交使用报告', icon: '📝', reward: '20-50 LAC', desc: '分享AI使用心得和成果' },
  { action: '参与工具评测', icon: '⭐', reward: '10-30 LAC', desc: '为AI工具打分并写评价' },
];

const aiTools = [
  { name: 'LAC AI Writer', icon: '✍️', desc: 'AI智能写作助手，支持多种文体创作', category: '内容创作' },
  { name: 'Code Assistant', icon: '💻', desc: '强大的AI编程助手，提供代码生成和调试', category: '开发工具' },
  { name: 'Smart Translator', icon: '🌐', desc: '多语言AI翻译工具，支持50+种语言', category: '语言工具' },
  { name: 'Design Helper', icon: '🎨', desc: 'AI设计助手，快速生成创意和方案', category: '设计工具' },
  { name: 'Data Analyzer', icon: '📊', desc: 'AI数据分析工具，洞察数据背后的价值', category: '分析工具' },
  { name: 'Content Optimizer', icon: '🚀', desc: '内容优化AI，提升文章质量和SEO效果', category: '优化工具' },
];

const faqData = [
  {
    question: '什么是使用挖矿？',
    answer: '使用挖矿是LAC鼓励用户实际使用AI工具的奖励机制。通过使用平台提供的AI工具完成实际任务，用户可以获得LAC代币奖励，真正实现"边用边赚"。'
  },
  {
    question: '如何确保使用行为的有效性？',
    answer: '系统会通过多重机制验证使用行为：1）任务完成质量评估；2）使用时长和复杂度分析；3）输出结果的实用性检查；4）防作弊算法监控。'
  },
  {
    question: '实操任务如何获取？',
    answer: '平台会定期发布实操任务，包括企业合作项目、社区挑战任务、技能提升任务等。用户可以根据自己的能力和兴趣选择参与。'
  },
  {
    question: '使用报告有什么要求？',
    answer: '使用报告需要包含：使用的AI工具、解决的具体问题、使用过程和心得、最终成果展示。报告需要真实有效，通过社区审核才能获得奖励。'
  }
];

export default function UseMiningPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-[120px] pb-20 bg-gradient-to-b from-white to-surface">
        <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(197,151,91,0.06)_0%,transparent_70%)]" />
        
        <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold-pale to-gold/[0.15] border-[3px] border-gold-light flex items-center justify-center text-6xl mx-auto mb-8 animate-float">
            🔧
          </div>
          
          <h1 className="text-4xl lg:text-[56px] font-black leading-[1.1] text-navy mb-6">
            使用<span className="gold-text">挖矿</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed mb-4 font-medium">
            使用AI工具，边用边赚，开始你的AI使用之旅
          </p>
          <p className="text-sm text-gray-400 italic mb-8">
            Use to Earn, Action Speaks Louder
          </p>
          
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-gold-pale rounded-full text-sm font-semibold text-gold">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            预估收益：30-150 LAC/天
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/ai-tools" className="btn btn-primary btn-lg">
              🔧 探索AI工具
            </Link>
            <Link href="/register" className="btn btn-secondary btn-lg">
              🎯 注册账户
            </Link>
          </div>
        </div>
      </section>

      {/* Use Behaviors Section */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            什么算使用行为？
          </h2>
          <p className="text-[17px] text-gray-500 text-center max-w-[600px] mx-auto mb-16">
            LAC奖励真正的AI工具使用，让每一次实际应用都产生价值。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                🛠️
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">使用平台AI工具</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                AI写作、翻译、编程助手等工具，每次有效使用都能获得LAC奖励。
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                🎯
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">完成AI实操任务</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                用AI完成实际项目和挑战任务，根据任务复杂度获得丰厚LAC奖励。
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                📝
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">提交AI使用报告</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                分享你的AI使用心得、成果和技巧，通过社区审核获得LAC奖励。
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                ⭐
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">参与AI工具评测</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                为AI工具打分、写评价，帮助社区发现优质工具，获得评测奖励。
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                🏆
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">工具使用竞赛</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                参与定期举办的AI工具使用竞赛，展示创意应用获得特殊奖励。
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                💡
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">AI应用创新</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                发现AI工具的创新用法，为社区贡献新的应用场景和技巧。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Tools Showcase */}
      <section className="py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            LAC AI工具箱
          </h2>
          <p className="text-[17px] text-gray-500 text-center max-w-[600px] mx-auto mb-16">
            丰富的AI工具等你来使用，每一次使用都是挖矿的开始。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiTools.map((tool) => (
              <div key={tool.name} className="card p-6 rounded-2xl group hover:shadow-card-hover hover:border-gold-light transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-2xl group-hover:bg-gold-pale transition-colors">
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy">{tool.name}</h3>
                    <span className="inline-flex px-2 py-0.5 bg-gold-pale text-gold text-xs font-medium rounded-full">
                      {tool.category}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{tool.desc}</p>
                <button 
                  className="w-full btn btn-secondary btn-sm"
                  onClick={() => window.__toast?.('挖矿功能即将开放，敬请期待')}
                >
                  立即使用 →
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/ai-tools" className="btn btn-primary btn-lg">
              🔧 探索更多AI工具
            </Link>
          </div>
        </div>
      </section>

      {/* Reward Rules Table */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            奖励规则详情
          </h2>
          <p className="text-[17px] text-gray-500 text-center max-w-[600px] mx-auto mb-16">
            清晰透明的奖励机制，让你的每一次AI使用都获得应有回报。
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

          {/* Usage Calculator */}
          <div className="max-w-[600px] mx-auto mt-16 p-8 bg-white rounded-2xl border border-[#E8EAF0] shadow-card">
            <h3 className="text-xl font-bold text-navy text-center mb-6">每日使用收益估算</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E8EAF0] bg-surface">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="font-medium text-navy">轻度使用 (1-3次/天)</span>
                </div>
                <span className="text-gold font-semibold">15-45 LAC</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E8EAF0] bg-surface">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-400" />
                  <span className="font-medium text-navy">中度使用 (4-8次/天)</span>
                </div>
                <span className="text-gold font-semibold">60-120 LAC</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E8EAF0] bg-surface">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gold" />
                  <span className="font-medium text-navy">重度使用 (9+次/天)</span>
                </div>
                <span className="text-gold font-semibold">135+ LAC</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gold-pale rounded-xl">
              <p className="text-sm text-center text-gray-600">
                💡 提示：完成实操任务和提交使用报告可以大幅提升收益
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            常见问题
          </h2>
          <p className="text-[17px] text-gray-500 text-center mb-16">
            关于使用挖矿的疑问解答，让你更好地开始挖矿之旅。
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