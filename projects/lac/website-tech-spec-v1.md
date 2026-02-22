# LAC网站技术架构设计文档

> **项目：** LAC (Love AI Coin) 官方网站  
> **版本：** v1.0  
> **日期：** 2026-02-21  
> **目标上线：** 2026-03-02  
> **负责人：** 小技 (tr-coder)

## 1. 技术栈确认

### 1.1 核心框架
- **Next.js 15.1** - 最新稳定版，支持App Router，SSG/SSR性能优异
- **React 18.3** - 配合Next.js 15，支持并发特性
- **TypeScript 5.7** - 类型安全，团队协作必备
- **Node.js 18+** - LTS版本，稳定可靠

**选择理由：** Next.js 15的App Router提供更好的性能和开发体验，对SEO友好，符合3月2日快速上线要求。

### 1.2 样式与动画
- **Tailwind CSS 3.4** - 原子化CSS，开发效率高，与Phantom风格匹配
- **Framer Motion 11** - React动画库，丰富的交互效果
- **clsx** - 条件样式处理
- **tailwind-merge** - Tailwind类冲突解决

**选择理由：** Tailwind的utility-first理念适合快速构建Phantom风格的简洁界面，Framer Motion提供专业级动画效果。

### 1.3 状态管理
- **Zustand 4.5** - 轻量级状态管理，学习成本低
- **React Query (TanStack Query) 5** - 服务端状态管理，缓存优化

**选择理由：** MVP阶段避免Redux的复杂性，Zustand足够满足需求，React Query专门处理API数据。

### 1.4 国际化 (i18n)
- **next-intl 3.9** - Next.js专用i18n解决方案
- **支持语言：** 中文(zh)、英文(en)
- **路由策略：** 子路径 (/zh, /en)

**选择理由：** next-intl与Next.js App Router完美集成，支持服务端渲染，SEO友好。

### 1.5 Web3钱包集成
- **@solana/wallet-adapter-react 0.15** - Solana官方钱包适配器
- **@solana/wallet-adapter-wallets 0.19** - 支持多钱包
- **支持钱包：** Phantom、Solflare、Backpack、Sollet、Torus
- **@solana/web3.js 1.95** - Solana区块链交互

**选择理由：** Solana生态标准方案，支持主流钱包，用户体验良好。

### 1.6 部署方案
- **主部署：** Vercel - Next.js原生支持，全球CDN，零配置
- **备选：** Netlify - 备用部署环境
- **域名：** 建议 lac.ai 或 loveai.coin
- **CDN：** Vercel Edge Network + Cloudflare (备选)

**选择理由：** Vercel对Next.js优化最佳，部署简单，支持自动预览，适合快速迭代。

## 2. 项目目录结构

