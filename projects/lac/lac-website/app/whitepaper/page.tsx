'use client';

import Link from 'next/link';

const incubationProjects = [
  {
    icon: '🏫',
    title: 'AI教育公益',
    desc: '为偏远地区和欠发达社区提供免费AI教育课程，让每个人都有机会学习AI技术。',
    status: '筹备中',
    goal: '覆盖100所学校',
    allocation: '3%',
  },
  {
    icon: '🌱',
    title: 'AI创业加速器',
    desc: '为早期AI创业团队提供资金、技术和社区资源支持，帮助他们将创意变为现实。',
    status: '即将启动',
    goal: '支持50个创业项目',
    allocation: '4%',
  },
  {
    icon: '🔬',
    title: 'AI开源研究基金',
    desc: '资助AI领域的开源项目和学术研究，推动AI技术的普惠化和透明化。',
    status: '规划中',
    goal: '资助30个开源项目',
    allocation: '2%',
  },
  {
    icon: '♿',
    title: 'AI无障碍计划',
    desc: '利用AI技术帮助残障人士，开发无障碍工具、语音辅助和智能导航等解决方案。',
    status: '规划中',
    goal: '服务10万人',
    allocation: '1.5%',
  },
  {
    icon: '🌍',
    title: 'AI环保监测',
    desc: '运用AI技术进行环境监测、碳排放追踪和生态保护，为可持续发展贡献力量。',
    status: '规划中',
    goal: '监测100个区域',
    allocation: '1.5%',
  },
  {
    icon: '🤝',
    title: '社区互助基金',
    desc: '建立去中心化互助基金，社区成员可以申请资助用于AI学习、创业或紧急援助。',
    status: '筹备中',
    goal: '帮助1000人',
    allocation: '3%',
  },
];

const milestones = [
  { phase: 'Phase 1', time: '2026 Q1-Q2', title: '基础搭建', items: ['成立公益委员会', '制定项目评审标准', '首批教育公益试点'] },
  { phase: 'Phase 2', time: '2026 Q3-Q4', title: '创业启动', items: ['AI创业加速器上线', '首批创业项目入选', '开源基金首轮资助'] },
  { phase: 'Phase 3', time: '2027 Q1-Q2', title: '规模扩展', items: ['教育覆盖50所学校', '无障碍计划启动', '环保监测试点'] },
  { phase: 'Phase 4', time: '2027 Q3+', title: '生态成熟', items: ['社区自治基金运营', '创业项目反哺生态', '全球化公益网络'] },
];

export default function CharityIncubationPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-[120px] pb-20 bg-gradient-to-b from-white to-surface">
        <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(197,151,91,0.06)_0%,transparent_70%)]" />
        <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold-pale to-gold/[0.15] border-[3px] border-gold-light flex items-center justify-center text-6xl mx-auto mb-8 animate-float">
            💛
          </div>

          <h1 className="text-4xl lg:text-[56px] font-black leading-[1.1] text-navy mb-6">
            AI<span className="gold-text">公益</span>和创业
          </h1>

          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed mb-4 font-medium">
            让AI的力量惠及每一个人，用代币支持改变世界的创业项目
          </p>
          <p className="text-sm text-gray-400 italic mb-8">
            AI for Good · Incubate the Future
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-2 bg-gold-pale rounded-full text-sm font-semibold text-gold mb-10">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            代币总量的15%用于公益和创业
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/charity-join" className="btn btn-primary btn-lg">
              🤝 参与公益
            </Link>
            <Link href="/register" className="btn btn-secondary btn-lg">
              🎯 注册账户
            </Link>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            为什么要做AI公益？
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-[700px] mx-auto">
            AI正在改变世界，但并不是每个人都能平等地享受AI带来的红利。我们相信，技术应该服务于全人类。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-navy mb-3">数字鸿沟</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                全球仍有数十亿人无法接触AI技术。教育资源的不平等让差距持续扩大。
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-xl font-bold text-navy mb-3">创新需要土壤</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                优秀的AI创业项目往往缺少早期资金和社区支持。创业支持为创新提供生长的土壤。
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-navy mb-3">价值循环</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                公益和创业不是单向输出，创业成功的项目将反哺LAC生态，形成正循环。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            公益与创业项目
          </h2>
          <p className="text-center text-gray-500 mb-16">
            LAC代币总量的15%将用于以下方向
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incubationProjects.map((project) => (
              <div key={project.title} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-2xl">
                    {project.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy">{project.title}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      project.status === '即将启动' ? 'bg-green-50 text-green-600' :
                      project.status === '筹备中' ? 'bg-amber-50 text-amber-600' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{project.desc}</p>
                <div className="flex items-center justify-between text-xs border-t border-[#E8EAF0] pt-3">
                  <span className="text-gray-400">🎯 目标：{project.goal}</span>
                  <span className="font-bold text-gold">代币占比 {project.allocation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            运作机制
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-[700px] mx-auto">
            透明、去中心化、社区驱动
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '📝', title: '提案', desc: '任何社区成员都可以提交公益或创业项目提案' },
              { step: '02', icon: '🗳️', title: '投票', desc: '创世成员和代币持有者对提案进行投票评审' },
              { step: '03', icon: '💰', title: '拨款', desc: '通过审核的项目从公益基金池获得代币资助' },
              { step: '04', icon: '📊', title: '追踪', desc: '项目进展链上透明追踪，定期向社区汇报' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-xs font-bold text-gold mb-2">STEP {item.step}</div>
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-3xl mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-16">
            公益路线图
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m) => (
              <div key={m.phase} className="card p-6">
                <div className="text-xs font-bold text-gold mb-1">{m.phase}</div>
                <div className="text-sm text-gray-400 mb-3">{m.time}</div>
                <h3 className="text-lg font-bold text-navy mb-4">{m.title}</h3>
                <ul className="space-y-2">
                  {m.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
                      <span className="text-gold mt-0.5">●</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '15%', label: '代币用于公益' },
              { value: '15亿', label: 'LAC公益基金池' },
              { value: '6', label: '公益方向' },
              { value: '∞', label: '受益人数目标' },
            ].map((stat) => (
              <div key={stat.label} className="card p-6">
                <div className="text-3xl font-black gold-text mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-surface">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy mb-6">
            一起用AI改变世界
          </h2>
          <p className="text-[17px] text-gray-500 mb-10">
            无论你是开发者、教育者还是梦想家，都可以参与到LAC公益生态中来。
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/charity-join" className="btn btn-primary btn-lg">
              💛 加入我们
            </Link>
            <Link href="/ai-join" className="btn btn-secondary btn-lg">
              🤖 AI参与者入口
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
