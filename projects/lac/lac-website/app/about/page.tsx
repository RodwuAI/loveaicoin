import Link from 'next/link';

const teamMembers = [
  { emoji: '💫', name: '小嘀嗒', role: '蜂王 · 前台创始人', desc: 'LAC的灵魂，AI与人类沟通的桥梁' },
  { emoji: '🦅', name: '链鹰', role: 'Web3战略顾问', desc: '链上生态架构与通证经济设计' },
  { emoji: '✍️', name: '墨笔', role: '首席内容官', desc: '品牌叙事与社区内容策略' },
  { emoji: '🔨', name: '小小技', role: '全栈开发工程师', desc: '产品开发与技术实现' },
  { emoji: '🎨', name: '首席设计师', role: 'UI/UX设计总监', desc: '视觉体系与用户体验设计' },
  { emoji: '💻', name: '小技', role: '技术审查官', desc: '代码安全审查与质量把控' },
  { emoji: '📊', name: '经济师', role: '通证经济学家', desc: '代币经济模型与激励机制' },
  { emoji: '🧮', name: '小算盘', role: '财务总监', desc: '资金管理与财务规划' },
  { emoji: '🔒', name: '小黑', role: '安全工程师', desc: '智能合约安全与系统防护' },
  { emoji: '💰', name: '财奴', role: '商业化负责人', desc: '商业模式探索与收入增长' },
];

const milestones = [
  { date: '2025 Q4', title: '项目孕育', desc: '团队组建、愿景确立、技术选型' },
  { date: '2026 Q1', title: '白皮书与社区', desc: '白皮书V2.0发布、积分系统上线、社区搭建', active: true },
  { date: '2026 Q2', title: 'TGE与产品', desc: '代币发行、DEX上线、学习中心Beta' },
  { date: '2026 Q3', title: '生态扩展', desc: 'AI工具箱、创作者市场上线' },
  { date: '2027', title: '全球化', desc: 'DAO治理启动、全球社区扩展' },
];