```
lac-website/
├── README.md
├── next.config.js                 # Next.js配置
├── tailwind.config.js            # Tailwind配置
├── tsconfig.json                  # TypeScript配置
├── package.json
├── yarn.lock
├── .env.local                     # 环境变量
├── .env.example                   # 环境变量模板
├── .gitignore
├── .eslintrc.json                 # ESLint配置
├── .prettierrc                    # Prettier配置
├── public/                        # 静态资源
│   ├── favicon.ico
│   ├── icons/                     # 图标集
│   ├── images/                    # 图片资源
│   └── locales/                   # 国际化文件
│       ├── en/
│       │   └── common.json
│       └── zh/
│           └── common.json
└── src/
    ├── app/                       # App Router页面
    │   ├── [locale]/              # 国际化路由
    │   │   ├── layout.tsx         # 根布局
    │   │   ├── page.tsx           # 首页
    │   │   ├── about/
    │   │   │   └── page.tsx
    │   │   ├── whitepaper/
    │   │   │   └── page.tsx
    │   │   ├── learn/
    │   │   │   ├── page.tsx
    │   │   │   └── [slug]/
    │   │   │       └── page.tsx
    │   │   ├── tasks/
    │   │   │   └── page.tsx
    │   │   ├── ai-board/
    │   │   │   └── page.tsx
    │   │   ├── community/
    │   │   │   └── page.tsx
    │   │   └── wallet/
    │   │       └── page.tsx
    │   ├── globals.css            # 全局样式
    │   ├── layout.tsx             # 全局布局
    │   └── middleware.ts          # 中间件(i18n)
    ├── components/                # 组件库
    │   ├── layout/                # 布局组件
    │   │   ├── Header.tsx
    │   │   ├── Footer.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── Navigation.tsx
    │   ├── ui/                    # 基础UI组件
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Input.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Avatar.tsx
    │   │   ├── Loading.tsx
    │   │   └── Toast.tsx
    │   ├── wallet/                # 钱包相关
    │   │   ├── WalletButton.tsx
    │   │   ├── WalletModal.tsx
    │   │   └── WalletProvider.tsx
    │   ├── i18n/                  # 国际化组件
    │   │   ├── LanguageSwitcher.tsx
    │   │   └── LocaleProvider.tsx
    │   └── pages/                 # 页面专属组件
    │       ├── home/
    │       │   ├── Hero.tsx
    │       │   ├── Features.tsx
    │       │   └── TokenStats.tsx
    │       ├── learn/
    │       │   ├── CourseCard.tsx
    │       │   └── ProgressBar.tsx
    │       ├── tasks/
    │       │   ├── TaskBoard.tsx
    │       │   ├── MiningPanel.tsx
    │       │   └── RewardTracker.tsx
    │       └── wallet/
    │           ├── AssetList.tsx
    │           ├── TransactionHistory.tsx
    │           └── BalanceCard.tsx
    ├── lib/                       # 工具函数
    │   ├── utils.ts               # 通用工具
    │   ├── constants.ts           # 常量定义
    │   ├── validators.ts          # 数据验证
    │   ├── api.ts                 # API客户端
    │   ├── solana.ts              # Solana工具函数
    │   ├── auth.ts                # 认证逻辑
    │   └── storage.ts             # 本地存储
    ├── hooks/                     # 自定义Hooks
    │   ├── useWallet.ts           # 钱包Hook
    │   ├── useAuth.ts             # 认证Hook
    │   ├── useApi.ts              # API Hook
    │   └── useLocalStorage.ts     # 存储Hook
    ├── store/                     # 状态管理
    │   ├── authStore.ts           # 认证状态
    │   ├── walletStore.ts         # 钱包状态
    │   └── userStore.ts           # 用户状态
    ├── types/                     # 类型定义
    │   ├── index.ts               # 导出类型
    │   ├── api.ts                 # API类型
    │   ├── wallet.ts              # 钱包类型
    │   └── user.ts                # 用户类型
    └── styles/                    # 样式文件
        ├── globals.css            # 全局样式
        └── components.css         # 组件样式
```

## 3. 页面清单 (MVP功能)

### 3.1 核心页面 (3月2日必上线)

| 页面 | 路径 | 功能描述 | 优先级 |
|------|------|----------|--------|
| 首页 | `/` | Landing Page，品牌展示，核心价值主张 | P0 |
| 关于 | `/about` | 项目介绍，团队信息，愿景使命 | P0 |
| 白皮书 | `/whitepaper` | 技术文档，代币经济模型 | P0 |
| 钱包 | `/wallet` | 连接钱包，查看资产，基础交易 | P0 |

### 3.2 功能页面 (MVP阶段)

| 页面 | 路径 | 功能描述 | 优先级 |
|------|------|----------|--------|
| 学习中心 | `/learn` | AI学习资源，教程列表 | P1 |
| 任务中心 | `/tasks` | 挖矿面板，任务列表，奖励追踪 | P1 |
| AI签到板 | `/ai-board` | 签到系统，积分展示 | P1 |
| 社区 | `/community` | 社区动态，用户互动 (简化版) | P2 |

### 3.3 页面功能矩阵

