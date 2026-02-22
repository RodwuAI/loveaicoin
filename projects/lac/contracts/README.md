# LAC (Love AI Coin) Solana Smart Contracts

LAC Token 是一个基于 Solana 的 SPL Token，专为 AI 教育平台设计，支持 Learn-to-Earn、Use-to-Earn、Teach-to-Earn 和 Create-to-Sell 四种激励模式。

## 📊 代币信息

| 参数 | 值 |
|------|-----|
| **名称** | Love AI Coin |
| **符号** | LAC |
| **总供应量** | 10,000,000,000 (100亿) |
| **精度** | 9 位小数 |
| **标准** | SPL Token |
| **初始价格** | $0.0005 |

## 💰 代币分配

| 池子 | 比例 | 数量 | 锁仓规则 |
|------|------|------|---------|
| 社区挖矿 | 45% | 45亿 | 按年衰减0.65x释放，8年 |
| 公益孵化 | 15% | 15亿 | 6个月锁仓，之后24个月线性释放 |
| 团队 | 15% | 15亿 | 12个月悬崖，之后36个月线性释放 |
| 投资人 | 10% | 10亿 | 6个月悬崖，之后18个月线性释放 |
| 金库 | 15% | 15亿 | DAO治理控制释放 |

## 🏗️ 项目结构

```
contracts/
├── package.json              # 项目配置
├── tsconfig.json            # TypeScript 配置
├── jest.config.js           # Jest 测试配置
├── .env.example             # 环境变量示例
├── src/                     # 源代码
│   ├── config.ts           # 配置管理
│   ├── create-token.ts     # Token 创建脚本
│   ├── vesting.ts          # 锁仓释放合约
│   ├── mining-pool.ts      # 挖矿池分发合约
│   └── deploy.ts           # 完整部署脚本
├── tests/                   # 测试文件
│   └── token.test.ts       # 合约测试
├── deployments/            # 部署记录（自动生成）
└── README.md               # 项目文档
```

## 🚀 快速开始

### 1. 环境准备

```bash
# 克隆项目
cd /Users/fiveowu/.openclaw/workspace/projects/lac/contracts

# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env
```

### 2. 配置环境变量

编辑 `.env` 文件，设置必要的配置：

```env
# Solana 网络
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# 部署者私钥 (Base58 格式)
DEPLOYER_PRIVATE_KEY=["your","private","key","array"]

# 多签钱包地址
MULTISIG_WALLET=your_multisig_wallet_address

# 各池子钱包地址
COMMUNITY_MINING_WALLET=wallet_address_for_mining_pool
PUBLIC_GOOD_WALLET=wallet_address_for_public_good  
TEAM_WALLET=wallet_address_for_team
INVESTOR_WALLET=wallet_address_for_investors
TREASURY_WALLET=wallet_address_for_treasury
```

### 3. 获取 Devnet SOL

```bash
# 使用 Solana CLI 获取测试 SOL
solana airdrop 2 <your_wallet_address> --url devnet

# 或者使用在线水龙头
# https://faucet.solana.com/
```

## 📋 部署步骤

### 完整 Devnet 部署

```bash
# 1. 编译项目
npm run build

# 2. 运行测试
npm test

# 3. 完整部署到 Devnet
npm run deploy:devnet -- --yes

# 查看帮助
npm run deploy:devnet -- --help
```

### 分步部署

```bash
# 只创建 Token
npm run deploy:devnet -- --skip-vesting --skip-distribution --skip-mining --yes

# 只设置锁仓和分配代币
npm run deploy:devnet -- --skip-token --skip-mining --yes

# 跳过保存文件（用于测试）
npm run deploy:devnet -- --skip-save --yes
```

### 单独操作

```bash
# 单独创建 Token
npm run dev

# 运行特定测试
npm test -- --testNamePattern="Token 创建测试"
```

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm test -- --coverage

# 监听模式运行测试
npm test -- --watch

