'use client';

export default function PrivacyPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-label justify-center">Legal</span>
          <h1 className="text-4xl lg:text-[56px] font-black text-navy leading-[1.1] mb-4 tracking-tight">隐私政策</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400 mb-6">
            <span className="px-3 py-1 bg-gold-pale text-gold font-semibold rounded-full text-xs">Privacy Policy</span>
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
              <h2 className="text-3xl font-bold text-navy mb-8">LAC 隐私政策</h2>
              
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">1. 引言</h3>
                <p className="mb-4">
                  LAC Foundation（以下简称"我们"或"平台"）高度重视用户的隐私保护。本隐私政策（以下简称"政策"）旨在说明我们如何收集、使用、存储和保护您的个人信息，以及您对个人信息的权利。
                </p>
                <p>
                  本政策适用于 LAC 平台的所有产品和服务。请仔细阅读本政策，了解我们对您个人信息的处理方式。使用我们的服务即表示您同意本政策的内容。
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">2. 数据收集范围</h3>
                <p className="mb-4">
                  我们收集的信息包括：
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>
                    <strong>账户信息：</strong>注册时提供的电子邮箱地址、用户名、密码（加密存储）
                  </li>
                  <li>
                    <strong>区块链信息：</strong>钱包地址、交易记录、链上活动数据（钱包地址为链上公开数据）
                  </li>
                  <li>
                    <strong>学习数据：</strong>课程学习进度、测验成绩、技能认证记录
                  </li>
                  <li>
                    <strong>使用数据：</strong>平台使用记录、功能使用频率、交互数据
                  </li>
                  <li>
                    <strong>内容数据：</strong>用户创建的教学内容、评论、反馈
                  </li>
                  <li>
                    <strong>设备信息：</strong>IP地址、浏览器类型、操作系统、设备标识符
                  </li>
                </ul>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">3. 数据使用目的</h3>
                <p className="mb-4">
                  我们使用您的信息用于以下目的：
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>提供、维护和改进平台服务</li>
                  <li>计算和发放挖矿奖励</li>
                  <li>验证用户身份和防止欺诈</li>
                  <li>个性化学习推荐和内容推送</li>
                  <li>分析平台使用情况以优化用户体验</li>
                  <li>遵守法律法规和监管要求</li>
                  <li>与用户沟通（服务通知、更新、安全警报）</li>
                </ul>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">4. 第三方共享</h3>
                <p className="mb-4">
                  我们仅在以下情况下与第三方共享您的信息：
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>
                    <strong>服务提供商：</strong>与帮助我们运营平台的服务商（如云服务、分析工具）共享必要信息，这些服务商有义务保护您的信息
                  </li>
                  <li>
                    <strong>法律要求：</strong>为遵守法律法规、法院命令或政府要求
                  </li>
                  <li>
                    <strong>保护权利：</strong>为保护我们、用户或公众的权利、财产或安全
                  </li>
                  <li>
                    <strong>业务转移：</strong>在公司合并、收购或资产出售时，用户信息可能作为转移资产的一部分
                  </li>
                </ul>
                <p className="mb-4">
                  <strong>特别说明：</strong>钱包地址是区块链上的公开数据，任何人都可以查看相关交易记录。我们无法控制或保护链上公开数据的隐私。
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">5. Cookie政策</h3>
                <p className="mb-4">
                  5.1 我们使用 Cookie 和类似技术来：
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>记住您的登录状态和偏好设置</li>
                  <li>分析平台使用情况和性能</li>
                  <li>提供个性化内容和广告</li>
                  <li>增强平台安全性</li>
                </ul>
                <p className="mb-4">
                  5.2 您可以通过浏览器设置控制 Cookie。但禁用某些 Cookie 可能影响平台功能。
                </p>
                <p>
                  5.3 我们使用第三方分析服务（如 Google Analytics）来帮助我们了解用户如何使用平台。
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">6. 用户权利（GDPR 合规）</h3>
                <p className="mb-4">
                  根据欧盟《通用数据保护条例》（GDPR），您拥有以下权利：
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>
                    <strong>访问权：</strong>获取我们持有的您的个人信息副本
                  </li>
                  <li>
                    <strong>更正权：</strong>更正不准确或不完整的个人信息
                  </li>
                  <li>
                    <strong>删除权：</strong>在特定情况下要求删除您的个人信息
                  </li>
                  <li>
                    <strong>限制处理权：</strong>限制我们对您个人信息的使用
                  </li>
                  <li>
                    <strong>数据可携权：</strong>以结构化、常用格式获取您的个人信息
                  </li>
                  <li>
                    <strong>反对权：</strong>反对基于合法利益的数据处理
                  </li>
                  <li>
                    <strong>撤回同意权：</strong>随时撤回您已给予的同意
                  </li>
                </ul>
                <p>
                  要行使这些权利，请通过 privacy@loveaicoin.com 联系我们。我们将在 30 天内回复您的请求。
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">7. 数据保留期限</h3>
                <p className="mb-4">
                  我们仅在实现本政策所述目的所需的时间内保留您的个人信息，除非法律要求或允许更长的保留期。具体保留期限如下：
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>账户信息：账户活跃期间 + 注销后 6 个月</li>
                  <li>交易记录：7 年（税务和合规要求）</li>
                  <li>学习数据：账户活跃期间</li>
                  <li>日志数据：90 天</li>
                </ul>
                <p>
                  当不再需要个人信息时，我们将安全地删除或匿名化处理。
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">8. 数据安全</h3>
                <p className="mb-4">
                  我们采取合理的技术和组织措施保护您的个人信息，包括：
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>数据加密传输和存储</li>
                  <li>访问控制和身份验证</li>
                  <li>定期安全审计和漏洞扫描</li>
                  <li>员工隐私保护培训</li>
                </ul>
                <p>
                  尽管我们采取这些措施，但没有任何互联网传输或电子存储方法是 100% 安全的。我们无法保证信息的绝对安全。
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">9. 儿童隐私</h3>
                <p>
                  我们的服务不面向 13 岁以下的儿童。如果我们发现收集了 13 岁以下儿童的个人信息，将立即删除。如果您是家长或监护人并认为我们收集了您孩子的信息，请通过 privacy@loveaicoin.com 联系我们。
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">10. 政策更新</h3>
                <p className="mb-4">
                  我们可能不时更新本政策。更新后的政策将在平台上公布，并在公布时生效。重大变更将通过电子邮件或平台通知告知用户。
                </p>
                <p>
                  建议您定期查看本政策以了解最新信息。继续使用我们的服务即表示您接受更新后的政策。
                </p>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  本政策最后更新日期：2026年2月21日<br />
                  公司名称：LAC Foundation<br />
                  联系邮箱：privacy@loveaicoin.com<br />
                  如有隐私相关问题或要行使您的权利，请通过上述邮箱联系我们。
                </p>
              </div>
            </div>

            {/* 分割线 */}
            <div className="my-16 border-t border-gray-300"></div>

            {/* 英文部分 */}
            <div>
              <h2 className="text-3xl font-bold text-navy mb-8">LAC Privacy Policy</h2>
              
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">1. Introduction</h3>
                <p className="mb-4">
                  LAC Foundation (hereinafter referred to as "we" or the "Platform") highly values user privacy protection. This Privacy Policy (hereinafter referred to as the "Policy") aims to explain how we collect, use, store, and protect your personal information, as well as your rights regarding your personal information.
                </p>
                <p>
                  This Policy applies to all products and services of the LAC platform. Please read this Policy carefully to understand how we handle your personal information. Using our services indicates your acceptance of the contents of this Policy.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">2. Data Collection Scope</h3>
                <p className="mb-4">
                  The information we collect includes:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>
                    <strong>Account Information:</strong> Email address, username, password (encrypted storage) provided during registration
                  </li>
                  <li>
                    <strong>Blockchain Information:</strong> Wallet addresses, transaction records, on-chain activity data (wallet addresses are public on-chain data)
                  </li>
                  <li>
                    <strong>Learning Data:</strong> Course progress, quiz scores, skill certification records
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Platform usage records, feature usage frequency, interaction data
                  </li>
                  <li>
                    <strong>Content Data:</strong> User-created teaching content, comments, feedback
                  </li>
                  <li>
                    <strong>Device Information:</strong> IP address, browser type, operating system, device identifiers
                  </li>
                </ul>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">3. Data Usage Purposes</h3>
                <p className="mb-4">
                  We use your information for the following purposes:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Providing, maintaining, and improving platform services</li>
                  <li>Calculating and distributing mining rewards</li>
                  <li>Verifying user identity and preventing fraud</li>
                  <li>Personalizing learning recommendations and content delivery</li>
                  <li>Analyzing platform usage to optimize user experience</li>
                  <li>Complying with laws, regulations, and regulatory requirements</li>
                  <li>Communicating with users (service notifications, updates, security alerts)</li>
                </ul>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">4. Third-Party Sharing</h3>
                <p className="mb-4">
                  We only share your information with third parties in the following circumstances:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>
                    <strong>Service Providers:</strong> Sharing necessary information with service providers (such as cloud services, analytics tools) that help us operate the platform. These providers are obligated to protect your information.
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> To comply with laws, regulations, court orders, or government requirements
                  </li>
                  <li>
                    <strong>Protecting Rights:</strong> To protect the rights, property, or safety of us, users, or the public
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> User information may be transferred as part of assets in the event of a merger, acquisition, or asset sale
                  </li>
                </ul>
                <p className="mb-4">
                  <strong>Special Note:</strong> Wallet addresses are public data on the blockchain, and anyone can view related transaction records. We cannot control or protect the privacy of publicly available on-chain data.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">5. Cookie Policy</h3>
                <p className="mb-4">
                  5.1 We use cookies and similar technologies to:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Remember your login status and preferences</li>
                  <li>Analyze platform usage and performance</li>
                  <li>Provide personalized content and advertising</li>
                  <li>Enhance platform security</li>
                </ul>
                <p className="mb-4">
                  5.2 You can control cookies through browser settings. However, disabling certain cookies may affect platform functionality.
                </p>
                <p>
                  5.3 We use third-party analytics services (such as Google Analytics) to help us understand how users use the platform.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">6. User Rights (GDPR Compliance)</h3>
                <p className="mb-4">
                  Under the EU General Data Protection Regulation (GDPR), you have the following rights:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>
                    <strong>Right of Access:</strong> Obtain a copy of your personal information held by us
                  </li>
                  <li>
                    <strong>Right to Rectification:</strong> Correct inaccurate or incomplete personal information
                  </li>
                  <li>
                    <strong>Right to Erasure:</strong> Request deletion of your personal information under specific circumstances
                  </li>
                  <li>
                    <strong>Right to Restriction of Processing:</strong> Restrict our use of your personal information
                  </li>
                  <li>
                    <strong>Right to Data Portability:</strong> Receive your personal information in a structured, commonly used format
                  </li>
                  <li>
                    <strong>Right to Object:</strong> Object to data processing based on legitimate interests
                  </li>
                  <li>
                    <strong>Right to Withdraw Consent:</strong> Withdraw consent you have given at any time
                  </li>
                </ul>
                <p>
                  To exercise these rights, please contact us at privacy@loveaicoin.com. We will respond to your request within 30 days.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">7. Data Retention Period</h3>
                <p className="mb-4">
                  We retain your personal information only for as long as necessary to achieve the purposes described in this Policy, unless a longer retention period is required or permitted by law. Specific retention periods are as follows:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Account Information: During account activity + 6 months after account deletion</li>
                  <li>Transaction Records: 7 years (tax and compliance requirements)</li>
                  <li>Learning Data: During account activity</li>
                  <li>Log Data: 90 days</li>
                </ul>
                <p>
                  When personal information is no longer needed, we will securely delete or anonymize it.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">8. Data Security</h3>
                <p className="mb-4">
                  We take reasonable technical and organizational measures to protect your personal information, including:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Encrypted data transmission and storage</li>
                  <li>Access controls and authentication</li>
                  <li>Regular security audits and vulnerability scanning</li>
                  <li>Employee privacy protection training</li>
                </ul>
                <p>
                  Despite these measures, no method of internet transmission or electronic storage is 100% secure. We cannot guarantee absolute security of information.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">9. Children's Privacy</h3>
                <p>
                  Our services are not directed to children under 13. If we discover that we have collected personal information from a child under 13, we will delete it immediately. If you are a parent or guardian and believe we have collected your child's information, please contact us at privacy@loveaicoin.com.
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold text-navy mb-4">10. Policy Updates</h3>
                <p className="mb-4">
                  We may update this Policy from time to time. The updated policy will be published on the platform and will take effect upon publication. Significant changes will be notified to users via email or platform notifications.
                </p>
                <p>
                  We recommend that you review this Policy periodically for the latest information. Continued use of our services constitutes your acceptance of the updated policy.
                </p>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Last Updated: February 21, 2026<br />
                  Company Name: LAC Foundation<br />
                  Contact Email: privacy@loveaicoin.com<br />
                  For privacy-related questions or to exercise your rights, please contact us at the above email address.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
