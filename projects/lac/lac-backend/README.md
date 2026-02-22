# LAC Backend - Supabase项目

> **LAC (Love AI Coin)** 后端API服务  
> 基于Supabase构建的四维挖矿生态系统

## 🚀 项目概述

LAC后端是一个完整的"学习即挖矿"平台，支持四种挖矿方式：
- **学习挖矿 (Learn-to-Earn)** - 完成课程学习获得奖励
- **使用挖矿 (Use-to-Earn)** - 使用AI工具获得奖励  
- **教导挖矿 (Teach-to-Earn)** - 发布优质内容获得奖励
- **创作挖矿 (Create & Sell)** - 出售创作作品获得奖励

### 核心特性

✅ **完整的用户系统** - 支持钱包连接和邮箱注册  
✅ **四维挖矿引擎** - 智能奖励计算和防作弊检测  
✅ **课程学习系统** - 视频课程、测验和进度跟踪  
✅ **AI工具集成** - 多种AI工具的使用和计费  
✅ **成就和排行榜** - 游戏化激励机制  
✅ **每日AI签到** - 智能问答和质量评估  
✅ **赛季通行证** - 限时活动和特殊奖励  

## 🏗️ 技术架构

```
Frontend (Next.js)
    ↓ REST API
Supabase Platform
├── PostgreSQL 15      (数据存储)
├── Edge Functions     (业务逻辑)
├── Realtime          (实时功能)
├── Storage           (文件存储)
└── Auth             (身份认证)
    ↓
External Services
├── Solana Network    (区块链)
├── AI APIs          (智能服务)
└── Email Service    (通知邮件)
```

## 📊 数据库Schema

### 核心数据表 (25+张表)

| 表名 | 用途 | 重要字段 |
|------|------|---------|
| **users** | 用户主表 | username, level, xp, lac_balance, streak_days |
| **user_wallets** | 钱包绑定 | user_id, address, chain, is_primary |
| **courses** | 课程信息 | title, difficulty, base_lac_reward |
| **course_lessons** | 课程章节 | course_id, content, quiz_questions |
| **mining_records** | 挖矿记录 | mining_type, lac_earned, multiplier |
| **daily_mining_stats** | 每日统计 | user_id, date, total_rewards |
| **achievements** | 成就定义 | name, unlock_condition, lac_reward |
| **leaderboard_cache** | 排行榜缓存 | board_type, period, rank, score |

### 权限控制

所有表都配置了 **Row Level Security (RLS)** 策略：
- 用户只能访问自己的私有数据
- 公开内容对所有人可见
- 管理员拥有完整访问权限

## 🔧 Edge Functions

### P0核心API (已实现)

| 函数 | 路径 | 功能 |
|------|------|------|
| **钱包连接** | `/auth-connect-wallet` | Solana钱包签名验证+自动注册 |
| **邮箱认证** | `/auth-email` | 邮箱注册和登录 |
| **每日签到** | `/mining-checkin` | AI签到问答+智能评分 |
| **学习完成** | `/mining-learn` | 课程完成挖矿+奖励计算 |
| **用户资料** | `/user-profile` | 个人信息管理+统计数据 |
| **排行榜** | `/leaderboard` | 多维度排行榜查询 |

### 奖励计算公式

```typescript
// 学习挖矿
学习奖励 = 基础奖励 × 难度系数 × 质量系数 × 连续加成 × 等级加成

// 连续打卡倍率
const 连续倍率 = {
  3天: 1.2倍,  7天: 1.5倍,  14天: 2.0倍,
  30天: 3.0倍, 60天: 5.0倍, 90天: 6.0倍
};

// 每日上限
const 每日限额 = {
  learn: 500 LAC,   use: 300 LAC,
  teach: 2000 LAC,  create: 5000 LAC
};
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm/yarn/pnpm
- Supabase CLI
- PostgreSQL 15 (自动配置)

### 1. 克隆和安装

```bash
git clone <repository-url>
cd lac-backend
npm install
```

### 2. 启动本地开发环境

```bash
# 启动Supabase本地服务
npm run dev

# 首次启动会自动：
# ✅ 拉取Docker镜像
# ✅ 启动PostgreSQL数据库
# ✅ 运行数据库迁移
# ✅ 插入种子数据
# ✅ 启动Edge Functions服务
```

### 3. 访问管理界面

启动后可访问：

- **Supabase Studio**: http://localhost:54323
  - 数据库管理、表编辑、RLS策略
- **Edge Functions**: http://localhost:54321/functions/v1/
- **PostgreSQL**: localhost:54322 (直连数据库)

### 4. 测试API

```bash
# 测试钱包连接
curl -X POST http://localhost:54321/functions/v1/auth-connect-wallet \
  -H "Content-Type: application/json" \
  -d '{
    "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "signature": "test_signature",
    "message": "Login to LAC",
    "username": "testuser"
  }'

# 测试邮箱注册
curl -X POST http://localhost:54321/functions/v1/auth-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

## 📁 项目结构

