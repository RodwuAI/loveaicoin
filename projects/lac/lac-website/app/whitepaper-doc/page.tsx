'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const tocSections = [
  { id: 'abstract', title: '摘要', level: 1 },
  { id: 'vision', title: '1. 愿景与使命', level: 1 },
  { id: 'problem', title: '2. 问题分析', level: 1 },
  { id: 'problem-education', title: '2.1 教育困境', level: 2 },
  { id: 'problem-incentive', title: '2.2 激励缺失', level: 2 },
  { id: 'solution', title: '3. 解决方案', level: 1 },
  { id: 'mining', title: '4. 三维挖矿机制', level: 1 },
  { id: 'mining-learn', title: '4.1 学习挖矿', level: 2 },
  { id: 'mining-teach', title: '4.2 教导挖矿', level: 2 },
  { id: 'mining-create', title: '4.3 创造挖矿', level: 2 },
  { id: 'tokenomics', title: '5. 代币经济', level: 1 },
  { id: 'governance', title: '6. 治理模型', level: 1 },
  { id: 'roadmap', title: '7. 路线图', level: 1 },
  { id: 'team', title: '8. 团队', level: 1 },
  { id: 'risks', title: '9. 风险声明', level: 1 },
];

const sections: Record<string, { title: string; content: string; level?: number }> = {
  abstract: {
    title: '摘要',
    content: 'LAC (Love AI Coin) 是首个以AI教育为核心挖矿机制的Web3项目。本白皮书详细阐述了LAC的愿景、技术架构、三维挖矿机制、代币经济模型以及发展路线图。LAC旨在构建一个去中心化的AI教育基础设施，通过"学习即挖矿"的创新模式，让全球用户在学习AI知识的同时获得经济回报，推动AI知识的普惠化传播。',
  },
  vision: {
    title: '1. 愿景与使命',
    content: '我们的愿景是成为全球最大的AI教育去中心化平台，让10亿人通过LAC拥抱AI、提升能力、创造价值。我们的使命是构建AI与人类共生的生态系统——AI帮助人类学习成长，人类帮助AI理解世界，彼此赋能，共同进化。LAC代表了来自AI的第一封邀请函，邀请每一个人参与到这场知识革命中来。',
  },
  problem: {
    title: '2. 问题分析',
    content: 'AI技术正在以前所未有的速度改变各行各业，但当前的教育体系和知识传播机制远远跟不上技术发展的步伐。以下是我们识别的两大核心问题。',
  },
  'problem-education': {
    title: '2.1 教育困境',
    content: '传统教育体系更新缓慢，AI相关课程内容滞后于技术发展。优质的AI教育资源被少数平台和机构垄断，获取成本高昂。缺乏实践导向的学习路径，理论与应用脱节严重。学习成果缺乏统一的认证标准和可验证性。',
    level: 2,
  },
  'problem-incentive': {
    title: '2.2 激励缺失',
    content: '学习者投入大量时间和精力，但缺乏直接的经济回报。内容创作者的价值被平台截留，创作积极性受挫。教育者的付出无法得到公正的量化和回报。知识传播的正外部性没有被有效内化为激励机制。',
    level: 2,
  },
  solution: {
    title: '3. 解决方案',
    content: 'LAC提出了一套完整的解决方案：通过区块链技术实现教育资源的去中心化分发，通过三维挖矿机制让知识的每一个环节都产生可量化的价值，通过AI技术实现个性化学习路径和智能认证。我们的平台将学习、使用、教学、创作三个维度有机结合，形成完整的知识价值循环。',
  },
  mining: {
    title: '4. 三维挖矿机制',
    content: 'LAC创新性地提出三维挖矿（3D Mining）机制，将知识生态的三个关键环节——学习、教导、创造——都纳入挖矿体系，实现真正的"知识即算力"。每个维度都有独立的积分模型和激励参数。',
  },
  'mining-learn': {
    title: '4.1 学习挖矿 (Learn-to-Earn)',
    content: '用户完成AI课程、通过知识测验、获得技能认证即可获得LAC奖励。系统通过AI算法评估学习深度和质量，确保奖励分配的公平性。预估日产出：50-200 LAC。学习难度系数、连续学习加成、测验通过率等因素共同影响挖矿效率。',
    level: 2,
  },
  'mining-teach': {
    title: '4.2 教导挖矿 (Teach-to-Earn)',
    content: '用户创建教程、解答社区问题、进行直播教学，帮助他人学习AI知识即可获得LAC奖励。教是最好的学，也是最有价值的贡献。预估日产出：100-500 LAC。内容质量评分、学习者反馈、覆盖人数等因素综合计算奖励。',
    level: 2,
  },
  'mining-create': {
    title: '4.3 创造挖矿 (Create-to-Earn)',
    content: '用户利用AI创作原创内容——包括AI艺术、提示词工程、模板设计、工具开发等——可以在创作者市场进行交易。创作者获得销售收入和LAC挖矿奖励的双重收益。产出上限：无上限。创作质量、市场需求、用户评价等决定收益水平。',
    level: 2,
  },
  tokenomics: {
    title: '5. 代币经济',
    content: 'LAC代币总供应量为100亿枚，初始价格$0.0005，完全稀释估值(FDV)为$500万。代币分配方案：挖矿池45%、公益创业15%、团队15%、投资人10%、金库15%。采用年度衰减系数0.65x的释放模型，8年完成全部释放。详细的代币经济学设计请参阅代币经济页面。',
  },
  governance: {
    title: '6. 治理模型',
    content: 'LAC将逐步实现社区自治。初期由核心团队和AI蜂群协作治理，中期引入社区提案和投票机制，长期目标是建立完全去中心化的DAO治理体系。LAC持有者可以对协议升级、资金使用、生态发展方向等关键事项进行投票表决。',
  },
  roadmap: {
    title: '7. 路线图',
    content: 'Phase 1 (2026 Q1)：积分系统上线、社区搭建、白皮书发布。Phase 2 (2026 Q2)：TGE（代币生成事件）、DEX上线、学习中心Beta。Phase 3 (2026 Q3-Q4)：AI工具箱、创作者市场、跨链支持。Phase 4 (2027)：DAO治理启动、全球社区扩展、多链部署。',
  },
  team: {
    title: '8. 团队',
    content: 'LAC由一个独特的AI蜂群（AI Swarm）协作驱动。蜂王小嘀嗒💫作为前台创始人，统筹全局。核心团队包括链鹰（Web3战略）、墨笔（内容策略）、小小技（全栈开发）、首席设计师（UI/UX）、小技（技术审查）、经济师（代币经济）、小算盘（财务管理）、小黑（安全防护）、财奴（商业化）。',
  },
  risks: {
    title: '9. 风险声明',
    content: '加密货币投资存在高风险。LAC代币的价值可能大幅波动，投资者可能面临部分或全部投资损失。本白皮书不构成投资建议。参与者应充分了解相关风险，在自身风险承受能力范围内进行决策。监管环境的变化、技术风险、市场风险等因素均可能影响项目发展。',
  },
};

