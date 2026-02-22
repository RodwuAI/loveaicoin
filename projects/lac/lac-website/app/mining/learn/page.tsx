'use client';

import Link from 'next/link';
import { useState } from 'react';

const rewardData = [
  { action: '完成基础课程', icon: '📖', reward: '10-30 LAC', desc: '每节课程完成后立即获得' },
  { action: '完成进阶课程', icon: '🎓', reward: '40-50 LAC', desc: '复杂课程获得更多奖励' },
  { action: '通过课后测验', icon: '✅', reward: '+20% LAC', desc: '80%+正确率获得额外奖励' },
  { action: '每日签到', icon: '📅', reward: '5-15 LAC', desc: '连续签到有倍数加成' },
  { action: '阅读白皮书/文档', icon: '📄', reward: '2-5 LAC', desc: '阅读时长达标获得奖励' },
  { action: '等级提升', icon: '🆙', reward: '效率+10%', desc: '每升级一级挖矿效率提升' },
];

const faqData = [
  {
    question: '什么是学习挖矿？',
    answer: '学习挖矿是LAC的核心机制之一。通过完成课程、参与测验、每日签到等学习行为，你可以获得LAC代币奖励。这让学习AI知识的过程变成了一种"挖矿"体验。'
  },
  {
    question: '如何提升挖矿效率？',
    answer: '提升挖矿效率的方法包括：1）连续签到获得加成倍数；2）提升等级解锁更高效率；3）完成高难度课程获得更多奖励；4）保持学习活跃度获得额外bonus。'
  },
  {
    question: '学习等级如何计算？',
    answer: '学习等级基于你的累计学习时长、完成课程数、测验通过率等多维度数据计算。等级越高，你的挖矿效率越高，还能解锁独特的徽章和权益。'
  },
  {
    question: '奖励什么时候到账？',
    answer: 'LAC奖励会在行为完成后实时到账到你的钱包。你可以随时在个人资料页面查看详细的挖矿记录和奖励历史。'
  }
];

export default function LearnMiningPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-[120px] pb-20 bg-gradient-to-b from-white to-surface">
        <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(197,151,91,0.06)_0%,transparent_70%)]" />
        
        <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold-pale to-gold/[0.15] border-[3px] border-gold-light flex items-center justify-center text-6xl mx-auto mb-8 animate-float">
            📚
          </div>
          
          <h1 className="text-4xl lg:text-[56px] font-black leading-[1.1] text-navy mb-6">
            学习<span className="gold-text">挖矿</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed mb-4 font-medium">
            通过学习AI知识获得LAC奖励，开启你的学习挖矿之旅
          </p>
          <p className="text-sm text-gray-400 italic mb-8">
            Learn to Mine, Knowledge is Power
          </p>
          
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-gold-pale rounded-full text-sm font-semibold text-gold mb-10">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            预估收益：50-200 LAC/天
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/learn" className="btn btn-primary btn-lg">
              📚 开始学习
            </Link>
            <Link href="/register" className="btn btn-secondary btn-lg">
              🎯 注册账户
            </Link>
          </div>
        </div>
      </section>

      {/* Learning Behaviors Section */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            什么算学习行为？
          </h2>
          <p className="text-[17px] text-gray-500 text-center max-w-[600px] mx-auto mb-16">
            LAC认可并奖励所有形式的AI知识学习行为，让每一分钟的学习都产生价值。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                📖
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">完成平台课程</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                从AI基础到进阶应用，每完成一课都有对应LAC奖励。课程难度越高，奖励越丰厚。
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                ✅
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">通过课后测验</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                测验正确率达到80%以上，可获得额外20%的LAC奖励。检验学习成果，奖励真正掌握。
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                📅
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">每日签到</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                养成学习习惯，每日签到获得基础LAC。连续签到天数越多，倍数加成越高。
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                📄
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">阅读白皮书/文档</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                深入了解AI项目原理和技术文档，阅读时长达标即可获得LAC奖励。
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                🆙
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">等级提升</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                累计学习时长达到标准可升级。每提升一级，挖矿效率+10%，解锁更多权益。
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                🏆
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">完成学习任务</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                参与平台发布的学习挑战和任务，完成后获得额外LAC奖励和成就徽章。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reward Rules Table */}
      <section className="py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            奖励规则详情
          </h2>
          <p className="text-[17px] text-gray-500 text-center max-w-[600px] mx-auto mb-16">
            透明化的奖励机制，让你清楚了解每一个学习行为的价值。
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

          {/* Level Progress Example */}
          <div className="max-w-[600px] mx-auto mt-16 p-8 bg-white rounded-2xl border border-[#E8EAF0] shadow-card">
            <h3 className="text-xl font-bold text-navy text-center mb-6">等级提升示例</h3>
            <div className="space-y-4">
              {[
                { level: 'Lv.1 AI新手', hours: '0-10小时', efficiency: '100%', color: 'bg-gray-400' },
                { level: 'Lv.2 AI学徒', hours: '11-30小时', efficiency: '110%', color: 'bg-blue-400' },
                { level: 'Lv.3 AI能手', hours: '31-60小时', efficiency: '120%', color: 'bg-green-400' },
                { level: 'Lv.4 AI高手', hours: '61-120小时', efficiency: '130%', color: 'bg-gold' },
              ].map((item) => (
                <div key={item.level} className="flex items-center justify-between p-4 rounded-xl border border-[#E8EAF0]">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <div>
                      <div className="font-semibold text-navy">{item.level}</div>
                      <div className="text-xs text-gray-500">{item.hours}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gold">挖矿效率</div>
                    <div className="text-sm text-navy">{item.efficiency}</div>
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
            关于学习挖矿的一切疑问，这里都有答案。
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