# 运行特定测试文件
npm test tests/token.test.ts
```

## 📊 合约功能

### 1. Token 创建 (`create-token.ts`)

- ✅ 创建 LAC SPL Token
- ✅ 设置 Mint Authority 为多签钱包
- ✅ 禁用 Freeze Authority
- ✅ 铸造初始供应量
- ✅ 保存部署信息

### 2. 锁仓释放 (`vesting.ts`)

- ✅ 支持悬崖期 + 线性释放
- ✅ 多受益人管理
- ✅ 实时查询已释放/待释放量
- ✅ 管理员修改受益人权限
- ✅ 紧急撤销功能

### 3. 挖矿池分发 (`mining-pool.ts`)

- ✅ 年度衰减释放模型（0.65x/年）
- ✅ 四维挖矿奖励计算
- ✅ 反作弊检测机制
- ✅ 批量奖励分发
- ✅ 实时池子状态查询

### 4. 完整部署 (`deploy.ts`)

- ✅ 一键部署全套合约
- ✅ 自动代币分配
- ✅ 部署状态检查
- ✅ 详细部署报告

## 🛠️ 开发工具

### 代码检查

```bash
# ESLint 代码检查
npm run lint

# Prettier 格式化
npm run format

# TypeScript 类型检查
npx tsc --noEmit
```

### 调试工具

```bash
# 查看 Token 信息
node -e "
const { readFileSync } = require('fs');
const data = JSON.parse(readFileSync('./deployments/devnet_latest.json'));
console.log('Token Address:', data.tokenInfo.mintAddress);
console.log('Explorer:', 'https://explorer.solana.com/address/' + data.tokenInfo.mintAddress + '?cluster=devnet');
"
```

## 📈 部署后验证

### 1. 检查 Token 创建

```bash
# 使用 Solana CLI 检查 Token
solana account <token_mint_address> --url devnet

# 或访问 Solana Explorer
https://explorer.solana.com/address/<token_mint_address>?cluster=devnet
```

### 2. 验证代币分配

```bash
# 检查各池子代币余额
spl-token balance <token_mint_address> --owner <wallet_address> --url devnet
```

### 3. 测试挖矿功能

```bash
# 运行挖矿池测试
npm test -- --testNamePattern="挖矿池测试"
```

## 🔒 安全注意事项

### 私钥管理

- ❌ 不要在代码中硬编码私钥
- ✅ 使用环境变量存储敏感信息
- ✅ 生产环境使用多签钱包
- ✅ 定期轮换密钥

### 合约安全

- ✅ 所有重要操作都需要管理员权限
- ✅ 锁仓合约不可篡改已释放的代币
- ✅ 挖矿池有日上限和反作弊检测
- ✅ 支持紧急暂停功能

### 网络安全

- ✅ 先在 Devnet 充分测试
- ✅ 使用官方 RPC 节点
- ✅ 检查交易签名和确认

## 📝 部署检查清单

- [ ] 环境变量配置正确
- [ ] 部署者钱包有足够 SOL
- [ ] 所有钱包地址验证无误
- [ ] 代码编译无错误
- [ ] 测试全部通过
- [ ] 网络连接正常
- [ ] 备份重要地址和私钥

## 🌐 网络配置

### Devnet (测试)
- RPC: `https://api.devnet.solana.com`
- Explorer: `https://explorer.solana.com?cluster=devnet`
- Faucet: `https://faucet.solana.com/`

### Mainnet (生产)
- RPC: `https://api.mainnet-beta.solana.com`
- Explorer: `https://explorer.solana.com`
- ⚠️ 真实资金，谨慎操作

## 🐛 故障排除

### 常见问题

1. **余额不足**
   ```
   Error: insufficient funds
   解决: 确保钱包有足够 SOL (建议 1+ SOL)
   ```

2. **RPC 限流**
   ```
   Error: 429 Too Many Requests  
   解决: 换用付费 RPC 或等待
   ```

3. **钱包地址无效**
   ```
   Error: Invalid public key
   解决: 检查 .env 文件中的地址格式
   ```

4. **私钥格式错误**
   ```
   Error: Invalid secret key
   解决: 确保使用 JSON 数组格式的私钥
   ```

### 获取帮助

- 📖 [Solana 文档](https://docs.solana.com/)
- 🛠️ [SPL Token 指南](https://spl.solana.com/token)
- 💬 [Solana Discord](https://discord.gg/solana)

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**⚠️ 免责声明**: 这是教育项目的测试代码，请在正式部署前进行充分的安全审计。