'use client';

import Link from 'next/link';
import { useState } from 'react';

const rewardData = [
  { action: '创建基础课程', icon: '📚', reward: '100-200 LAC', desc: '课程审核通过后一次性奖励' },
  { action: '创建高级课程', icon: '🎓', reward: '300-500 LAC', desc: '复杂课程获得更多创作奖励' },
  { action: '学生完成学习', icon: '💰', reward: '5%分成', desc: '每个学生完成你的课程' },
  { action: '招收活跃学生', icon: '👥', reward: '3%持续收益', desc: '学生挖矿收益的永久分成' },
  { action: '举办Workshop', icon: '🎪', reward: '50-200 LAC', desc: '按参与人数和质量计算' },
  { action: '社区答疑', icon: '❓', reward: '10-30 LAC', desc: '回答被采纳获得奖励' },
];

const teachingLevels = [
  { level: '新手导师', icon: '🌱', students: '1-5人', efficiency: '100%', color: 'bg-green-400' },
  { level: '进阶导师', icon: '📖', students: '6-20人', efficiency: '110%', color: 'bg-blue-400' },
  { level: '专业导师', icon: '⚡', students: '21-50人', efficiency: '125%', color: 'bg-purple-400' },
  { level: '大师导师', icon: '👑', students: '51+人', efficiency: '150%', color: 'bg-gold' },
];

const mentorshipFlow = [
  { step: '1', title: '创建课程', desc: '制作高质量AI教程内容', icon: '📝' },
  { step: '2', title: '发布邀请', desc: '生成专属邀请链接分享', icon: '🔗' },
  { step: '3', title: '招收学生', desc: '学生通过邀请链接注册学习', icon: '👥' },
  { step: '4', title: '持续收益', desc: '获得学生学习和挖矿收益分成', icon: '💎' },
];

const faqData = [
  {
    question: '什么是教导挖矿？',
    answer: '教导挖矿是LAC独特的"教学即挖矿"机制。通过创建课程、教导他人、分享知识，导师不仅获得直接奖励，还能持续获得学生学习和挖矿收益的分成。'
  },
  {
    question: '如何成为合格的导师？',
    answer: '需要满足条件：1）完成导师认证考试；2）提交教学计划和课程大纲；3）有一定的AI知识基础；4）承诺持续更新课程内容和回答学生问题。'
  },
  {
    question: '师徒关系如何建立？',
    answer: '通过邀请链接建立师徒关系。学生点击导师的邀请链接注册并完成首次学习后，系统自动建立师徒绑定关系，导师开始获得该学生的收益分成。'
  },
  {
    question: '收益分成是永久的吗？',
    answer: '是的，师徒关系一旦建立就是永久的。只要学生在LAC平台上进行挖矿活动，导师都能获得3%的收益分成。这激励导师持续关注和帮助学生成长。'
  },
  {
    question: 'Workshop如何组织？',
    answer: 'Workshop可以是直播教学、在线讨论、实操指导等形式。平台提供直播工具和互动功能，导师可以预约时段举办。参与人数和互动质量决定奖励金额。'
  }
];