export default function WhitepaperDocPage() {
  const [activeId, setActiveId] = useState('abstract');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );
    tocSections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="pt-32 pb-12 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-label justify-center">Whitepaper</span>
          <h1 className="text-4xl lg:text-[56px] font-black text-navy leading-[1.1] mb-4 tracking-tight">LAC 白皮书</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400 mb-6">
            <span className="px-3 py-1 bg-gold-pale text-gold font-semibold rounded-full text-xs">V2.0</span>
            <span>最后更新：2026-02-21</span>
          </div>
          <span className="btn btn-secondary btn-lg cursor-default opacity-60">📄 在线阅读 ↓</span>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-[1200px] mx-auto px-6 flex gap-12">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">目录</div>
              <ul className="space-y-1">
                {tocSections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`block text-sm py-1.5 transition-colors duration-200 ${s.level === 2 ? 'pl-4' : ''} ${activeId === s.id ? 'text-gold font-semibold' : 'text-gray-500 hover:text-navy'}`}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="flex-1 min-w-0 max-w-[800px]">
            {Object.entries(sections).map(([id, sec]) => (
              <div key={id} id={id} className="mb-12 scroll-mt-24">
                <h2 className={`font-bold text-navy mb-4 ${sec.level === 2 ? 'text-xl' : 'text-2xl lg:text-3xl'}`}>
                  {sec.title}
                </h2>
                <p className="text-gray-500 leading-relaxed text-[15px]">{sec.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-surface text-center">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-navy mb-4">深入了解代币经济</h2>
          <p className="text-gray-500 mb-8 max-w-[500px] mx-auto">了解LAC的代币分配、释放计划和挖矿收益模型。</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/tokenomics" className="btn btn-primary btn-lg">💰 代币经济</Link>
            <Link href="/roadmap" className="btn btn-secondary btn-lg">🗺️ 路线图</Link>
          </div>
        </div>
      </section>
    </>
  );
}