```
首页 (/)
├── Hero区域 - 主要价值主张
├── 特性展示 - 3-4个核心亮点
├── 代币统计 - 实时数据展示
├── 路线图 - 发展规划
└── CTA按钮 - 连接钱包/开始学习

关于 (/about)
├── 项目愿景 - Why LAC exists
├── 团队介绍 - 核心成员
├── 技术优势 - AI + Web3
└── 合作伙伴 - 生态合作

白皮书 (/whitepaper)
├── PDF嵌入 - 在线查看
├── 章节导航 - 快速定位
├── 下载功能 - 本地保存
└── 版本历史 - 更新记录

钱包 (/wallet)
├── 连接状态 - 钱包连接/断开
├── 资产展示 - LAC代币余额
├── 交易历史 - 最近交易
└── 接收/发送 - 基础功能

学习中心 (/learn)
├── 课程分类 - AI基础/进阶/应用
├── 学习路径 - 推荐学习顺序
├── 进度追踪 - 完成情况
└── 奖励机制 - 学习激励

任务中心 (/tasks)
├── 任务列表 - 可领取任务
├── 挖矿面板 - 算力展示
├── 奖励统计 - 收益追踪
└── 排行榜 - 用户排名

AI签到板 (/ai-board)
├── 签到按钮 - 每日签到
├── 签到历史 - 签到记录
├── 积分展示 - 当前积分
└── 奖励兑换 - 积分商城

社区 (/community)
├── 公告板 - 官方公告
├── 用户动态 - 社区分享 (简化)
├── 讨论区 - 基础论坛功能
└── 活动日历 - 社区活动
```

## 4. 组件架构

### 4.1 组件层次结构

```
App Component Tree
├── Layout Components (全局)
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   ├── LanguageSwitcher
│   │   └── WalletButton
│   └── Footer
│       ├── Links
│       ├── SocialIcons
│       └── Copyright
├── Page Components (页面级)
│   ├── Home
│   │   ├── Hero
│   │   ├── Features
│   │   ├── TokenStats
│   │   └── Roadmap
│   ├── Wallet
│   │   ├── WalletConnect
│   │   ├── AssetList
│   │   ├── TransactionHistory
│   │   └── SendReceive
│   └── Tasks
│       ├── TaskBoard
│       ├── MiningPanel
│       └── RewardTracker
└── UI Components (基础)
    ├── Button (variants: primary, secondary, ghost)
    ├── Card (variants: default, bordered, elevated)
    ├── Modal (variants: small, medium, large)
    ├── Input (variants: text, number, search)
    ├── Badge (variants: success, warning, error)
    └── Loading (variants: spinner, skeleton)
```

### 4.2 组件设计原则

**1. 组件职责单一**
```typescript
// ✅ 好的设计 - 职责单一
const WalletBalance = ({ balance, symbol }) => (
  <div className="wallet-balance">
    {balance} {symbol}
  </div>
);

// ❌ 避免 - 职责混杂
const WalletDashboard = () => (
  <div>
    <Balance />
    <History />
    <SendForm />
    <ReceiveModal />
  </div>
);
```

**2. Props接口明确**
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

**3. 样式组合化**
```typescript
const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  ghost: 'hover:bg-gray-100 text-gray-600'
};
```

### 4.3 全局组件详细设计

**Header组件**
```typescript
interface HeaderProps {
  locale: string;
  isWalletConnected: boolean;
}

const Header: FC<HeaderProps> = ({ locale, isWalletConnected }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />
          <Navigation locale={locale} />
          <div className="flex items-center space-x-4">
            <LanguageSwitcher locale={locale} />
            <WalletButton isConnected={isWalletConnected} />
          </div>
        </div>
      </div>
    </header>
  );
};
```

**WalletButton组件**
```typescript
interface WalletButtonProps {
  isConnected: boolean;
  address?: string;
  balance?: number;
  onConnect: () => void;
  onDisconnect: () => void;
}
```

## 5. API设计 (简要)

### 5.1 API架构
- **API类型：** RESTful API + WebSocket (实时数据)
- **基础URL：** `https://api.lac.ai/v1`
- **认证方式：** JWT Token + 钱包签名验证
- **数据格式：** JSON

### 5.2 核心API端点