export default function TeachMiningPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-[120px] pb-20 bg-gradient-to-b from-white to-surface">
        <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(197,151,91,0.06)_0%,transparent_70%)]" />
        
        <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold-pale to-gold/[0.15] border-[3px] border-gold-light flex items-center justify-center text-6xl mx-auto mb-8 animate-float">
            📣
          </div>
          
          <h1 className="text-4xl lg:text-[56px] font-black leading-[1.1] text-navy mb-6">
            教导<span className="gold-text">挖矿</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed mb-4 font-medium">
            传授知识，培育下一代AI原住民，成为LAC导师开启教学收益
          </p>
          <p className="text-sm text-gray-400 italic mb-8">
            Teach to Earn, Knowledge Multiplies When Shared
          </p>
          
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-gold-pale rounded-full text-sm font-semibold text-gold mb-10">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            预估收益：100-500 LAC/天
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/teach" className="btn btn-primary btn-lg">
              📣 成为导师
            </Link>
            <Link href="/register" className="btn btn-secondary btn-lg">
              🎯 注册账户
            </Link>
          </div>
        </div>
      </section>

      {/* Teaching Behaviors Section */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            什么算教导行为？
          </h2>
          <p className="text-[17px] text-gray-500 text-center max-w-[600px] mx-auto mb-16">
            LAC奖励所有形式的知识传授和社区贡献，让分享变成持续收入。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                📚
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">创建教程/课程</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                制作AI教程上传到平台，获得创作奖励+学生学习时的持续分成收益。
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                👥
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">招收学生</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                通过邀请链接招收学生，获得学生挖矿收益的3%永久分成。学生越多收益越高。
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                🎪
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">举办线上Workshop</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                组织直播教学、实操指导、讨论会等，参与者越多、质量越高奖励越丰厚。
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                ❓
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">回答社区问题</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                在社区帮助其他用户解决AI相关问题，答案被采纳获得LAC奖励。
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                📝
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">编写AI指南</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                创作AI使用指南、最佳实践、技巧分享等内容，为社区贡献知识。
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-gold-pale/30 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-6 group-hover:bg-gold-pale transition-colors mx-auto">
                🏆
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">一对一指导</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                为学生提供个性化辅导和答疑服务，建立更深入的师生关系。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mentorship Flow */}
      <section className="py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            师徒关系建立流程
          </h2>
          <p className="text-[17px] text-gray-500 text-center max-w-[600px] mx-auto mb-16">
            简单四步，建立持续收益的师徒关系链。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mentorshipFlow.map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white border-2 border-gold-light flex items-center justify-center text-3xl mx-auto shadow-card">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-navy mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Income Flow Diagram */}
          <div className="max-w-[800px] mx-auto mt-16 p-8 bg-white rounded-2xl border border-[#E8EAF0] shadow-card">
            <h3 className="text-xl font-bold text-navy text-center mb-8">师徒收益链示例</h3>
            
            <div className="space-y-6">
              {/* Mentor */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-4 p-4 bg-gold-pale rounded-2xl">
                  <div className="w-12 h-12 bg-gold text-white rounded-xl flex items-center justify-center text-xl">👨‍🏫</div>
                  <div>
                    <div className="font-bold text-navy">导师 (你)</div>
                    <div className="text-sm text-gray-500">创建课程、招收学生</div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="text-center text-2xl text-gold">⬇️</div>

              {/* Students */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                    <div className="w-10 h-10 bg-blue-400 text-white rounded-lg flex items-center justify-center">👨‍🎓</div>
                    <div>
                      <div className="font-semibold text-navy text-sm">学生 {i}</div>
                      <div className="text-xs text-gray-500">每日挖矿 100 LAC</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Income */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  💰 导师每日收益：9 LAC (100×3×3%)
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gold-pale/50 rounded-xl">
              <p className="text-sm text-center text-gray-600">
                💡 学生越多、越活跃，导师收益越高。这是真正的被动收入！
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Teaching Levels */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            导师等级体系
          </h2>
          <p className="text-[17px] text-gray-500 text-center max-w-[600px] mx-auto mb-16">
            根据学生数量和教学质量提升导师等级，解锁更高的收益效率。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachingLevels.map((level) => (
              <div key={level.level} className="card p-6 text-center rounded-2xl group hover:shadow-card-hover hover:border-gold-light transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-4 group-hover:bg-gold-pale transition-colors mx-auto">
                  {level.icon}
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">{level.level}</h3>
                <div className="text-sm text-gray-500 mb-3">{level.students}</div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{backgroundColor: level.color.replace('bg-', '')}}>
                  收益效率 {level.efficiency}
                </div>
              </div>
            ))}
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
            详细的教导挖矿奖励机制，让你的知识创造持续价值。
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

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            常见问题
          </h2>
          <p className="text-[17px] text-gray-500 text-center mb-16">
            关于教导挖矿的详细解答，帮你快速上手导师之路。
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