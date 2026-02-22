import Link from 'next/link';

const phases = [
  {
    phase: 'Phase 1',
    period: '2026 Q1',
    title: '基础搭建',
    status: 'active' as const,
    items: [
      { text: '积分系统上线', done: true },
      { text: '社区搭建（Telegram/Discord）', done: true },
      { text: '白皮书 V2.0 发布', done: true },
      { text: '官网上线', done: false },
      { text: '品牌视觉体系建立', done: true },
    ],
  },
  {
    phase: 'Phase 2',
    period: '2026 Q2',
    title: 'TGE与产品发布',
    status: 'upcoming' as const,
    items: [
      { text: 'TGE（代币生成事件）', done: false },
      { text: 'DEX上线交易', done: false },
      { text: '学习中心 Beta 上线', done: false },
      { text: '三维挖矿系统启动', done: false },
      { text: '首批创作者入驻', done: false },
    ],
  },
  {
    phase: 'Phase 3',
    period: '2026 Q3-Q4',
    title: '生态扩展',
    status: 'future' as const,
    items: [
      { text: 'AI工具箱上线', done: false },
      { text: '创作者市场开放', done: false },
      { text: '跨链桥接支持', done: false },
      { text: '移动端App发布', done: false },
      { text: '合作伙伴生态建设', done: false },
    ],
  },
  {
    phase: 'Phase 4',
    period: '2027',
    title: 'DAO治理与全球化',
    status: 'future' as const,
    items: [
      { text: 'DAO治理体系上线', done: false },
      { text: '社区投票机制', done: false },
      { text: '全球社区扩展', done: false },
      { text: '多语言支持', done: false },
      { text: '企业级API开放', done: false },
    ],
  },
];

export default function RoadmapPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-label justify-center">Roadmap</span>
          <h1 className="text-4xl lg:text-[56px] font-black text-navy leading-[1.1] mb-4 tracking-tight">发展路线图</h1>
          <p className="text-lg text-gray-500 max-w-[680px] mx-auto leading-relaxed">
            从构想到现实——LAC的每一步都在稳步推进，向着去中心化AI教育的未来前进。
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 lg:left-8 top-0 bottom-0 w-0.5 bg-[#E8EAF0]" />

            <div className="space-y-12">
              {phases.map((phase) => (
                <div key={phase.phase} className="relative pl-16 lg:pl-20">
                  {/* Dot */}
                  <div className={`absolute left-4 lg:left-6 top-2 w-5 h-5 rounded-full border-2 ${
                    phase.status === 'active'
                      ? 'bg-gold border-gold animate-pulse-glow'
                      : phase.status === 'upcoming'
                        ? 'bg-white border-gold-light'
                        : 'bg-white border-[#E8EAF0]'
                  }`} />

                  <div className={`card p-6 sm:p-8 ${
                    phase.status === 'active' ? 'border-gold/30 shadow-card-hover ring-1 ring-gold/10' : ''
                  }`}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        phase.status === 'active'
                          ? 'bg-gold/10 text-gold'
                          : phase.status === 'upcoming'
                            ? 'bg-navy/5 text-navy'
                            : 'bg-gray-100 text-gray-500'
                      }`}>
                        {phase.phase}
                      </span>
                      <span className="text-sm text-gray-400 font-medium">{phase.period}</span>
                      {phase.status === 'active' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-500">
                          ✅ 进行中
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-navy mb-4">{phase.title}</h3>

                    {/* Items */}
                    <ul className="space-y-3">
                      {phase.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          {phase.status === 'active' ? (
                            <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                              item.done
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gold-pale text-gold'
                            }`}>
                              {item.done ? '✓' : '○'}
                            </span>
                          ) : (
                            <span className="mt-0.5 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs text-gray-400">
                              ○
                            </span>
                          )}
                          <span className={`text-sm ${
                            phase.status === 'active' && item.done
                              ? 'text-navy font-medium'
                              : 'text-gray-500'
                          }`}>
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="py-16 lg:py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-6 text-center">
              <div className="text-3xl font-extrabold text-navy mb-1">4</div>
              <div className="text-sm text-gray-500">发展阶段</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-extrabold text-gold mb-1">Q1</div>
              <div className="text-sm text-gray-500">当前阶段</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-extrabold text-navy mb-1">20+</div>
              <div className="text-sm text-gray-500">计划里程碑</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-extrabold text-navy mb-1">2027</div>
              <div className="text-sm text-gray-500">完全去中心化</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 lg:py-20 text-center">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-navy mb-4">与我们一起构建未来</h2>
          <p className="text-gray-500 mb-8 max-w-[500px] mx-auto">
            加入LAC社区，参与到每一个里程碑的建设中来。
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/community" className="btn btn-primary btn-lg">🚀 加入社区</Link>
            <Link href="/tokenomics" className="btn btn-secondary btn-lg">💰 代币经济</Link>
          </div>
        </div>
      </section>
    </>
  );
}