```typescript
// 用户认证
POST /auth/connect          // 连接钱包
POST /auth/verify           // 验证签名
POST /auth/refresh          // 刷新Token
DELETE /auth/disconnect     // 断开连接

// 用户信息
GET /users/profile          // 获取用户信息
PUT /users/profile          // 更新用户信息
GET /users/stats            // 用户统计数据

// 积分系统
GET /points/balance         // 积分余额
GET /points/history         // 积分历史
POST /points/checkin        // 签到获得积分
GET /points/leaderboard     // 积分排行榜

// 任务系统
GET /tasks                  // 获取任务列表
POST /tasks/:id/claim       // 领取任务
POST /tasks/:id/submit      // 提交任务
GET /tasks/:id/progress     // 任务进度

// 学习中心
GET /courses                // 课程列表
GET /courses/:id            // 课程详情
POST /courses/:id/enroll    // 报名课程
GET /courses/:id/progress   // 学习进度

// 挖矿系统
GET /mining/status          // 挖矿状态
POST /mining/start          // 开始挖矿
POST /mining/stop           // 停止挖矿
GET /mining/rewards         // 挖矿奖励

// 内容管理
GET /content/announcements  // 公告列表
GET /content/news          // 新闻资讯
GET /content/whitepaper    // 白皮书信息
```

### 5.3 WebSocket事件
```typescript
// 实时数据订阅
ws://api.lac.ai/ws

Events:
- price_update      // 代币价格更新
- mining_update     // 挖矿状态更新
- task_notification // 任务通知
- system_message    // 系统消息
```

### 5.4 数据类型定义
```typescript
interface User {
  id: string;
  address: string;
  username?: string;
  avatar?: string;
  points: number;
  level: number;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  status: 'available' | 'in_progress' | 'completed';
  deadline?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  difficulty: string;
  lessons: Lesson[];
  progress?: number;
}
```

## 6. 性能考量

### 6.1 渲染策略

**SSG (Static Site Generation)**
```typescript
// 适用页面：首页、关于、白皮书
// 构建时生成，CDN缓存，加载最快

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'zh' }
  ];
}

// 页面实现
const HomePage = async ({ params: { locale } }) => {
  const messages = await getMessages(locale);
  return <HomeContent messages={messages} />;
};

export default HomePage;
```

**SSR (Server-Side Rendering)**
```typescript
// 适用页面：任务中心、钱包、用户资料
// 每次请求生成，数据实时性好

const TasksPage = async ({ params: { locale } }) => {
  const tasks = await fetchTasks(); // 服务端获取数据
  return <TasksContent tasks={tasks} locale={locale} />;
};
```

**CSR (Client-Side Rendering)**
```typescript
// 适用：用户交互频繁的组件
// 钱包连接、实时图表、动态内容

const WalletDashboard = () => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchWalletData();
  }, []);
  
  return <div>...</div>;
};
```

### 6.2 图片优化策略

```typescript
// next/image 组件使用
import Image from 'next/image';

const OptimizedImage = () => (
  <Image
    src="/images/hero-bg.jpg"
    alt="LAC Hero Background"
    width={1920}
    height={1080}
    priority={true}           // 首屏图片优先加载
    placeholder="blur"        // 模糊占位符
    sizes="(max-width: 768px) 100vw, 50vw"  // 响应式尺寸
  />
);

// 图片规格标准
// - Hero images: 1920x1080 WebP
// - Card thumbnails: 400x300 WebP  
// - Avatars: 100x100 WebP
// - Icons: SVG format preferred
```

### 6.3 代码分割

```typescript
// 路由级代码分割 (自动)
const LazyTasksPage = dynamic(() => import('./tasks/page'), {
  loading: () => <Loading />,
  ssr: false
});

// 组件级代码分割
const LazyWalletModal = dynamic(() => import('@/components/wallet/WalletModal'), {
  loading: () => <div>Loading wallet...</div>
});

// 第三方库按需加载
const loadChartsLibrary = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};
```

### 6.4 缓存策略

