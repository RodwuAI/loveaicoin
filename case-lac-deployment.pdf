## LAC实战：1小时部署Web3全栈基础设施

这是一份从零开始的实操手册。照着做，1小时后你将拥有一个完整的Web3项目基础设施：前端网站、后端数据库、自定义域名、SSL证书全自动管理。

**预计耗时：** 30分钟（CEO操作）+ 30分钟（AI蜂群执行）  
**预计花费：** $11.18（域名年费）

---

### 你需要准备

| 项目 | 说明 |
|------|------|
| 电脑 | Mac/Windows/Linux均可 |
| GitHub账号 | 已有或新建，需绑邮箱 |
| 信用卡 | Visa/Mastercard，域名付款$11.18/年 |
| 邮箱 | 接收域名确认邮件 |
| 手机号 | 域名注册实名验证用 |
| AI蜂群 | 至少1个AI助手（如小嘀嗒）负责执行 |

**重要原则：** 你（CEO）只负责注册账号、付款、复制粘贴密钥。所有技术执行交给AI蜂群。不要试图理解每一步的技术含义，你的任务是"点头"和"复制"。

---

### 第一步：创建代码仓库（GitHub）

1. 打开浏览器，访问 https://github.com/new
2. **Repository name** 填项目英文名，如 `loveaicoin`
3. 勾选 **Add a README file**
4. 选择 **Public**（私有仓库Vercel部署需额外配置，先选Public）
5. 点击绿色按钮 **Create repository**
6. 创建完成后，复制浏览器地址栏的URL，格式：`https://github.com/你的用户名/loveaicoin`
7. 把这个URL发给AI蜂群

→ [截图：GitHub新建仓库页面，圈出name输入框、README勾选、Create按钮]

---

### 第二步：搭建后端（Supabase）

Supabase是开源Firebase替代品，提供PostgreSQL数据库、API、身份验证。

#### 2.1 注册账号
1. 打开 https://supabase.com
2. 点击右上角 **Start your project**
3. 选择 **Continue with GitHub**
4. 授权登录（使用你刚才的GitHub账号）

→ [截图：Supabase首页，圈出Start your project按钮]

#### 2.2 创建项目
1. 登录后，点击 **New project**
2. **Organization** 选默认（你的GitHub用户名）
3. **Project name** 填 `loveaicoin-production`
4. **Database Password** 点 **Generate a password**，系统自动生成
5. **Region** 选 `Singapore`（亚洲用户延迟最低）
6. 点击 **Create new project**
7. 等待约1分钟，项目创建完成

→ [截图：New project表单，圈出name、region选择、Create按钮]

#### 2.3 获取API密钥（发给前端）
1. 项目创建后，左侧菜单点击 **Project Settings** → **API**
2. 找到 **Project URL**，点击右侧复制按钮，格式：`https://xxxxxx.supabase.co`
3. 找到 **Project API keys** 区域的 **anon public**，复制，格式：`sb_publishable_xxxxx`
4. 把这2个值发给AI蜂群，说："这是前端用的Supabase配置"

→ [截图：API设置页面，圈出Project URL和anon public key]

#### 2.4 获取服务端密钥（发给后端）
1. 在同一页面，找到 **service_role secret**，点击 **Reveal**，然后复制
2. 格式：`sb_secret_xxxxx`
3. 把这个值发给AI蜂群，说："这是服务端用的Supabase密钥，绝密"

⚠️ **安全提示：** service_role key拥有数据库完全权限，绝对不要泄露给不信任的人。

#### 2.5 生成Access Token（给AI管理用）
1. 点击右上角头像 → **Account preferences**
2. 左侧菜单点击 **Access Tokens**
3. 点击 **Generate new token**
4. **Token name** 填 `loveaicoin-deploy`
5. 点击 **Generate token**
6. 复制生成的token，格式：`sbp_xxxxx`
7. 发给AI蜂群，说："这是Supabase CLI管理token"

→ [截图：Access Tokens页面，圈出Generate按钮和token显示区域]

---

### 第三步：搭建前端部署（Vercel）

Vercel是前端部署平台，支持Next.js/React/Vue等，自动CI/CD、SSL证书、全球CDN。

