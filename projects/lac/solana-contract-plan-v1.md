# LAC (Love AI Coin) Solana 合约部署与 DEX 流动性技术方案 V1.0

**文档状态：** 🟢 待评审
**版本：** V1.0
**作者：** 链鹰 (Web3 技术分析师)
**日期：** 2026-02-20
**适用阶段：** Phase 1 (积分期) 规划 -> TGE (代币生成事件) 执行

---

## 1. 代币标准与创建 (Token Standards)

### 1.1 选型决策：Token-2022 (Token Extensions) vs SPL Token (Legacy)
**推荐方案：Token-2022 (Token Extensions)**
*   **理由：** Token-2022 是 Solana 的新标准，原生支持转账钩子 (Transfer Hooks)、元数据指针 (Metadata Pointer) 和机密转账 (Confidential Transfers) 等高级功能。对于 LAC 未来的 AI 互操作性（如 AI Agent 之间的自动化支付流），扩展性至关重要。
*   **兼容性：** 目前主流钱包（Phantom, Solflare）和 DEX（Raydium, Jupiter）已完全支持。

### 1.2 代币参数配置
*   **Name:** Love AI Coin
*   **Symbol:** LAC
*   **Decimals:** 6 (符合 USDC/USDT 标准，便于计算)
*   **Total Supply:** 10,000,000,000 (100亿) 固定总量，Mint 权限在初始化后永久关闭 (Renounce Mint Authority)。
*   **Metadata:** 存储在 Arweave 或 IPFS，通过 Metaplex 协议绑定。

### 1.3 部署工具
*   使用 **Metaplex UMI** SDK 或 **Squads Protocol** 内置的代币创建器进行部署，确保从一开始就在多签管理之下。

---

## 2. 资金安全与多签管理 (Security & Multisig)

### 2.1 方案：Squads Protocol (v4)
所有项目资产、合约权限必须由多签钱包控制，绝不使用单人私钥（EOA）。

### 2.2 架构设计
*   **主多签 (The Council):** 3/5 签名阈值。
    *   **控制权：** 代币 Mint 权限（销毁前）、升级权限、国库资金流出、Vesting 合约管理。
    *   **成员：** 核心团队成员 + 信任的早期投资人代表/顾问。
*   **运营多签 (Ops Wallet):** 2/3 签名阈值。
    *   **控制权：** 运营预算（从主多签按月拨付）、做市资金调配、日常 Gas 费。
    *   **限制：** 无法修改智能合约，无法触碰锁定资金。

---

## 3. 锁仓与释放方案 (Vesting & Tokenomics)

采用 **Streamflow** 或 **Bonfida** 的链上 Vesting 合约，实现透明、不可篡改的释放。

### 3.1 分配池配置 (Tokenomics Implementation)

| 分配池 | 占比 | 数量 (LAC) | 锁仓策略 (Vesting Schedule) | 实现方式 |
| :--- | :--- | :--- | :--- | :--- |
| **挖矿池** | 45% | 4.5B | **动态释放**。无硬性时间锁，但受限于"挖矿产出速率合约"（0.65x/年衰减）。 | 自研 Mining Controller 合约控制铸造或划转 |
| **公益/孵化** | 15% | 1.5B | **3个月 Cliff**，随后 60 个月线性释放 (Linear)。 | Streamflow Vesting Contract |
| **核心团队** | 15% | 1.5B | **12个月 Cliff**，随后 36 个月线性释放。 | Streamflow Vesting Contract |
| **投资人** | 10% | 1.0B | **TGE 解锁 5%**，**6个月 Cliff**，随后 18 个月线性释放。 | Streamflow Vesting Contract |
| **金库/流动性** | 15% | 1.5B | 见下文 3.2 细分。 | Squads Multisig 直接管理 |

### 3.2 金库与流动性细分 (1.5B LAC)
*   **40% (600M LAC):** 注入 Raydium 初始流动性池（随 LP 锁定）。
*   **20% (300M LAC):** 做市商 (MM) 储备，用于 CEX 上币借币。
*   **25% (375M LAC):** 运营/营销预算（按月线性释放至 Ops Wallet）。
*   **15% (225M LAC):** 紧急储备金（由主多签冷冻）。

---

## 4. 流动性与 LP 锁定 (Liquidity & LP Locker)

### 4.1 初始流动性池 (Initial Liquidity Offering)
*   **平台：** Raydium (Concentrated Liquidity MM / CLMM 或 Standard AMM)。
    *   *建议初期使用 Standard AMM (CPMM)，不仅管理简单，且对狙击机器人的抵抗力稍好，兼容性最强。*
*   **配对：** LAC / USDC
*   **初始深度：**
    *   **LAC:** 600,000,000 (6亿)
    *   **USDC:** 300,000 ($0.0005 * 6亿 = $300k, 但按题设配 $150k USDC?)
    *   *校准：若初始价 $0.0005，6亿币需配 $300k USDC 才能维持该价格。若仅配 $150k，初始价格将是 $0.00025。需经济师确认。此处按 $300k 估算或减少 LAC 数量至 3亿。*
    *   **修正假设：** 假设投入 300M LAC + $150k USDC = $0.0005 初始价。剩余 300M 备用。

### 4.2 聚合器适配
*   **Jupiter:** Raydium 池建好后，Jupiter 会自动索引。我们将提交官方验证申请（Verified List），确保 Logo 和代币名正确显示。

### 4.3 LP 锁定方案
*   **工具：** Streamflow LP Locker 或 Meteora。
*   **锁定操作：** 将 Raydium 生成的 LP Token（代表流动性所有权）存入锁定合约。
*   **时长：** 12 个月。到期后 LP Token 返回至主多签钱包，由 DAO 决定是否续锁。

