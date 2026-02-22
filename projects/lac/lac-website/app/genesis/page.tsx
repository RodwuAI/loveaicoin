'use client';

import Link from 'next/link';
import { useState } from 'react';

const privileges = [
  {
    icon: '🏅',
    title: '创世徽章',
    description: '永久专属NFT徽章，链上可验证身份',
  },
  {
    icon: '⛏️',
    title: '挖矿加成',
    description: '所有挖矿行为获得1.5x倍率（永久）',
  },
  {
    icon: '🎁',
    title: '创世空投',
    description: 'TGE时获得创世专属空投（具体数量待公布）',
  },
  {
    icon: '🗳️',
    title: '治理优先权',
    description: 'DAO治理中拥有更高投票权重',
  },
  {
    icon: '📣',
    title: '内测资格',
    description: '优先体验所有新功能',
  },
  {
    icon: '👥',
    title: '专属社群',
    description: '加入创世成员私密群，与核心团队直接沟通',
  },
];

const steps = [
  {
    step: 1,
    title: '注册LAC平台账号',
    link: '/register',
    linkText: '前往注册',
  },
  {
    step: 2,
    title: '完成首次签到',
    link: '/checkin',
    linkText: '立即签到',
  },
  {
    step: 3,
    title: '连接Solana钱包',
    link: '/profile',
    linkText: '连接钱包',
  },
];

const faqs = [
  {
    question: '创世成员名额有限吗？',
    answer: '是的，仅限前10,000名用户。名额满了就无法再获得创世成员身份。',
  },
  {
    question: '创世成员权益是永久的吗？',
    answer: '是，一旦获得创世成员身份，所有特权都是永久有效的，包括挖矿加成和治理权重。',
  },
  {
    question: '我已经注册了，怎么确认自己是创世成员？',
    answer: '在个人中心页面可以查看你的创世成员状态。如果显示"创世徽章"，说明你已经是创世成员。',
  },
  {
    question: '创世空投什么时候发放？',
    answer: 'TGE（代币生成事件）后7天内，空投会通过智能合约自动分发到你的钱包地址。',
  },
];

