import Link from 'next/link';

const startupProjects = [
  {
    id: 'ai-book-1-10',
    title: '《1+10：AI时代的一人公司实战》书籍',
    type: '知识产品/书籍销售',
    status: '热销中',
    price: '¥99',
    description: '一本关于AI时代如何用一个人+10个AI Agent搭建完整公司的实战指南，215页完整内容，理论与实战并重。',
    goal: '让更多人学会用AI创业',
    icon: '📚',
    gradient: 'from-blue-50 to-indigo-50',
    stats: [
      { label: '页数', value: '215页' },
      { label: '价格', value: '¥99' },
      { label: '反馈', value: '4.9/5' },
    ]
  },
  {
    id: 'one-person-company',
    title: '一人十机（One-Person Company）企业服务',
    type: '企业战略转型服务',
    status: '接受申请',
    price: '面议',
    description: '一个人+十个AI Agent，打造完整公司运营体系。帮助企业AI战略转型，赋能个人创业者用AI实现降本增效。',
    goal: '赋能中小企业和个人创业者',
    icon: '🤖',
    gradient: 'from-green-50 to-emerald-50',
    stats: [
      { label: '服务类型', value: '咨询+实施' },
      { label: '周期', value: '3-6个月' },
      { label: '成功率', value: '95%+' },
    ]
  },
  {
    id: 'ai-golf-caddie',
    title: 'AI高尔夫机器球童',
    type: 'AI硬件+服务项目',
    status: '寻求合作',
    price: '投资合作',
    description: 'AI驱动的智能高尔夫球童机器人，结合计算机视觉和运动分析，为高尔夫球场提供专业的智能服务体验。',
    goal: '用AI改变传统高尔夫行业',
    icon: '⛳',
    gradient: 'from-amber-50 to-orange-50',
    stats: [
      { label: '技术栈', value: 'AI+硬件' },
      { label: '市场', value: '高尔夫球场' },
      { label: '阶段', value: '原型完成' },
    ]
  }
];

const participationTypes = [
  {
    icon: '💰',
    title: '投资合作',
    desc: '为有潜力的AI创业项目提供资金支持',
  },
  {
    icon: '🤝',
    title: '技术合作',
    desc: '与项目团队进行技术交流和协作开发',
  },
  {
    icon: '🎯',
    title: '资源对接',
    desc: '提供市场资源、用户渠道等商业支持',
  },
  {
    icon: '📈',
    title: '推广分享',
    desc: '分享项目获得LAC代币奖励',
  }
];

export default function StartupPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pb-24 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold-pale to-gold/[0.15] border-[3px] border-gold-light flex items-center justify-center text-6xl mx-auto mb-8 animate-float">
            🚀
          </div>

          <h1 className="text-4xl lg:text-[56px] font-black leading-[1.1] text-navy mb-6">
            AI<span className="gold-text">创业</span>项目
          </h1>

          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed mb-4 font-medium">
            LAC孵化的实际创业项目，用AI技术创造真实价值
          </p>
          <p className="text-sm text-gray-400 italic mb-8">
            Real Projects · Real Value · AI Powered
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-2 bg-gold-pale rounded-full text-sm font-semibold text-gold mb-10">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            3个活跃项目正在运行
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="#projects" className="btn btn-primary btn-lg">
              🔍 浏览项目
            </Link>
            <Link href="/whitepaper" className="btn btn-secondary btn-lg">
              📄 了解LAC公益
            </Link>
          </div>
        </div>
      </section>

      {/* Why Startup Section */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            为什么支持AI创业？
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-[700px] mx-auto">
            AI技术需要真实的应用场景才能发挥价值。我们不只是理论，更要实践。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-xl font-bold text-navy mb-3">理论到实践</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                将AI学习成果转化为真实的商业项目，让知识产生实际价值。
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">🔬</div>
              <h3 className="text-xl font-bold text-navy mb-3">技术验证</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                通过实际项目验证AI技术的商业可行性和应用价值。
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-navy mb-3">生态反哺</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                成功的创业项目将为LAC生态提供资源，形成正向循环。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            创业项目展示
          </h2>
          <p className="text-center text-gray-500 mb-16">
            每个项目都有清晰的商业模式和参与方式
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {startupProjects.map((project) => (
              <div key={project.id} className="group">
                <div className={`card p-8 h-full hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${project.gradient} relative overflow-hidden`}>
                  {/* Background decoration */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 opacity-10 text-6xl flex items-center justify-center">
                    {project.icon}
                  </div>

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/80 flex items-center justify-center text-3xl border border-white/20">
                        {project.icon}
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          project.status === '热销中' ? 'bg-green-100 text-green-700' :
                          project.status === '接受申请' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-navy mb-2 leading-tight">
                      {project.title}
                    </h3>
                    
                    <div className="text-xs font-semibold text-gold mb-3 uppercase tracking-wider">
                      {project.type}
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-t border-white/40">
                      {project.stats.map((stat, i) => (
                        <div key={i} className="text-center">
                          <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                          <div className="text-sm font-bold text-navy">{stat.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Goal */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                      <span>🎯</span>
                      <span>{project.goal}</span>
                    </div>

                    {/* CTA */}
                    <Link 
                      href={`/startup/${project.id}`} 
                      className="btn btn-primary w-full group-hover:scale-105 transition-transform duration-300"
                    >
                      了解详情 →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Participation Types */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-4">
            参与方式
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-[700px] mx-auto">
            多种方式参与AI创业项目，获得成长和收益
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {participationTypes.map((type) => (
              <div key={type.title} className="card p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-3xl mx-auto mb-4">
                  {type.icon}
                </div>
                <h3 className="text-lg font-bold text-navy mb-3">{type.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy text-center mb-16">
            参与流程
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '🔍', title: '浏览项目', desc: '查看项目详情，了解商业模式和参与方式' },
              { step: '02', icon: '✋', title: '表达兴趣', desc: '点击"我要参与"按钮，选择合适的参与方式' },
              { step: '03', icon: '🤝', title: '对接合作', desc: '项目方会联系您，讨论具体的合作细节' },
              { step: '04', icon: '🚀', title: '开始协作', desc: '正式开始合作，共同推进项目发展' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-xs font-bold text-gold mb-2">STEP {item.step}</div>
                <div className="w-16 h-16 rounded-full bg-white border border-[#E8EAF0] flex items-center justify-center text-3xl mx-auto mb-4 shadow-card">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
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
              { value: '3', label: '活跃项目' },
              { value: '100+', label: '参与用户' },
              { value: '500万+', label: '项目总价值' },
              { value: '95%+', label: '满意度' },
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
            加入AI创业生态
          </h2>
          <p className="text-[17px] text-gray-500 mb-10">
            无论你是投资者、技术专家还是有资源的合作伙伴，都欢迎加入我们的创业生态。
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register" className="btn btn-primary btn-lg">
              🚀 立即参与
            </Link>
            <Link href="/community" className="btn btn-secondary btn-lg">
              💬 加入社区
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}