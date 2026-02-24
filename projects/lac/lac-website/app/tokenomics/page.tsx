import Link from 'next/link';

const keyStats = [
  { label: '总供应量', value: '100亿', sub: 'Total Supply', icon: '💰' },
  { label: '初始价格', value: '待TGE公布', sub: 'Coming Soon', icon: '💲' },
  { label: '完全稀释估值', value: '$500万', sub: 'FDV*', icon: '📊' },
];

const allocations = [
  { label: '挖矿奖励', pct: 45, color: '#1B2D6B', desc: '三维挖矿池，激励学习、教导、创造' },
  { label: '公益创业', pct: 15, color: '#C5975B', desc: '支持AI教育公益项目和早期创业者' },
  { label: '团队', pct: 15, color: '#D4B88C', desc: '核心团队激励，4年线性释放' },
  { label: '投资人', pct: 10, color: '#93C5FD', desc: '早期支持者和战略投资人' },
  { label: '金库', pct: 15, color: '#A78BFA', desc: '社区治理和应急储备' },
];

const vestingYears = [
  { year: 'Y1', factor: '1.00x', pct: '29.8%' },
  { year: 'Y2', factor: '0.65x', pct: '19.4%' },
  { year: 'Y3', factor: '0.42x', pct: '12.6%' },
  { year: 'Y4', factor: '0.27x', pct: '8.2%' },
  { year: 'Y5', factor: '0.18x', pct: '5.3%' },
  { year: 'Y6', factor: '0.11x', pct: '3.5%' },
  { year: 'Y7', factor: '0.07x', pct: '2.2%' },
  { year: 'Y8', factor: '0.05x', pct: '1.4%' },
];

const miningDimensions = [
  {
    icon: '📚',
    title: 'Learn-to-Earn',
    subtitle: '学习挖矿',
    desc: '完成AI课程、通过知识测验、获得技能认证。知识就是你的算力，学得越深，挖得越多。',
    reward: '50-200 LAC/天',
  },
  {
    icon: '📣',
    title: 'Teach-to-Earn',
    subtitle: '教导挖矿',
    desc: '创建教程、解答问题、直播教学。教是最好的学，帮助他人就是最有价值的挖矿。',
    reward: '100-500 LAC/天',
  },
  {
    icon: '🎨',
    title: 'Create-to-Earn',
    subtitle: '创造挖矿',
    desc: '创作AI艺术、提示词、模板、工具，在创作者市场交易。创造力无上限，收益无上限。',
    reward: '无上限',
  },
];

