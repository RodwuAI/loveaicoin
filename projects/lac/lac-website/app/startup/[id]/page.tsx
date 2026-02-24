import Link from 'next/link';
import { notFound } from 'next/navigation';

// Project data
const projects = {
  'ai-book-1-10': {
    id: 'ai-book-1-10',
    title: '《1+10：AI时代的一人公司实战》书籍',
    type: '知识产品/书籍销售',
    status: '热销中',
    price: '¥99',
    icon: '📚',
    gradient: 'from-blue-50 to-indigo-50',
    shortDesc: '一本关于AI时代如何用一个人+10个AI Agent搭建完整公司的实战指南',
    fullDesc: `这是一本专为AI时代创业者打造的实战指南。在这个AI快速发展的时代，传统的创业模式正在被颠覆。《1+10》这本书提供了一套完整的方法论，教你如何用一个人的精力，配合10个AI Agent，构建一家完整运转的现代化公司。

书中不仅有理论框架，更有大量实战案例。从公司架构设计、AI工具选择，到业务流程优化、团队管理策略，每一个环节都有详细的操作指南。215页的内容涵盖了创业者需要知道的所有核心要素。

无论你是准备创业的新手，还是想要用AI升级现有业务的企业主，这本书都能为你提供实用的指导和灵感。`,
    goal: '让更多人学会用AI创业',
    author: 'LAC创业孵化团队',
    features: [
      '215页完整内容，理论与实战并重',
      '10个AI Agent的详细配置指南',
      '30个真实创业案例分析',
      '完整的一人公司运营框架',
      '可操作的AI工具使用手册',
      'PDF电子版本，支持多设备阅读'
    ],
    testimonials: [
      { name: '张创业', role: 'AI创业者', text: '这本书完全改变了我对创业的认知，现在我的公司只有我一个人，但效率比以前10人团队还高。', rating: 5 },
      { name: '李技术', role: '程序员', text: '书中的AI Agent配置方案非常实用，照着做就能搭建出自己的自动化业务系统。', rating: 5 },
      { name: '王老板', role: '传统企业主', text: '用书中的方法改造了我的传统生意，现在人工成本降低了70%，利润反而提升了。', rating: 5 }
    ],
    participationWays: [
      { icon: '💰', title: '直接购买', desc: '¥99购买电子版，立即获得完整内容', action: '立即购买' },
      { icon: '📢', title: '推广分享', desc: '分享给朋友购买，获得LAC代币奖励', action: '获取推广链接' },
      { icon: '📝', title: '内容贡献', desc: '提供成功案例，有机会被收录到下一版', action: '提交案例' },
      { icon: '🤝', title: '合作推广', desc: '成为推广合作伙伴，获得更高分成比例', action: '申请合作' }
    ],
    stats: [
      { label: '销售量', value: '2,500+' },
      { label: '读者评分', value: '4.9/5' },
      { label: '推广奖励', value: '30% LAC' },
      { label: '更新版本', value: 'v2.1' }
    ]
  },
  
  'one-person-company': {
    id: 'one-person-company',
    title: '一人十机（One-Person Company）企业服务',
    type: '企业战略转型服务',
    status: '接受申请',
    price: '面议',
    icon: '🤖',
    gradient: 'from-green-50 to-emerald-50',
    shortDesc: '帮助传统企业进行AI战略转型，帮助创业者用AI搭建一人公司系统',
    fullDesc: `一人十机（One-Person Company）是LAC生态推出的创新企业服务项目。我们的理念是"用AI赋能每一个创业者"——用AI技术帮助传统企业实现数字化转型，同时助力个人创业者构建高效的一人公司运营体系。

我们的服务团队由资深的AI技术专家、企业战略顾问和数字化转型专家组成。无论你是想要升级现有业务的传统企业，还是希望用AI技术启动创业项目的个人，我们都能提供量身定制的解决方案。

我们不只是提供咨询建议，更会深度参与到项目实施中，确保每一个客户都能真正实现AI驱动的业务转型。从策略制定到系统搭建，从团队培训到持续优化，我们提供全流程的专业服务。`,
    goal: '赋能中小企业和个人创业者',
    serviceScope: '企业AI转型咨询 + 一人公司系统搭建',
    features: [
      'AI战略规划与路线图制定',
      '一人公司运营系统搭建',
      '业务流程自动化设计',
      'AI工具集成与优化',
      '团队AI技能培训',
      '持续优化与技术支持'
    ],
    caseStudies: [
      { company: '某传统制造企业', result: '人工成本降低60%，订单处理效率提升300%', industry: '制造业' },
      { company: '个人咨询师', result: '从月收入2万到月收入15万，工作时间减少一半', industry: '咨询服务' },
      { company: '某电商公司', result: '客服成本降低80%，客户满意度提升至98%', industry: '电商' }
    ],
    participationWays: [
      { icon: '📞', title: '免费咨询', desc: '30分钟免费诊断，了解转型可行性', action: '申请咨询' },
      { icon: '🎯', title: '转型需求', desc: '提交详细转型需求，获得专业建议', action: '提交需求' },
      { icon: '👥', title: '加入社区', desc: '加入企业转型交流群，分享经验', action: '加入群组' },
      { icon: '🤝', title: '合作伙伴', desc: '成为服务合作伙伴，共同开拓市场', action: '申请合作' }
    ],
    stats: [
      { label: '服务企业', value: '50+' },
      { label: '成功率', value: '95%+' },
      { label: '平均ROI', value: '300%' },
      { label: '服务周期', value: '3-6个月' }
    ]
  },

  'ai-golf-caddie': {
    id: 'ai-golf-caddie',
    title: 'AI高尔夫机器球童',
    type: 'AI硬件+服务项目',
    status: '寻求合作',
    price: '投资合作',
    icon: '⛳',
    gradient: 'from-amber-50 to-orange-50',
    shortDesc: 'AI驱动的智能高尔夫球童机器人，结合计算机视觉和运动分析',
    fullDesc: `AI高尔夫机器球童是一个结合了前沿AI技术和高尔夫运动的创新项目。我们开发的智能机器人不仅能够提供传统球童的基础服务，更能通过AI技术为球员提供专业的技术分析和建议。

这个项目融合了计算机视觉、运动分析、机器学习等多项AI技术。机器人能够实时分析球员的挥杆动作，提供精准的击球建议，记录比赛数据，甚至预测球的落点。同时，它还能自主导航球场，避开障碍物，确保安全高效的服务。

我们的目标不只是替代传统球童，而是要创造一种全新的高尔夫体验。通过AI技术，让每一位球员都能享受到专业级的技术指导，提升运动表现，增加运动乐趣。`,
    goal: '用AI改变传统高尔夫行业',
    techStack: 'AI + 机器人 + 计算机视觉 + 运动分析',
    features: [
      '自主导航和避障系统',
      '实时挥杆动作分析',
      '球路预测和建议系统',
      '比赛数据记录和分析',
      '语音交互和服务',
      '多球员同时服务能力'
    ],
    techSpecs: [
      { spec: 'AI芯片', value: '高通骁龙8Gen2' },
      { spec: '摄像头', value: '4K高精度摄像头×4' },
      { spec: '续航时间', value: '18洞标准场（约4小时）' },
      { spec: '导航精度', value: 'GPS+视觉双重定位，精度±0.5米' },
      { spec: '分析速度', value: '实时分析，延迟<100ms' },
      { spec: '防护等级', value: 'IP65防水防尘' }
    ],
    participationWays: [
      { icon: '💰', title: '投资合作', desc: '提供资金支持，共享项目收益', action: '投资咨询' },
      { icon: '🔧', title: '技术合作', desc: '提供技术支持或研发合作', action: '技术对接' },
      { icon: '🏌️', title: '球场合作', desc: '提供测试场地，成为首批试点球场', action: '申请试点' },
      { icon: '🛒', title: '预订设备', desc: '预订首批产品，享受早鸟价格', action: '预订产品' }
    ],
    stats: [
      { label: '原型完成', value: '100%' },
      { label: '测试场地', value: '3个' },
      { label: '准确率', value: '96%+' },
      { label: '预估价格', value: '50-80万' }
    ]
  }
};

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return [
    { id: 'ai-book-1-10' },
    { id: 'one-person-company' },
    { id: 'ai-golf-caddie' },
  ];
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const project = projects[id as keyof typeof projects] as any;

  if (!project) {
    notFound();
  }

  return (
    <>
      {/* Breadcrumb */}
      <section className="pt-32 pb-8 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-navy">首页</Link>
            <span>/</span>
            <Link href="/startup" className="hover:text-navy">创业项目</Link>
            <span>/</span>
            <span className="text-navy font-medium">{project.title}</span>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className={`py-16 lg:py-24 bg-gradient-to-br ${project.gradient}`}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-3xl bg-white/80 flex items-center justify-center text-4xl border border-white/20">
                  {project.icon}
                </div>
                <div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    project.status === '热销中' ? 'bg-green-100 text-green-700' :
                    project.status === '接受申请' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {project.status}
                  </span>
                  <div className="text-xs font-semibold text-gold mt-1 uppercase tracking-wider">
                    {project.type}
                  </div>
                </div>
              </div>

              <h1 className="text-3xl lg:text-[48px] font-black text-navy leading-[1.1] mb-6">
                {project.title}
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {project.shortDesc}
              </p>

              <div className="flex items-center gap-2 text-sm font-semibold text-gold mb-8">
                <span>🎯</span>
                <span>{project.goal}</span>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <button className="btn btn-primary btn-lg">
                  我要参与 🚀
                </button>
                <Link href="/startup" className="btn btn-secondary btn-lg">
                  返回项目列表
                </Link>
              </div>
            </div>

            <div className="lg:pl-12">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                {project.stats.map((stat: any, i: number) => (
                  <div key={i} className="card p-6 text-center bg-white/60 backdrop-blur-sm">
                    <div className="text-2xl font-black gold-text mb-1">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Description */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-extrabold text-navy mb-6">项目详情</h2>
              <div className="prose prose-lg max-w-none">
                {project.fullDesc.split('\n\n').map((paragraph: any, i: number) => (
                  <p key={i} className="text-gray-600 leading-relaxed mb-6">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <div className="card p-8">
                <h3 className="text-xl font-bold text-navy mb-4">项目特色</h3>
                <ul className="space-y-3">
                  {project.features.map((feature: any, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="text-gold mt-0.5 flex-shrink-0">●</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special sections for each project type */}
      {project.id === 'ai-book-1-10' && project.testimonials && (
        <section className="py-20 bg-surface">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-navy text-center mb-12">读者评价</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {project.testimonials.map((testimonial: any, i: number) => (
                <div key={i} className="card p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_: any, j: number) => (
                      <span key={j} className="text-gold">⭐</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="border-t border-[#E8EAF0] pt-3">
                    <div className="text-sm font-bold text-navy">{testimonial.name}</div>
                    <div className="text-xs text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {project.id === 'one-person-company' && project.caseStudies && (
        <section className="py-20 bg-surface">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-navy text-center mb-12">成功案例</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {project.caseStudies.map((case_study: any, i: number) => (
                <div key={i} className="card p-6">
                  <div className="text-xs font-semibold text-gold uppercase tracking-wider mb-2">
                    {case_study.industry}
                  </div>
                  <h3 className="text-lg font-bold text-navy mb-3">{case_study.company}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {case_study.result}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {project.id === 'ai-golf-caddie' && project.techSpecs && (
        <section className="py-20 bg-surface">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-navy text-center mb-12">技术规格</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.techSpecs.map((spec: any, i: number) => (
                <div key={i} className="card p-6 text-center">
                  <h3 className="text-sm font-bold text-navy mb-2">{spec.spec}</h3>
                  <p className="text-lg font-semibold gold-text">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Participation Ways */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-navy text-center mb-4">参与方式</h2>
          <p className="text-center text-gray-500 mb-12">选择最适合您的参与方式</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {project.participationWays.map((way: any, i: number) => (
              <div key={i} className="card p-6 text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:bg-gold/20 transition-colors">
                  {way.icon}
                </div>
                <h3 className="text-lg font-bold text-navy mb-3">{way.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{way.desc}</p>
                <button className="btn btn-secondary w-full group-hover:border-gold transition-colors">
                  {way.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-surface">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-navy mb-6">准备好参与了吗？</h2>
          <p className="text-[17px] text-gray-500 mb-10">
            无论您选择哪种参与方式，我们都期待与您携手推进这个项目。
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button className="btn btn-primary btn-lg">
              🚀 我要参与
            </button>
            <Link href="/community" className="btn btn-secondary btn-lg">
              💬 加入社区讨论
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}