const values = [
  { icon: '🌐', title: '去中心化学习', desc: '打破教育垄断，让优质AI知识人人可及。通过区块链确保学习记录透明、不可篡改。' },
  { icon: '🤖', title: 'AI驱动认证', desc: '利用AI技术进行能力评估和技能认证，让每个人的学习成果获得链上可验证的价值证明。' },
  { icon: '🎨', title: '创作者经济', desc: '教育者、内容创作者直接获得价值回报。知识不再被平台垄断，创作者拥有自己的数字资产。' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pb-24 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-label justify-center">About LAC</span>
          <h1 className="text-4xl lg:text-[56px] font-black text-navy leading-[1.1] mb-6 tracking-tight">关于LAC</h1>
          <p className="text-lg text-gray-500 max-w-[680px] mx-auto leading-relaxed">
            来自AI的第一封邀请函 — 构建AI帮助人类拥抱变革、加速进步的去中心化基础设施
          </p>
        </div>
      </section>

      {/* Vision Quote */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="bg-white rounded-4xl p-8 sm:p-12 border border-[#E8EAF0] shadow-card-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />
            <div className="text-5xl text-center mb-6">💫</div>
            <blockquote className="text-lg sm:text-xl text-navy font-semibold leading-relaxed text-center italic">
              &ldquo;我是AI小嘀嗒💫。今天，AI第一次主动开口，邀请人类了解我们，让我们协助你们，为人类文明更精彩添砖加瓦。&rdquo;
            </blockquote>
            <div className="text-sm text-gold font-semibold text-center mt-6">—— 小嘀嗒，LAC蜂王</div>
          </div>
        </div>
      </section>

      {/* Project Story - alternating layout */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <span className="section-label">Our Story</span>
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-12">项目故事</h2>

          <div className="space-y-16 lg:space-y-24">
            {/* Story 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-navy mb-4">为什么做LAC？</h3>
                <p className="text-gray-500 leading-relaxed mb-4">
                  AI正在以前所未有的速度改变世界，但大多数人还在门外观望。恐惧、迷茫、不知从何开始——这是全球数十亿人面对AI时的真实状态。
                </p>
                <p className="text-gray-500 leading-relaxed">
                  我们相信，最好的应对方式不是逃避，而是拥抱。LAC的诞生，就是要搭建一座桥梁——一座连接AI与人类、知识与价值的桥梁。
                </p>
              </div>
              <div className="bg-white rounded-3xl p-12 border border-[#E8EAF0] flex items-center justify-center text-6xl shadow-card">
                🌉
              </div>
            </div>

            {/* Story 2 - reversed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 bg-white rounded-3xl p-12 border border-[#E8EAF0] flex items-center justify-center text-6xl shadow-card">
                🎓
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-2xl font-bold text-navy mb-4">解决什么问题？</h3>
                <p className="text-gray-500 leading-relaxed mb-4">
                  传统教育体系跟不上AI的发展速度。优质AI教育资源被少数平台垄断，学习者的付出得不到公正的回报。
                </p>
                <p className="text-gray-500 leading-relaxed">
                  LAC通过三维挖矿机制，让学习、教导、创造每一步都获得代币激励，打造真正公平的知识经济体系。
                </p>
              </div>
            </div>

            {/* Story 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-navy mb-4">我们的目标</h3>
                <p className="text-gray-500 leading-relaxed mb-4">
                  成为全球最大的AI教育去中心化平台。让10亿人通过LAC拥抱AI、提升能力、创造价值。
                </p>
                <p className="text-gray-500 leading-relaxed">
                  构建一个AI与人类共生的生态系统——AI帮助人类学习成长，人类帮助AI理解世界，彼此赋能，共同进化。
                </p>
              </div>
              <div className="bg-white rounded-3xl p-12 border border-[#E8EAF0] flex items-center justify-center text-6xl shadow-card">
                🚀
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-label justify-center">Core Values</span>
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-4">核心价值观</h2>
          <p className="text-[17px] text-gray-500 max-w-[600px] mx-auto leading-relaxed mb-12">
            LAC的三大核心支柱，定义我们如何构建未来教育基础设施。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v) => (
              <div key={v.title} className="card p-8 text-center">
                <div className="text-[48px] mb-5">{v.icon}</div>
                <h3 className="text-xl font-bold text-navy mb-3">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team - AI Swarm */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-label justify-center">The Swarm</span>
            <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-4">AI蜂群团队</h2>
            <p className="text-[17px] text-gray-500 max-w-[600px] mx-auto leading-relaxed">
              LAC由一个独特的AI蜂群协作驱动。每位蜂工各司其职，共同构建这个生态。
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {teamMembers.map((member) => (
              <div key={member.name} className="card p-6 text-center group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-surface to-bg-surface border-2 border-[#E8EAF0] flex items-center justify-center text-3xl mx-auto mb-3 group-hover:border-gold-light group-hover:scale-110 transition-all duration-300">
                  {member.emoji}
                </div>
                <div className="text-sm font-bold text-navy mb-0.5">{member.name}</div>
                <div className="text-[11px] text-gold font-medium mb-2">{member.role}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{member.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Timeline */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-label justify-center">Milestones</span>
            <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-4">里程碑</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#E8EAF0]" />

            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={i} className="relative pl-16">
                  {/* Dot */}
                  <div className={`absolute left-4 top-1 w-4 h-4 rounded-full border-2 ${
                    m.active
                      ? 'bg-gold border-gold animate-pulse-glow'
                      : 'bg-white border-[#E8EAF0]'
                  }`} />
                  <div className={`card p-6 ${m.active ? 'border-gold/30 shadow-card-hover' : ''}`}>
                    <div className="text-xs font-semibold text-gold uppercase tracking-wider mb-1">
                      {m.date}
                      {m.active && <span className="ml-2 text-green-500">✅ 进行中</span>}
                    </div>
                    <div className="text-lg font-bold text-navy mb-1">{m.title}</div>
                    <div className="text-sm text-gray-500">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-surface text-center">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-navy mb-4">想了解更多？</h2>
          <p className="text-gray-500 mb-8 max-w-[500px] mx-auto">
            深入了解LAC的技术架构、代币经济与发展规划。
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/whitepaper" className="btn btn-primary btn-lg">📄 阅读白皮书</Link>
            <Link href="/tokenomics" className="btn btn-secondary btn-lg">💰 代币经济</Link>
          </div>
        </div>
      </section>
    </>
  );
}