#### 3.1 注册账号
1. 打开 https://vercel.com
2. 点击 **Sign Up**
3. 选择 **Continue with GitHub**
4. 授权登录

→ [截图：Vercel首页Sign Up]

#### 3.2 导入GitHub仓库
1. 登录后点击 **Add New...** → **Project**
2. 在 **Import Git Repository** 列表中找到你的 `loveaicoin` 仓库
3. 点击 **Import**
4. **Project Name** 保持默认 `loveaicoin`
5. **Framework Preset** 选 `Next.js`（如果不是Next.js项目选对应的）
6. 展开 **Environment Variables**
7. 点击 **Add** 添加变量：
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: 粘贴刚才复制的Project URL
   - 再点 **Add**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: 粘贴刚才复制的anon public key
8. 点击 **Deploy**
9. 等待2-3分钟部署完成
10. 部署成功后，Vercel会给你一个 `.vercel.app` 结尾的临时域名

→ [截图：Vercel项目配置页，圈出Import按钮、Framework选择、Deploy按钮]

#### 3.3 生成Deploy Token（给AI自动化用）
1. 点击右上角头像 → **Settings**
2. 左侧菜单点击 **Tokens**
3. 点击 **Create Token**
4. **Token name** 填 `loveaicoin-deployment`
5. **Scope** 选你的 `loveaicoin` 项目
6. 点击 **Create Token**
7. 复制token，格式：`vcp_xxxxx`
8. 发给AI蜂群，说："这是Vercel部署token"

→ [截图：Tokens创建页面]

---

### 第四步：注册域名（Namecheap）

Namecheap是性价比最高的域名注册商，免费Whois隐私保护。

#### 4.1 搜索域名
1. 打开 https://namecheap.com
2. 首页搜索框输入你想要的域名，如 `loveaicoin`
3. 点击 **Search**
4. 系统会显示 `.com` `.net` `.org` 等后缀的价格

→ [截图：Namecheap首页搜索框]

#### 4.2 选择并购买
1. 找到 `.com` 后缀，点击 **Add to cart**（通常$8-12/年）
2. 点击右上角购物车图标 → **View Cart**
3. **WhoisGuard** 保持默认（免费隐私保护，已开启）
4. **Auto-Renew** 建议开启（防止忘记续费）
5. 点击 **Confirm Order**
6. 登录或注册Namecheap账号
7. 填写付款信息（信用卡或PayPal）
8. 完成支付

⚠️ **注意：** 新域名注册需要邮箱验证，检查你的邮箱点击确认链接。

→ [截图：购物车页面，圈出价格、Confirm Order按钮]

#### 4.3 获取DNS管理权限
1. 购买完成后，进入 **Account** → **Domain List**
2. 找到你的域名，点击 **Manage**
3. 点击 **Advanced DNS** 标签
4. 你现在应该看到默认的几条DNS记录

→ [截图：Domain List页面，圈出Manage按钮]

---

### 第五步：配置DNS（从Namecheap到Vercel）

这是连接域名和网站的关键一步。

#### 5.1 获取Vercel的DNS记录
1. 回到Vercel，进入你的 `loveaicoin` 项目
2. 点击 **Settings** → **Domains**
3. 输入你的域名 `loveaicoin.com`，点击 **Add**
4. Vercel会提示需要配置的DNS记录，通常是：
   - 类型：A，主机：@，值：76.76.21.21
   - 类型：CNAME，主机：www，值：cname.vercel-dns.com
5. **不要关闭这个页面**，留着对照

→ [截图：Vercel Domains页面，显示需要的DNS记录]

#### 5.2 在Namecheap配置DNS
1. 回到Namecheap的 **Advanced DNS** 页面
2. 删除所有默认记录（通常有 parking 记录）
3. 点击 **ADD NEW RECORD**，按以下表格添加：

| 类型 | 主机 | 值 | TTL |
|------|------|-----|-----|
| A Record | @ | 76.76.21.21 | Automatic |
| CNAME Record | www | cname.vercel-dns.com | Automatic |
| CNAME Record | _acme-challenge | （Vercel提供的验证值） | Automatic |

4. 点击 **Save All Changes**

→ [截图：Namecheap Advanced DNS页面，显示添加后的记录]

