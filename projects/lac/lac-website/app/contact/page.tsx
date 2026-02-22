import Link from 'next/link';

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-label justify-center">联系我们</span>
          <h1 className="text-4xl lg:text-[56px] font-black text-navy leading-[1.1] mb-4 tracking-tight">联系我们</h1>
          <p className="text-lg text-gray-500 max-w-[680px] mx-auto leading-relaxed mb-8">
            我们期待与您交流，共同探索AI与Web3的未来。
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Email Card */}
            <div className="card p-8 text-center relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-navy to-gold" />
              <div className="text-4xl mb-6">📧</div>
              <h3 className="text-xl font-bold text-navy mb-3">邮箱联系</h3>
              <p className="text-gray-500 mb-6">
                商务合作、媒体采访、项目咨询，请通过邮箱与我们联系。
              </p>
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-surface rounded-xl text-lg font-semibold text-navy hover:bg-surface/80 transition-colors">
                <span>contact@loveaicoin.com</span>
                <span className="text-gold">→</span>
              </div>
            </div>

            {/* GitHub Card */}
            <div className="card p-8 text-center relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold to-gold-light" />
              <div className="text-4xl mb-6">⌨</div>
              <h3 className="text-xl font-bold text-navy mb-3">GitHub</h3>
              <p className="text-gray-500 mb-6">
                查看我们的开源代码、技术文档和项目进展。
              </p>
              <a 
                href="https://github.com/RodwuAI/loveaicoin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-surface rounded-xl text-lg font-semibold text-navy hover:bg-surface/80 transition-colors"
              >
                <span>github.com/RodwuAI/loveaicoin</span>
                <span className="text-gold">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Coming Soon */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <div className="max-w-[720px] mx-auto bg-white rounded-4xl p-8 sm:p-12 border border-[#E8EAF0] shadow-card-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-pale to-gold/[0.15] border-[3px] border-gold-light flex items-center justify-center text-4xl mx-auto mb-6">
              📱
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mb-5">社交媒体账号即将开放</h2>
            <div className="text-[17px] text-gray-500 leading-[1.8] max-w-[540px] mx-auto space-y-4">
              <p>
                我们正在积极筹备Twitter、Discord、Telegram等社交媒体渠道，以便更好地与社区互动。
              </p>
              <p>
                请关注我们的GitHub页面获取最新动态，或通过邮箱联系我们。
              </p>
            </div>
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-400">
                <span>Twitter</span>
                <span className="text-xs">(即将开放)</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-400">
                <span>Discord</span>
                <span className="text-xs">(即将开放)</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-400">
                <span>Telegram</span>
                <span className="text-xs">(即将开放)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 lg:py-20 text-center">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-navy mb-4">还有其他问题？</h2>
          <p className="text-gray-500 mb-8 max-w-[500px] mx-auto">
            欢迎随时通过邮箱联系我们，我们会在24小时内回复。
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/" className="btn btn-secondary btn-lg">🏠 返回首页</Link>
            <a 
              href="mailto:contact@loveaicoin.com" 
              className="btn btn-primary btn-lg"
            >
              📧 发送邮件
            </a>
          </div>
        </div>
      </section>
    </>
  );
}