// SVG Pie Chart component
function PieChart() {
  const total = allocations.reduce((sum, a) => sum + a.pct, 0);
  let cumulative = 0;

  const segments = allocations.map((a) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += a.pct;
    const endAngle = (cumulative / total) * 360;
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    return {
      ...a,
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return (
    <svg viewBox="0 0 100 100" className="w-full max-w-[280px] mx-auto">
      {segments.map((seg) => (
        <path key={seg.label} d={seg.path} fill={seg.color} className="hover:opacity-80 transition-opacity" />
      ))}
      <circle cx="50" cy="50" r="20" fill="white" />
      <text x="50" y="48" textAnchor="middle" className="text-[6px] font-bold fill-navy">LAC</text>
      <text x="50" y="56" textAnchor="middle" className="text-[4px] fill-gray-400">100亿</text>
    </svg>
  );
}

export default function TokenomicsPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-label justify-center">AI币经济模型</span>
          <h1 className="text-4xl lg:text-[56px] font-black text-navy leading-[1.1] mb-4 tracking-tight">AI币</h1>
          <p className="text-lg text-gray-500 max-w-[680px] mx-auto leading-relaxed mb-8">
            LAC代币基于Solana链发行，为教育生态提供高效、低成本的价值传递基础设施。
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/genesis" className="btn btn-primary btn-lg">🚀 加入社区</Link>
            <Link href="/whitepaper-doc" className="btn btn-secondary btn-lg">📄 阅读白皮书</Link>
            <Link href="/mining/learn" className="btn btn-secondary btn-lg">⛏️ 开始挖矿</Link>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {keyStats.map((stat) => (
              <div key={stat.label} className="card p-8 text-center relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-navy to-gold" />
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className="text-3xl lg:text-4xl font-extrabold text-navy mb-1 tracking-tight">{stat.value}</div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.sub}</div>
                {stat.sub === 'FDV*' && (
                  <div className="text-xs text-gray-400 mt-1 italic">*基于TGE预期估算</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Token Allocation */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-label justify-center">Allocation</span>
            <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-4">代币分配</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Pie Chart */}
            <div>
              <PieChart />
            </div>

            {/* Legend */}
            <div className="space-y-4">
              {allocations.map((a) => (
                <div key={a.label} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-[#E8EAF0]">
                  <div
                    className="w-4 h-4 rounded-md flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: a.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-navy">{a.label}</span>
                      <span className="text-sm font-extrabold text-navy">{a.pct}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vesting Schedule */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-label justify-center">Vesting</span>
            <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-4">释放时间表</h2>
            <p className="text-[17px] text-gray-500 max-w-[600px] mx-auto leading-relaxed">
              年度衰减系数 <strong className="text-navy">0.65x</strong>，8年完成全部释放
            </p>
          </div>

          <div className="max-w-[800px] mx-auto">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {vestingYears.map((v) => (
                <div key={v.year} className="card p-4 text-center">
                  <div className="text-xs font-semibold text-gold mb-2">{v.year}</div>
                  <div className="text-sm font-bold text-navy mb-1">{v.pct}</div>
                  <div className="text-[11px] text-gray-400">{v.factor}</div>
                </div>
              ))}
            </div>

            {/* Visual bar */}
            <div className="mt-8 flex rounded-full overflow-hidden h-4 bg-[#E8EAF0]">
              {vestingYears.map((v, i) => {
                const pct = parseFloat(v.pct);
                const opacity = 1 - i * 0.1;
                return (
                  <div
                    key={v.year}
                    className="h-full"
                    style={{
                      width: `${pct * 1.2}%`,
                      backgroundColor: `rgba(27,45,107,${opacity})`,
                    }}
                    title={`${v.year}: ${v.pct}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Year 1</span>
              <span>Year 8</span>
            </div>
          </div>
        </div>
      </section>

      {/* Four Mining Dimensions */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-label justify-center">3D Mining</span>
            <h2 className="text-3xl lg:text-[40px] font-extrabold text-navy leading-tight mb-4">三维挖矿</h2>
            <p className="text-[17px] text-gray-500 max-w-[600px] mx-auto leading-relaxed">
              LAC的核心创新——将知识生态的每个环节都转化为挖矿行为。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {miningDimensions.map((dim) => (
              <div key={dim.title} className="card p-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold to-gold-light" />
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-gold-pale transition-colors">
                    {dim.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gold uppercase tracking-wider mb-1">{dim.title}</div>
                    <div className="text-lg font-bold text-navy mb-2">{dim.subtitle}</div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{dim.desc}</p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gold/[0.08] to-gold-light/[0.04] rounded-full text-xs font-semibold text-gold">
                      ⛏️ {dim.reward}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 lg:py-20 text-center">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-navy mb-4">准备好开始挖矿了吗？</h2>
          <p className="text-gray-500 mb-8 max-w-[500px] mx-auto">
            加入LAC社区，成为知识挖矿的先驱者。
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/genesis" className="btn btn-primary btn-lg">🚀 加入创世AI俱乐部</Link>
            <Link href="/checkin" className="btn btn-secondary btn-lg">✅ 每日签到</Link>
          </div>

          {/* Risk Warning */}
          <div className="max-w-[640px] mx-auto mt-8 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div className="text-sm">
                <strong>风险提示：</strong>加密货币投资存在高风险。LAC代币不构成投资建议，请在充分了解风险后做出独立判断。
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
