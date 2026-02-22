'use client';

export default function TermsPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-label justify-center">Legal</span>
          <h1 className="text-4xl lg:text-[56px] font-black text-navy leading-[1.1] mb-4 tracking-tight">用户协议</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400 mb-6">
            <span className="px-3 py-1 bg-gold-pale text-gold font-semibold rounded-full text-xs">Terms of Service</span>
            <span>最后更新：2026-02-21</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto py-20 px-6">
          <div className="text-gray-700 leading-relaxed">
            
            {/* 中文部分 */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-navy mb-8">LAC 用户协议</h2>
              
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">1. 服务条款</h3>
                <p className="mb-4">
                  欢迎使用 LAC (Love AI Coin) 平台。本用户协议（以下简称"协议"）是您（以下简称"用户"）与 LAC Foundation（以下简称"我们"或"平台"）之间就使用 LAC 平台及相关服务所订立的协议。请仔细阅读本协议，特别是免责声明和争议解决条款。
                </p>
                <p>
                  通过访问、使用或注册 LAC 平台，即表示您已阅读、理解并同意受本协议的约束。如果您不同意本协议的任何条款，请立即停止使用本平台。
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">2. 用户注册与账户</h3>
                <p className="mb-4">
                  2.1 用户注册需提供真实、准确、完整的个人信息，包括但不限于电子邮箱地址、钱包地址等。
                </p>
                <p className="mb-4">
                  2.2 用户需妥善保管账户信息，包括私钥、助记词等。平台不存储用户私钥，不对因用户私钥丢失、泄露导致的资产损失承担责任。
                </p>
                <p className="mb-4">
                  2.3 用户不得将账户转让、出售或出借给他人使用。用户应对其账户下的所有活动承担全部责任。
                </p>
                <p>
                  2.4 平台有权根据风险控制需要，要求用户进行身份验证（KYC）。
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">3. 挖矿奖励规则</h3>
                <p className="mb-4">
                  3.1 LAC 采用三维挖矿机制：学习挖矿、教导挖矿、创造挖矿。具体规则以平台公布的挖矿细则为准。
                </p>
                <p className="mb-4">
                  3.2 挖矿奖励以 LAC 代币形式发放，奖励数量根据用户贡献度、任务难度、完成质量等因素动态计算。
                </p>
                <p className="mb-4">
                  3.3 平台保留调整挖矿规则、奖励参数的权利，调整前将通过公告等方式通知用户。
                </p>
                <p>
                  3.4 用户需遵守平台规则，不得通过作弊、欺诈、滥用系统漏洞等方式获取奖励，否则平台有权取消奖励并暂停或终止账户。
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">4. LAC 代币性质声明</h3>
                <p className="mb-4">
                  4.1 LAC 代币是效用代币（Utility Token），主要用于：
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>支付平台内服务费用</li>
                  <li>参与社区治理投票</li>
                  <li>获取高级功能和服务</li>
                  <li>参与生态内交易和激励</li>
                </ul>
                <p className="mb-4">
                  4.2 LAC 代币不构成：
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>证券、股票或投资产品</li>
                  <li>法定货币或稳定币</li>
                  <li>任何形式的投资建议或承诺</li>
                </ul>
                <p className="mb-4">
                  4.3 用户应充分理解加密货币投资风险，包括但不限于价格波动风险、技术风险、监管风险等。平台不保证 LAC 代币的价值或投资回报。
                </p>
                <p>
                  4.4 LAC 代币不代表对平台的所有权、控制权或利润分享权。
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">5. 知识产权</h3>
                <p className="mb-4">
                  5.1 平台提供的软件、网站、内容、商标、标识等均受知识产权法保护，所有权归 LAC Foundation 或其许可方所有。
                </p>
                <p className="mb-4">
                  5.2 用户在平台创建的内容（教程、文章、代码等）的知识产权归用户所有，但用户授予平台在全球范围内免费、永久的非独占使用许可。
                </p>
                <p>
                  5.3 用户不得复制、修改、分发、反向工程平台代码或内容，除非获得明确授权。
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">6. 免责声明</h3>
                <p className="mb-4">
                  6.1 平台按"现状"提供，不提供任何明示或暗示的保证，包括但不限于适销性、特定用途适用性、不侵权等。
                </p>
                <p className="mb-4">
                  6.2 平台不对以下情况承担责任：
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>因不可抗力、黑客攻击、技术故障导致的服务中断或数据丢失</li>
                  <li>用户操作失误导致的资产损失</li>
                  <li>第三方服务（如钱包、交易所）的问题</li>
                  <li>监管政策变化导致的损失</li>
                </ul>
                <p className="mb-4">
                  6.3 用户使用平台服务产生的风险由用户自行承担，平台在任何情况下均不对用户的直接、间接、附带、惩罚性损害承担责任。
                </p>
                <p>
                  6.4 平台可能包含第三方链接或服务，平台不对第三方内容或服务承担责任。
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">7. 争议解决</h3>
                <p className="mb-4">
                  7.1 本协议受新加坡法律管辖并据其解释。
                </p>
                <p className="mb-4">
                  7.2 因本协议引起的或与本协议有关的任何争议，双方应首先通过友好协商解决。
                </p>
                <p className="mb-4">
                  7.3 协商不成的，任何一方均可将争议提交新加坡国际仲裁中心（SIAC）按照其现行有效的仲裁规则进行仲裁。
                </p>
                <p>
                  7.4 仲裁裁决是终局的，对双方均有约束力。
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">8. 协议修改与终止</h3>
                <p className="mb-4">
                  8.1 平台有权随时修改本协议，修改后的协议将在平台公布后生效。
                </p>
                <p className="mb-4">
                  8.2 用户继续使用平台服务即视为接受修改后的协议。
                </p>
                <p className="mb-4">
                  8.3 平台有权因用户违反本协议或法律法规而暂停或终止用户账户。
                </p>
                <p>
                  8.4 用户有权随时停止使用平台服务，但已产生的权利和义务不受影响。
                </p>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  本协议最后更新日期：2026年2月21日<br />
                  公司名称：LAC Foundation<br />
                  如有疑问，请联系：legal@loveaicoin.com
                </p>
              </div>
            </div>

            {/* 分割线 */}
            <div className="my-16 border-t border-gray-300"></div>

            {/* 英文部分 */}
            <div>
              <h2 className="text-3xl font-bold text-navy mb-8">LAC Terms of Service</h2>
              
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">1. Service Terms</h3>
                <p className="mb-4">
                  Welcome to the LAC (Love AI Coin) platform. This User Agreement (hereinafter referred to as the "Agreement") is entered into between you (hereinafter referred to as the "User") and LAC Foundation (hereinafter referred to as "we" or the "Platform") regarding the use of the LAC platform and related services. Please read this Agreement carefully, especially the disclaimer and dispute resolution clauses.
                </p>
                <p>
                  By accessing, using, or registering for the LAC platform, you acknowledge that you have read, understood, and agree to be bound by this Agreement. If you do not agree to any terms of this Agreement, please immediately cease using this platform.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">2. User Registration and Account</h3>
                <p className="mb-4">
                  2.1 User registration requires providing true, accurate, and complete personal information, including but not limited to email address, wallet address, etc.
                </p>
                <p className="mb-4">
                  2.2 Users must properly safeguard account information, including private keys, mnemonic phrases, etc. The platform does not store user private keys and is not responsible for asset losses caused by loss or leakage of user private keys.
                </p>
                <p className="mb-4">
                  2.3 Users may not transfer, sell, or lend their accounts to others. Users are fully responsible for all activities under their accounts.
                </p>
                <p>
                  2.4 The platform reserves the right to require user identity verification (KYC) based on risk control needs.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">3. Mining Reward Rules</h3>
                <p className="mb-4">
                  3.1 LAC adopts a three-dimensional mining mechanism: Learn-to-Earn, Teach-to-Earn, and Create-to-Earn. Specific rules are subject to the mining details published by the platform.
                </p>
                <p className="mb-4">
                  3.2 Mining rewards are distributed in the form of LAC tokens. The reward amount is dynamically calculated based on factors such as user contribution, task difficulty, and completion quality.
                </p>
                <p className="mb-4">
                  3.3 The platform reserves the right to adjust mining rules and reward parameters. Adjustments will be notified to users through announcements or other means.
                </p>
                <p>
                  3.4 Users must comply with platform rules and may not obtain rewards through cheating, fraud, or exploiting system vulnerabilities. Otherwise, the platform has the right to cancel rewards and suspend or terminate accounts.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">4. LAC Token Nature Declaration</h3>
                <p className="mb-4">
                  4.1 LAC tokens are utility tokens primarily used for:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Paying for platform service fees</li>
                  <li>Participating in community governance voting</li>
                  <li>Accessing premium features and services</li>
                  <li>Participating in ecosystem transactions and incentives</li>
                </ul>
                <p className="mb-4">
                  4.2 LAC tokens do not constitute:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Securities, stocks, or investment products</li>
                  <li>Legal tender or stablecoins</li>
                  <li>Any form of investment advice or promise</li>
                </ul>
                <p className="mb-4">
                  4.3 Users should fully understand cryptocurrency investment risks, including but not limited to price volatility risk, technical risk, regulatory risk, etc. The platform does not guarantee the value or investment return of LAC tokens.
                </p>
                <p>
                  4.4 LAC tokens do not represent ownership, control, or profit-sharing rights in the platform.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">5. Intellectual Property</h3>
                <p className="mb-4">
                  5.1 The software, website, content, trademarks, logos, etc. provided by the platform are protected by intellectual property laws and are owned by LAC Foundation or its licensors.
                </p>
                <p className="mb-4">
                  5.2 Intellectual property rights to content created by users on the platform (tutorials, articles, code, etc.) belong to the users, but users grant the platform a worldwide, free, perpetual, non-exclusive license to use such content.
                </p>
                <p>
                  5.3 Users may not copy, modify, distribute, or reverse engineer platform code or content unless expressly authorized.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">6. Disclaimer</h3>
                <p className="mb-4">
                  6.1 The platform is provided "as is" without any express or implied warranties, including but not limited to merchantability, fitness for a particular purpose, non-infringement, etc.
                </p>
                <p className="mb-4">
                  6.2 The platform is not liable for:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Service interruptions or data loss due to force majeure, hacking, or technical failures</li>
                  <li>Asset losses caused by user operational errors</li>
                  <li>Issues with third-party services (such as wallets, exchanges)</li>
                  <li>Losses due to changes in regulatory policies</li>
                </ul>
                <p className="mb-4">
                  6.3 Risks arising from users' use of platform services are borne by users themselves. Under no circumstances shall the platform be liable for users' direct, indirect, incidental, or punitive damages.
                </p>
                <p>
                  6.4 The platform may contain third-party links or services. The platform is not responsible for third-party content or services.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">7. Dispute Resolution</h3>
                <p className="mb-4">
                  7.1 This Agreement is governed by and construed in accordance with the laws of Singapore.
                </p>
                <p className="mb-4">
                  7.2 Any dispute arising from or relating to this Agreement shall first be resolved through friendly negotiation between the parties.
                </p>
                <p className="mb-4">
                  7.3 If negotiation fails, either party may submit the dispute to the Singapore International Arbitration Centre (SIAC) for arbitration in accordance with its currently effective arbitration rules.
                </p>
                <p>
                  7.4 The arbitral award is final and binding on both parties.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">8. Agreement Modification and Termination</h3>
                <p className="mb-4">
                  8.1 The platform reserves the right to modify this Agreement at any time. The modified agreement will take effect after being published on the platform.
                </p>
                <p className="mb-4">
                  8.2 Continued use of platform services by users constitutes acceptance of the modified agreement.
                </p>
                <p className="mb-4">
                  8.3 The platform has the right to suspend or terminate user accounts due to user violations of this Agreement or laws and regulations.
                </p>
                <p>
                  8.4 Users have the right to cease using platform services at any time, but rights and obligations already incurred are not affected.
                </p>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Last Updated: February 21, 2026<br />
                  Company Name: LAC Foundation<br />
                  For questions, please contact: legal@loveaicoin.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}