#### 5.3 验证DNS传播
1. 回到Vercel的Domains页面
2. 等待几分钟，点击 **Refresh**
3. 看到 **Valid Configuration** 绿色勾号即成功
4. 此时访问 `https://loveaicoin.com` 应该能看到你的网站

**DNS传播时间：** 通常5-30分钟，极端情况24小时。这期间你可以休息。

---

### 第六步：总结与交接

#### 6.1 你手中拥有的Token清单

把以下信息整理发给AI蜂群，或保存到密码管理器：

| # | 平台 | Token名称 | 格式示例 | 用途 | 获取方式 | 给谁用 | 安全级别 |
|---|------|-----------|---------|------|---------|--------|---------|
| 1 | Supabase | Project URL | `https://******.supabase.co` | API调用地址 | 项目创建后自动生成 | 前端+后端 | 公开 |
| 2 | Supabase | Publishable Key | `sb_publishable_****...***` | 前端调用API | Settings→API | 前端代码 | 可公开（有RLS保护） |
| 3 | Supabase | Secret Key | `sb_secret_****...***` | 服务端特权API | Settings→API | 后端.env | 🔴绝密 |
| 4 | Supabase | Access Token | `sbp_****...***` | CLI管理/迁移 | Account→Tokens | 蜂王终端 | 🔴绝密 |
| 5 | Vercel | Deploy Token | `vcp_****...***` | 自动化部署 | Settings→Tokens | 蜂王终端 | 🔴绝密 |
| 6 | GitHub | PAT | `ghp_****...***` | 代码推送 | GitHub Settings→Tokens | 蜂王终端 | 🔴绝密 |

**安全建议：**
- 🔴绝密级别的token不要截图发微信，用密码管理器（如1Password）共享
- 定期轮换token（每90天）
- 离职成员立即撤销其token

#### 6.2 最终成果验收

打开浏览器检查：

| 检查项 | URL | 预期结果 |
|--------|-----|---------|
| 主站 | `https://loveaicoin.com` | 显示网站首页，锁图标（SSL正常） |
| WWW跳转 | `https://www.loveaicoin.com` | 自动跳转到主站 |
| HTTP跳转 | `http://loveaicoin.com` | 自动跳转到HTTPS |
| API测试 | `https://loveaicoin.com/api/health` | 返回JSON状态200 |

#### 6.3 AI蜂群接下来的工作

你现在可以告诉AI蜂群："基础设施已就绪，开始开发"。他们会完成：

- 创建Next.js项目结构
- 设计数据库表结构并执行迁移
- 开发页面组件（首页/关于/白皮书等）
- 配置Supabase RLS安全策略
- 编写Edge Functions
- 自动CI/CD部署

**你不需要关心这些细节。** 每完成一个里程碑，AI蜂群会向你汇报进度。你只需在关键决策点（如"是否购买付费插件"、"是否上线功能X"）给出yes/no即可。

---

### 附录：常见问题

**Q1: DNS配置后网站还是打不开？**  
A: 等待30分钟，或清除本地DNS缓存（Mac: `sudo dscacheutil -flushcache`）。也可使用 https://dnschecker.org 查看全球DNS传播状态。

**Q2: SSL证书没自动生效？**  
A: Vercel会自动申请Let's Encrypt证书，通常10分钟内完成。检查Domains页面是否有错误提示。

**Q3: 需要备案吗？**  
A: 服务器在境外（新加坡/美国）+ 域名在境外注册商（Namecheap）= 不需要中国ICP备案。但如果目标用户主要在中国，建议还是备案并使用国内服务器。

**Q4: 如何添加团队成员？**  
A: GitHub仓库设置→Manage access→Invite；Supabase项目设置→Team；Vercel项目设置→Members。

---

### 写在最后

这就是现代一人公司的基建速度：30分钟，6个平台，$11.18，一个完整的Web3项目基础设施。

十年前，这需要一支5人团队、3个月时间、5万美元预算。今天，AI蜂群把边际成本压到了接近零。

你不需要懂PostgreSQL、Next.js、DNS解析、SSL证书。你只需要懂一件事：**如何在正确的时机，把正确的钥匙交给正确的人。**

现在，去泡杯茶，等AI蜂群把成品端上来吧。