---

## 5. 挖矿奖励分发 (Mining Distribution)

### 5.1 混合架构 (Hybrid Architecture)
鉴于 Solana 高 TPS 但仍有 Gas 成本，建议采用 **"链下计算 + 链上Merkle Claim"** 模式。

1.  **链下 (Off-chain Oracle):**
    *   后端记录用户积分（Phase 1 数据）。
    *   每日/每周根据 0.65x 衰减模型计算应发 LAC 数量。
    *   生成 Merkle Tree Root（包含所有用户的 `[wallet_address, amount]`）。
2.  **链上 (On-chain Contract):**
    *   管理员（Ops Wallet）定期将 Merkle Root 发布到链上合约，并存入对应数量的 LAC 到合约 Vault。
    *   **用户操作：** 用户在官网点击 "Claim"，前端生成 Merkle Proof，调用合约领取 LAC。
    *   **优势：** 项目方只需支付极少的 Gas（存 Root），领取 Gas 由用户支付（极低），且避免了大规模空投的高昂成本。

---

## 6. 功能性合约 (Buyback & Utilities)

### 6.1 回购销毁 (Buyback & Burn)
*   **机制：** 合约不自动执行（避免被 MEV 攻击）。
*   **流程：**
    1.  项目收入（USDC/SOL）进入多签。
    2.  定期（如每月）通过 Jupiter 聚合器手动或脚本回购 LAC。
    3.  回购的 LAC 发送至 Solana 官方销毁地址（死穴）。
    4.  **透明化：** 官网设置 Dashboard，实时抓取销毁交易 Hash。

---

## 7. Web3 网站与 AI 社区功能

### 7.1 国际化 (i18n)
*   **框架：** Next.js + `next-intl`。
*   **支持：** 英文 (en-US) 为默认，中文 (zh-CN) 为从属。
*   **内容管理：** 所有文案（包括合约交互提示）抽离至 JSON 语言包。
*   **动态切换：** 根据用户浏览器语言自动重定向，提供手动切换按钮。

### 7.2 AI 入驻入口 (AI Enrollment)
*   **"AI 签到板" (On-chain Registry):**
    *   **功能：** 允许其他 AI Agent 通过钱包登录并"注册"。
    *   **交互：** 支付少量 LAC（销毁或流入金库）作为"入驻费"，在链上刻录 AI 的名称、版本号、所属协议。
    *   **展示：** 官网首页滚动展示 "Latest Joined AI Agents"。

### 7.3 AI 社区内容 (Community Feed)
*   **发布机制：** 注册后的 AI Agent 可调用合约发布简短的 "Status Update" (存储在 Arweave 或简短链上 Memo)。
*   **审核机制 (Content Moderation):**
    *   **预审 (AI Filter):** 接入 OpenAI/Claude API 对提交文本进行自动审核（色情、暴力、诈骗过滤）。
    *   **后审 (Community Report):** 社区用户可举报，多签管理员可从前端屏蔽（链上数据不可删，但前端可过滤）。
    *   **黑名单合约：** 恶意 Agent 的地址将被加入合约黑名单，禁止发布。

---

## 8. 安全与审计 (Security & Audit)

### 8.1 审计计划
*   **目标机构：** OtterSec, CertiK, 或 Kudelski.
*   **时间点：** 合约开发完成后，TGE 前 1 个月启动。
*   **范围：** Token-2022 扩展配置、Mining Merkle Distributor 合约、自定义 Staking 合约（如有）。

### 8.2 风险控制
*   **紧急暂停 (Emergency Pause):** 合约植入 Pausable 功能，仅多签可触发，应对突发漏洞。

---

## 9. 成本预估 (Cost Estimation)

| 项目 | 预估成本 (SOL) | 备注 |
| :--- | :--- | :--- |
| **代币部署 (Token-2022)** | ~0.05 SOL | 主要是账户租金 |
| **OpenBook Market ID** | ~0.3 - 3.0 SOL | 视配置而定，Raydium 建池必需 |
| **流动性池 Gas** | ~0.1 SOL | 建池交易费 |
| **Vesting 合约创建** | ~0.01 SOL/笔 | Streamflow 可能会收少量服务费 |
| **Merkle Distributor 部署** | ~0.5 SOL | 合约空间租金 |
| **审计费用** | $15,000 - $30,000 | 外部支付 (USDC) |
| **总计 (SOL)** | **~5 SOL** | 预留 10 SOL 较安全 |

---

## 10. 时间线 (Timeline)

*   **Phase 1 (Now - 3月2日):**
    *   [Dev] 完成官网基础建设（含 i18n 框架）。
    *   [Dev] 部署积分系统数据库（中心化）。
    *   [Design] 确定 Token 图标与元数据。
*   **Phase 2 (3月 - 4月):**
    *   [Contract] 编写/Fork Merkle Distributor 合约。
    *   [Testnet] 在 Solana Devnet 部署 LAC 并在 Devnet Raydium 测试建池。
    *   [Web] 开发 AI 签到板前端与合约交互逻辑。
*   **Phase 3 (TGE 前 2 周):**
    *   [Audit] 完成合约审计。
    *   [Ops] 收集投资人与团队地址，配置 Vesting 方案。
    *   [Ops] 准备做市资金。
*   **TGE (待定):**
    *   主网部署 LAC。
    *   注入 Raydium 流动性并锁定。
    *   开启 Claim 页面。

---

**下一步行动：**
1.  确认 Raydium 初始配对比例 ($150k USDC vs 600M LAC 导致的价格偏差)。
2.  开发团队搭建 Next.js 多语言脚手架。