```typescript
// API响应缓存
const fetchWithCache = async (url: string, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  });
};

// React Query缓存配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5分钟内认为数据新鲜
      cacheTime: 10 * 60 * 1000,    // 10分钟缓存时间
      refetchOnWindowFocus: false,   // 窗口聚焦不自动刷新
    }
  }
});
```

### 6.5 性能监控

```typescript
// Core Web Vitals监控
export function reportWebVitals(metric: any) {
  switch (metric.name) {
    case 'CLS':  // Cumulative Layout Shift
    case 'FID':  // First Input Delay  
    case 'FCP':  // First Contentful Paint
    case 'LCP':  // Largest Contentful Paint
    case 'TTFB': // Time to First Byte
      // 发送到分析服务
      console.log(metric);
      break;
  }
}
```

### 6.6 性能目标

| 指标 | 目标值 | 测量方式 |
|------|--------|----------|
| FCP | < 1.5s | Lighthouse |
| LCP | < 2.5s | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| FID | < 100ms | Real User Metrics |
| TTI | < 3s | Lighthouse |

## 7. 开发规范

### 7.1 命名规范

**文件命名**
```bash
# 组件文件 - PascalCase
Header.tsx
WalletButton.tsx
LanguageSwitcher.tsx

# Hook文件 - camelCase with 'use' prefix  
useWallet.ts
useAuth.ts
useLocalStorage.ts

# 工具文件 - camelCase
apiClient.ts
validators.ts
constants.ts

# 页面文件 - lowercase
page.tsx
layout.tsx
loading.tsx
error.tsx
```

**变量命名**
```typescript
// 常量 - SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.lac.ai/v1';
const WALLET_CONNECT_TIMEOUT = 10000;

// 变量和函数 - camelCase
const userBalance = 1000;
const isWalletConnected = false;
const handleConnectWallet = () => {};

// 组件 - PascalCase
const UserProfileCard = () => {};
const WalletConnectionModal = () => {};

// 类型和接口 - PascalCase
interface UserProfile {
  id: string;
  address: string;
}

type WalletStatus = 'connected' | 'disconnected' | 'connecting';
```

**CSS类命名 - Tailwind优先，必要时使用BEM**
```css
/* BEM命名规范 (仅在自定义CSS时使用) */
.wallet-button {}
.wallet-button--primary {}
.wallet-button--disabled {}
.wallet-button__icon {}
.wallet-button__text {}
```

### 7.2 代码结构规范

**组件结构**
```typescript
// 导入顺序：React -> 第三方库 -> 本地组件 -> 类型 -> 样式
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { useWallet } from '@/hooks/useWallet';

import type { WalletButtonProps } from '@/types/wallet';

interface Props extends WalletButtonProps {
  className?: string;
}

const WalletButton: React.FC<Props> = ({ 
  className,
  onConnect,
  ...props 
}) => {
  // 1. Hooks
  const { t } = useTranslation();
  const { isConnected, connect } = useWallet();
  
  // 2. State
  const [isLoading, setIsLoading] = useState(false);
  
  // 3. Effects
  useEffect(() => {
    // effect logic
  }, []);
  
  // 4. Handlers
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connect();
      onConnect?.();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 5. Render
  return (
    <Button
      variant="primary"
      loading={isLoading}
      onClick={handleConnect}
      className={className}
      {...props}
    >
      {isConnected ? t('wallet.connected') : t('wallet.connect')}
    </Button>
  );
};

export default WalletButton;
```

### 7.3 TypeScript规范

```typescript
// 严格的tsconfig.json配置
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// 接口定义规范
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface User {
  readonly id: string;           // 只读字段
  address: string;
  username?: string;             // 可选字段
  points: number;
  metadata: Record<string, any>; // 动态键值对
}

// 联合类型定义
type WalletStatus = 'idle' | 'connecting' | 'connected' | 'error';
type Theme = 'light' | 'dark' | 'auto';

// 泛型使用
function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  // implementation
}
```

### 7.4 Git分支策略