export default function GenesisPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // 静态数据展示
  const currentMembers = 1273;
  const totalMembers = 10000;
  const progressPercentage = (currentMembers / totalMembers) * 100;

  return (
    <main className="page-enter pt-[72px]">
      {/* ========== HERO ========== */}
      <section className="relative min-h-[60vh] flex items-center py-20 overflow-hidden bg-gradient-to-b from-white to-surface">
        {/* Background decorations */}
        <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(197,151,91,0.06)_0%,transparent_70%)]" />
        <div className="absolute -bottom-[100px] -left-[100px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(27,45,107,0.04)_0%,transparent_70%)]" />

        <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-pale rounded-full text-xs font-semibold text-gold mb-7">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            Genesis Member Program · 创世阶段
          </div>

          <h1 className="text-4xl lg:text-[56px] font-black leading-[1.1] text-navy mb-6 tracking-tight">
            前一万席，只属于先行者
          </h1>

          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed mb-3 font-medium">The First 10,000. The Only Ones.</p>
          <p className="text-base lg:text-lg text-gray-500 leading-relaxed mb-10 max-w-[640px] mx-auto">
            永久1.5倍挖矿加成，专属NFT徽章，空投优先权——仅限前10,000人
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register" className="btn btn-primary btn-lg animate-pulse-glow">
              🔒 立即锁定
            </Link>
            <Link href="/whitepaper" className="btn btn-secondary btn-lg">
              📄 了解更多
            </Link>
          </div>
        </div>
      </section>

      {/* ========== 什么是创世成员 ========== */}
      <section className="py-20 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-label justify-center">Genesis Member</span>
            <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-4">什么是创世成员？</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gold-pale flex items-center justify-center text-2xl mb-5 mx-auto">
                🌟
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">前10,000名用户</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                LAC生态上线前注册的前10,000名用户，拥有独一无二的创世身份
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gold-pale flex items-center justify-center text-2xl mb-5 mx-auto">
                👑
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">开国元勋</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                创世成员是LAC社区的"开国元勋"，见证并参与生态的从零到一
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gold-pale flex items-center justify-center text-2xl mb-5 mx-auto">
                🛡️
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">永久特权</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                拥有永久性特殊标识和权益，享受全生态周期的专属待遇
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 创世成员特权 ========== */}
      <section className="py-20 lg:py-24 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-label justify-center">Exclusive Privileges</span>
            <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-4">创世成员特权</h2>
            <p className="text-[17px] text-gray-500 max-w-[600px] mx-auto leading-relaxed">
              6大专属特权，让你在LAC生态中享受与众不同的体验
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {privileges.map((privilege, index) => (
              <div key={index} className="card p-8 relative overflow-hidden group">
                {/* 金色渐变边框 */}
                <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-br from-gold via-gold-light to-gold opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-white rounded-3xl h-full flex flex-col p-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-pale to-gold/10 flex items-center justify-center text-2xl mb-5 group-hover:bg-gradient-to-br group-hover:from-gold/10 group-hover:to-gold-light/20 transition-all">
                    {privilege.icon}
                  </div>
                  <h3 className="text-lg font-bold text-navy mb-3">{privilege.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{privilege.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 如何加入 ========== */}
      <section className="py-20 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-label justify-center">How to Join</span>
            <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-4">如何加入创世成员？</h2>
            <p className="text-[17px] text-gray-500 max-w-[600px] mx-auto leading-relaxed">
              只需3个简单步骤，即可获得创世成员身份
            </p>
          </div>

          <div className="max-w-[800px] mx-auto">
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-6 p-6 card">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-navy mb-1">Step {step.step}: {step.title}</h3>
                    <p className="text-sm text-gray-500">完成此步骤后，系统会自动记录你的创世成员进度</p>
                  </div>
                  <Link href={step.link} className="btn btn-primary btn-sm">
                    {step.linkText}
                  </Link>
                </div>
              ))}
            </div>

            <div className="text-center mt-8 p-6 bg-gold-pale rounded-2xl">
              <p className="text-sm text-navy font-medium">
                完成以上3步即自动获得创世成员资格，无需额外申请！
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 进度条 ========== */}
      <section className="py-20 lg:py-24 bg-surface">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <div className="card p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />
            
            <h2 className="text-2xl lg:text-3xl font-extrabold text-navy mb-6">创世成员招募进度</h2>
            
            <div className="text-4xl lg:text-5xl font-black mb-4">
              <span className="gold-text">{currentMembers.toLocaleString()}</span>
              <span className="text-gray-300"> / {totalMembers.toLocaleString()}</span>
            </div>
            
            <p className="text-gray-500 mb-8">已有 {currentMembers.toLocaleString()} 人加入创世成员行列</p>
            
            {/* 进度条 */}
            <div className="relative mb-6">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-gold to-gold-light transition-all duration-1000"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <span className="text-xs font-semibold text-white mix-blend-difference">
                  {progressPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              仅剩 <strong className="text-gold">{(totalMembers - currentMembers).toLocaleString()}</strong> 个名额
            </div>
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className="py-20 lg:py-24">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-label justify-center">FAQ</span>
            <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-4">常见问题</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-surface transition-colors"
                >
                  <h3 className="text-lg font-semibold text-navy pr-4">{faq.question}</h3>
                  <div className={`transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-20 lg:py-24 bg-surface">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <div className="card p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />
            
            <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-4">
              准备好成为创世成员了吗？
            </h2>
            <p className="text-[17px] text-gray-500 max-w-[600px] mx-auto leading-relaxed mb-8">
              加入前10,000名创世成员，享受LAC生态的专属特权和永久收益
            </p>
            
            <div className="flex items-center justify-center gap-4 flex-wrap mb-6">
              <Link href="/register" className="btn btn-primary btn-lg animate-pulse-glow">
                🚀 立即加入创世成员
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg">
                🔑 我有账号，直接登录
              </Link>
            </div>
            
            <p className="text-sm text-gray-400">
              已有账号？<Link href="/login" className="text-gold font-medium underline">直接登录</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}