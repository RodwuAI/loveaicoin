import Link from 'next/link';

const basePath = '';

export default function Footer() {
  return (
    <footer className="bg-[#0F1A45] text-white/70 pt-16 pb-8">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 flex-wrap">
          {/* Brand */}
          <div className="md:max-w-[280px]">
            <img src="/logo.png" alt="LAC" width={36} height={36} className="h-9 w-auto mb-3" />
            <p className="text-sm text-white/50 leading-relaxed">
              来自AI的第一封邀请函<br />
              学习即挖矿，拥抱即未来
            </p>
            <div className="flex gap-3 mt-5">
              <a href="https://github.com/RodwuAI/loveaicoin" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-lg hover:bg-gold hover:text-white transition-all duration-300 hover:-translate-y-0.5" title="GitHub">⌨</a>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-16 flex-wrap">
            <div>
              <div className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-4">产品</div>
              <Link href="/learn" className="block text-sm text-white/50 mb-2.5 hover:text-gold-light transition-colors">学习中心</Link>
              <Link href="/ai-tools" className="block text-sm text-white/50 mb-2.5 hover:text-gold-light transition-colors">AI工具箱</Link>
              <Link href="/market" className="block text-sm text-white/50 mb-2.5 hover:text-gold-light transition-colors">创作者市场</Link>
              <Link href="/community" className="block text-sm text-white/50 mb-2.5 hover:text-gold-light transition-colors">社区</Link>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-4">资源</div>
              <Link href="/whitepaper-doc" className="block text-sm text-white/50 mb-2.5 hover:text-gold-light transition-colors">白皮书</Link>
              <Link href="/roadmap" className="block text-sm text-white/50 mb-2.5 hover:text-gold-light transition-colors">路线图</Link>
              <Link href="/tokenomics" className="block text-sm text-white/50 mb-2.5 hover:text-gold-light transition-colors">代币经济</Link>
              <Link href="/whitepaper" className="block text-sm text-white/50 mb-2.5 hover:text-gold-light transition-colors">AI公益和创业</Link>
              <Link href="/contact" className="block text-sm text-white/50 mb-2.5 hover:text-gold-light transition-colors">联系我们</Link>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-4">法律</div>
              <Link href="/terms" className="block text-sm text-white/50 mb-2.5 hover:text-gold-light transition-colors">用户协议</Link>
              <Link href="/privacy" className="block text-sm text-white/50 mb-2.5 hover:text-gold-light transition-colors">隐私政策</Link>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-4">加入我们</div>
              <Link href="/genesis" className="block text-sm text-white/50 mb-2.5 hover:text-gold-light transition-colors">创世成员</Link>
              <Link href="/ai-join" className="block text-sm text-white/50 mb-2.5 hover:text-gold-light transition-colors">AI加入</Link>
              <Link href="/checkin" className="block text-sm text-white/50 mb-2.5 hover:text-gold-light transition-colors">每日签到</Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-white/35">© 2026 LAC (Love AI Coin). All rights reserved.</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-white/35 px-3 py-1 bg-white/[0.04] rounded-full">
            ⚡ Built on Solana
          </span>
        </div>
      </div>
    </footer>
  );
}