**分支命名规范**
```bash
# 主分支
main                    # 生产环境，受保护分支
develop                 # 开发环境，集成分支

# 功能分支 - feature/[功能描述]
feature/wallet-integration
feature/i18n-setup
feature/task-system

# 修复分支 - fix/[问题描述]  
fix/header-responsive-issue
fix/wallet-connection-timeout

# 发布分支 - release/[版本号]
release/v1.0.0
release/v1.1.0

# 热修复分支 - hotfix/[紧急问题]
hotfix/security-patch
hotfix/critical-bug-fix
```

**分支工作流**
```bash
# 1. 从develop创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/wallet-integration

# 2. 开发完成后提交
git add .
git commit -m "feat: implement wallet connection functionality"

# 3. 推送并创建Pull Request
git push origin feature/wallet-integration

# 4. Code Review通过后合并到develop
# 5. 发布时从develop创建release分支
# 6. 测试通过后合并到main并打tag
```

### 7.5 代码审查流程

**PR (Pull Request) 规范**
```markdown
## PR标题格式
feat: add wallet connection functionality
fix: resolve header responsive issue  
docs: update API documentation
refactor: improve component structure

## PR模板
### 📝 Description
What does this PR do?

### 🧪 Testing
- [ ] Unit tests pass
- [ ] Integration tests pass  
- [ ] Manual testing completed

### 📸 Screenshots
(if UI changes)

### ✅ Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log() statements
- [ ] TypeScript types defined
```

**Code Review清单**
- ✅ 代码风格一致性
- ✅ TypeScript类型安全
- ✅ 组件可复用性
- ✅ 性能影响评估
- ✅ 安全性检查
- ✅ 测试覆盖率
- ✅ 文档完整性

### 7.6 提交信息规范

```bash
# 格式：type(scope): description
# type: feat, fix, docs, style, refactor, test, chore
# scope: 影响范围 (可选)
# description: 简洁描述

feat(wallet): add Phantom wallet integration
fix(i18n): resolve translation loading issue  
docs(api): update endpoint documentation
style(ui): improve button hover states
refactor(hooks): extract common wallet logic
test(auth): add authentication unit tests
chore(deps): update dependencies to latest
```

### 7.7 开发环境配置

**必需工具**
```bash
# Node.js LTS (18+)
node --version

# Yarn包管理器
yarn --version

# VS Code扩展
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense  
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
```

**环境变量配置**
```bash
# .env.local (本地开发)
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# .env.production (生产环境)
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.lac.ai/v1
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## 📋 MVP交付清单 (3月2日目标)

### ✅ 必须完成 (P0)
- [x] 项目搭建和环境配置
- [x] 基础UI组件库 (Button, Card, Modal, Input)
- [x] 响应式布局 (Header, Footer, Navigation)  
- [x] 国际化支持 (中英双语切换)
- [x] 首页Landing Page (Hero, Features, TokenStats)
- [x] 关于页面 (项目介绍, 团队信息)
- [x] 白皮书页面 (PDF展示, 下载功能)
- [x] 基础钱包连接 (Phantom, Solflare, Backpack)
- [x] 钱包资产展示 (余额, 基础信息)

### 🔄 功能完善 (P1)  
- [ ] 学习中心 (课程列表, 基础功能)
- [ ] 任务中心 (任务列表, 简单挖矿面板)
- [ ] AI签到板 (签到功能, 积分展示)
- [ ] 用户认证系统 (钱包签名验证)
- [ ] API集成 (核心接口对接)

### 🚀 增强体验 (P2)
- [ ] 社区页面 (基础社区功能)
- [ ] 动画效果优化 (Framer Motion)
- [ ] 性能优化 (图片压缩, 代码分割)
- [ ] SEO优化 (Meta tags, 结构化数据)
- [ ] 错误处理和加载状态

### 📈 后续迭代
- [ ] 高级挖矿功能
- [ ] 社区互动增强  
- [ ] 移动端优化
- [ ] 数据分析集成
- [ ] 第三方集成扩展

---

**总结：** 本技术架构设计以"3月2日能上线"为核心目标，优先保证核心功能的实现，技术选型成熟稳定，开发流程规范高效。通过MVP优先策略确保按时交付，后续可基于用户反馈和业务需求持续迭代优化。