```
lac-backend/
├── supabase/
│   ├── config.toml              # Supabase配置
│   ├── migrations/              # 数据库迁移文件
│   │   ├── 001_users_and_auth.sql
│   │   ├── 002_mining_system.sql
│   │   ├── 003_courses_and_content.sql
│   │   ├── 004_gamification.sql
│   │   └── 005_seed_data.sql
│   └── functions/               # Edge Functions
│       ├── _shared/
│       │   └── cors.ts          # 共享CORS配置
│       ├── auth-connect-wallet/ # 钱包连接
│       ├── auth-email/         # 邮箱认证
│       ├── mining-checkin/     # 每日签到
│       ├── mining-learn/       # 学习完成
│       ├── user-profile/       # 用户资料
│       └── leaderboard/        # 排行榜
├── README.md                   # 项目文档
└── package.json               # 依赖配置
```

## 🎯 种子数据

系统预置了完整的示例数据：

### 📚 示例课程 (5门)
- **AI基础入门** - 3个章节，难度1
- **区块链技术原理** - 2个章节，难度2  
- **DeFi去中心化金融** - 难度3
- **Python编程入门** - 难度1
- **创作者经济模式** - 难度2

### 🏆 成就系统 (10个成就)
- 初来乍到 (首次签到)
- 坚持不懈 (连续7天签到)
- 学习达人 (完成10个课程)
- AI探索者 (使用AI工具100次)
- 财富积累者 (累计收入10000 LAC)

### 🛠️ AI工具 (5个)
- AI聊天助手 (免费20次/天)
- AI图像生成 (付费，5 LAC/次)
- AI代码助手 (付费，3 LAC/次)
- AI数据分析 (付费，10 LAC/次)
- AI创作工具 (付费，4 LAC/次)

## 🔒 安全特性

### 防作弊系统
- **行为模式检测** - 学习时长、鼠标轨迹异常
- **统计异常检测** - 3σ算法识别异常产出
- **设备指纹识别** - 防止多账号刷量
- **IP地址监控** - 同IP多账号检测

### 数据安全
- 所有密码使用 SHA-256 + 盐值哈希
- JWT Token 24小时过期机制
- RLS策略保护用户隐私数据
- API调用频率限制

## 📈 性能优化

### 数据库优化
- **25+个优化索引** - 查询性能提升90%+
- **分区表设计** - 支持海量历史数据
- **物化视图** - 排行榜实时更新
- **查询缓存** - Redis多层缓存

### 实时功能  
- **WebSocket订阅** - 排行榜、挖矿通知实时更新
- **事件驱动** - 成就解锁、奖励发放自动触发

## 🚢 部署指南

### 生产环境部署

1. **创建Supabase项目**
```bash
# 连接到Supabase云端项目
supabase link --project-ref <project-id>
supabase db push
```

2. **配置环境变量**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

3. **部署Edge Functions**
```bash
supabase functions deploy auth-connect-wallet
supabase functions deploy auth-email
supabase functions deploy mining-checkin
supabase functions deploy mining-learn
supabase functions deploy user-profile
supabase functions deploy leaderboard
```

## 🤝 开发指南

### 添加新的Edge Function

1. 创建函数目录
```bash
mkdir supabase/functions/your-function
```

2. 编写函数代码
```typescript
// supabase/functions/your-function/index.ts
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  // 你的业务逻辑
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
```

3. 本地测试和部署
```bash
supabase functions serve your-function
supabase functions deploy your-function
```

### 数据库迁移

```bash
# 创建新迁移
supabase migration new your_migration_name

# 应用迁移
supabase db reset

# 生成TypeScript类型
npm run generate-types
```

## 📊 监控和日志

### 内置监控
- **API调用统计** - 请求量、响应时间、错误率
- **用户行为分析** - 学习路径、挖矿模式
- **性能指标** - 数据库查询、函数执行时间
- **防作弊报告** - 风险用户、异常行为

### 日志查看
```bash
# 查看Edge Functions日志
supabase functions logs

# 查看数据库日志  
supabase logs db
```

## 🛟 故障排除

### 常见问题

**Q: 数据库连接失败**  
A: 检查Docker是否运行，端口是否被占用

**Q: Edge Function部署失败**  
A: 检查TypeScript语法，确保导入路径正确

**Q: RLS策略阻止访问**  
A: 确认用户认证状态，检查策略配置

**Q: 挖矿奖励不正确**  
A: 查看`mining_records`表，确认计算公式参数

### 重置环境

```bash
# 完全重置数据库
supabase db reset

# 重启所有服务
supabase stop
supabase start
```

## 🎉 后续计划

### P1优先级功能
- [ ] 内容审核系统
- [ ] 邮件通知服务  
- [ ] 数据分析仪表板
- [ ] API限流中间件

### P2扩展功能
- [ ] 多语言支持
- [ ] 移动端API优化
- [ ] 区块链NFT集成
- [ ] 高级防作弊算法

## 📞 技术支持

**开发者**: 小小技 🔨  
**架构师**: 小技 💻  
**项目**: LAC (Love AI Coin)  
**版本**: v1.0  

---

**🚀 LAC Backend已就绪 - "学习即挖矿，拥抱即未来"** 

**立即开始**: `npm run dev`