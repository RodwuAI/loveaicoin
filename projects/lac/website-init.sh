#!/bin/bash

# LAC网站项目初始化脚本
# 作者: 小技 (tr-coder)
# 日期: 2026-02-21
# 用途: 一键初始化LAC网站项目结构

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 版本过低，需要 18+，当前版本: $(node -v)"
        exit 1
    fi
    
    # 检查 Yarn
    if ! command -v yarn &> /dev/null; then
        log_warning "Yarn 未安装，正在安装..."
        npm install -g yarn
    fi
    
    log_success "系统依赖检查通过"
}

# 项目初始化
init_project() {
    log_info "初始化 Next.js 项目..."
    
    # 获取项目名称
    read -p "请输入项目名称 (默认: lac-website): " PROJECT_NAME
    PROJECT_NAME=${PROJECT_NAME:-lac-website}
    
    # 检查目录是否存在
    if [ -d "$PROJECT_NAME" ]; then
        log_warning "目录 $PROJECT_NAME 已存在"
        read -p "是否删除并重新创建? (y/N): " CONFIRM
        if [[ $CONFIRM =~ ^[Yy]$ ]]; then
            rm -rf "$PROJECT_NAME"
        else
            log_error "项目初始化取消"
            exit 1
        fi
    fi
    
    # 创建 Next.js 项目
    npx create-next-app@latest $PROJECT_NAME \
        --typescript \
        --tailwind \
        --eslint \
        --app \
        --src-dir \
        --import-alias "@/*" \
        --use-yarn
    
    cd $PROJECT_NAME
    log_success "Next.js 项目创建完成"
}

# 安装依赖包
install_dependencies() {
    log_info "安装项目依赖..."
    
    # 核心依赖
    yarn add \
        next-intl@^3.9.0 \
        @solana/wallet-adapter-react@^0.15.0 \
        @solana/wallet-adapter-react-ui@^0.9.0 \
        @solana/wallet-adapter-wallets@^0.19.0 \
        @solana/web3.js@^1.95.0 \
        @tanstack/react-query@^5.0.0 \
        zustand@^4.5.0 \
        framer-motion@^11.0.0 \
        clsx@^2.1.0 \
        tailwind-merge@^2.2.0 \
        lucide-react@^0.344.0
    
    # 开发依赖
    yarn add -D \
        @types/node@^20.0.0 \
        @next/bundle-analyzer@^15.0.0 \
        prettier@^3.2.0 \
        prettier-plugin-tailwindcss@^0.5.0 \
        @tailwindcss/typography@^0.5.0 \
        @tailwindcss/forms@^0.5.0
    
    log_success "依赖包安装完成"
}

# 创建目录结构
create_directory_structure() {
    log_info "创建项目目录结构..."
    
    # 创建主要目录
    mkdir -p src/{app,components,lib,hooks,store,types,styles}
    mkdir -p src/components/{layout,ui,wallet,i18n,pages}
    mkdir -p src/components/pages/{home,learn,tasks,wallet}
    mkdir -p public/{images,icons,locales}
    mkdir -p public/locales/{en,zh}
    
    log_success "目录结构创建完成"
}

# 创建配置文件
create_config_files() {
    log_info "创建配置文件..."
    
    # Tailwind CSS 配置
    cat > tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}

export default config
EOF

    # Next.js 配置
    cat > next.config.js << 'EOF'
const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['localhost', 'api.lac.ai'],
    formats: ['image/webp', 'image/avif'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
}

module.exports = withNextIntl(nextConfig);
EOF

    # TypeScript 配置
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

    # Prettier 配置
    cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
EOF

    # ESLint 配置
    cat > .eslintrc.json << 'EOF'
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "warn",
    "no-console": "warn",
    "@next/next/no-img-element": "error"
  }
}
EOF

    # 环境变量模板
    cat > .env.example << 'EOF'
# 应用环境
NEXT_PUBLIC_APP_ENV=development

# API 配置
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1

# Solana 配置
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# 网站配置
NEXT_PUBLIC_SITE_NAME=LAC
NEXT_PUBLIC_SITE_DESCRIPTION=Love AI Coin - Web3 AI Learning Platform
NEXT_PUBLIC_SITE_URL=https://lac.ai
EOF

    cp .env.example .env.local
    
    log_success "配置文件创建完成"
}

# 创建基础组件
create_base_components() {
    log_info "创建基础组件..."
    
    # Button 组件
    cat > src/components/ui/Button.tsx << 'EOF'
import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}) => {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white border-transparent',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export { Button };
EOF

    # Card 组件
    cat > src/components/ui/Card.tsx << 'EOF'
import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-white border border-gray-200',
    bordered: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-lg border border-gray-100',
  };

  return (
    <div
      className={clsx(
        'rounded-lg p-6 transition-shadow duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card };
EOF

    # Header 组件
    cat > src/components/layout/Header.tsx << 'EOF'
'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  locale: string;
}

const Header: React.FC<HeaderProps> = ({ locale }) => {
  const t = useTranslations('common');

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LAC</span>
              </div>
              <span className="font-bold text-xl text-gray-900">LAC</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.about')}
            </Link>
            <Link href="/learn" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.learn')}
            </Link>
            <Link href="/tasks" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.tasks')}
            </Link>
            <Link href="/community" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.community')}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              {locale === 'zh' ? '中文' : 'English'}
            </Button>
            <Button variant="primary" size="sm">
              {t('wallet.connect')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export { Header };
EOF

    log_success "基础组件创建完成"
}

# 创建国际化文件
create_i18n_files() {
    log_info "创建国际化文件..."
    
    # 中文语言包
    cat > public/locales/zh/common.json << 'EOF'
{
  "nav": {
    "home": "首页",
    "about": "关于",
    "whitepaper": "白皮书",
    "learn": "学习中心",
    "tasks": "任务中心",
    "community": "社区",
    "wallet": "钱包"
  },
  "wallet": {
    "connect": "连接钱包",
    "connected": "已连接",
    "disconnect": "断开连接",
    "balance": "余额",
    "address": "地址"
  },
  "common": {
    "loading": "加载中...",
    "error": "错误",
    "retry": "重试",
    "confirm": "确认",
    "cancel": "取消",
    "save": "保存",
    "edit": "编辑",
    "delete": "删除",
    "view": "查看",
    "close": "关闭"
  },
  "home": {
    "title": "欢迎来到 LAC",
    "subtitle": "拥抱AI变革，获得学习奖励",
    "description": "LAC是一个鼓励人类学习AI、拥抱AI变革的Web3激励平台",
    "getStarted": "开始学习",
    "learnMore": "了解更多"
  }
}
EOF

    # 英文语言包
    cat > public/locales/en/common.json << 'EOF'
{
  "nav": {
    "home": "Home",
    "about": "About",
    "whitepaper": "Whitepaper",
    "learn": "Learn",
    "tasks": "Tasks",
    "community": "Community",
    "wallet": "Wallet"
  },
  "wallet": {
    "connect": "Connect Wallet",
    "connected": "Connected",
    "disconnect": "Disconnect",
    "balance": "Balance",
    "address": "Address"
  },
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "retry": "Retry",
    "confirm": "Confirm",
    "cancel": "Cancel",
    "save": "Save",
    "edit": "Edit",
    "delete": "Delete",
    "view": "View",
    "close": "Close"
  },
  "home": {
    "title": "Welcome to LAC",
    "subtitle": "Embrace AI Revolution, Earn Learning Rewards",
    "description": "LAC is a Web3 incentive platform that encourages humans to learn AI and embrace the AI revolution",
    "getStarted": "Get Started",
    "learnMore": "Learn More"
  }
}
EOF

    # i18n 配置
    cat > src/i18n.ts << 'EOF'
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'zh'];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../public/locales/${locale}/common.json`)).default
  };
});
EOF

    # 中间件
    cat > src/middleware.ts << 'EOF'
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
EOF

    log_success "国际化文件创建完成"
}

# 创建基础页面
create_base_pages() {
    log_info "创建基础页面..."
    
    # 根布局
    cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LAC - Love AI Coin',
  description: 'Web3 AI Learning Platform',
  keywords: 'AI, Web3, Learning, Cryptocurrency, Solana',
  authors: [{ name: 'LAC Team' }],
  creator: 'LAC Team',
  publisher: 'LAC',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
EOF

    # 国际化布局
    mkdir -p src/app/\[locale\]
    cat > "src/app/[locale]/layout.tsx" << 'EOF'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Header } from '@/components/layout/Header';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen bg-gray-50">
        <Header locale={locale} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </NextIntlClientProvider>
  );
}
EOF

    # 首页
    cat > "src/app/[locale]/page.tsx" << 'EOF'
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="primary">
              {t('getStarted')}
            </Button>
            <Button size="lg" variant="ghost">
              {t('learnMore')}
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="elevated">
            <h3 className="text-xl font-semibold mb-4">AI 学习</h3>
            <p className="text-gray-600">通过完成AI相关课程和任务获得奖励</p>
          </Card>
          
          <Card variant="elevated">
            <h3 className="text-xl font-semibold mb-4">Web3 挖矿</h3>
            <p className="text-gray-600">参与学习挖矿，获得LAC代币奖励</p>
          </Card>
          
          <Card variant="elevated">
            <h3 className="text-xl font-semibold mb-4">社区互动</h3>
            <p className="text-gray-600">与全球AI学习者交流经验和见解</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
EOF

    log_success "基础页面创建完成"
}

# 更新 package.json scripts
update_package_scripts() {
    log_info "更新 package.json 脚本..."
    
    # 读取并更新 package.json
    cat package.json | jq '.scripts.build = "next build" | .scripts.analyze = "ANALYZE=true next build" | .scripts.type-check = "tsc --noEmit"' > package.json.tmp && mv package.json.tmp package.json
    
    log_success "package.json 脚本更新完成"
}

# 初始化 Git
init_git() {
    log_info "初始化 Git 仓库..."
    
    # 创建 .gitignore
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Production
build/
dist/
.next/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# ESLint cache
.eslintcache

# Prettier cache
.prettiercache

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Local development
.vercel

# Bundle analysis
.analyze/
EOF

    git init
    git add .
    git commit -m "feat: initial project setup with Next.js, TypeScript, and i18n"
    
    log_success "Git 仓库初始化完成"
}

# 生成项目说明文档
create_readme() {
    log_info "生成项目文档..."
    
    cat > README.md << 'EOF'
# LAC Website

> Love AI Coin 官方网站 - Web3 AI 学习激励平台

## 🚀 技术栈

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 3.4
- **Animation**: Framer Motion 11
- **State**: Zustand 4.5 + React Query 5
- **i18n**: next-intl 3.9 (中英双语)
- **Web3**: Solana Wallet Adapter
- **Deploy**: Vercel

## 📦 快速开始

### 环境要求

- Node.js 18+
- Yarn 1.22+

### 安装依赖

```bash
yarn install
```

### 环境配置

```bash
cp .env.example .env.local
# 编辑 .env.local 配置必要的环境变量
```

### 开发服务器

```bash
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看网站

### 构建部署

```bash
# 类型检查
yarn type-check

# 构建生产版本
yarn build

# 启动生产服务器
yarn start

# 分析打包大小
yarn analyze
```

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   └── [locale]/          # 国际化路由
├── components/            # React 组件
│   ├── layout/           # 布局组件
│   ├── ui/              # 基础 UI 组件
│   ├── wallet/          # 钱包相关组件
│   └── pages/           # 页面专属组件
├── lib/                   # 工具函数库
├── hooks/                # 自定义 React Hooks
├── store/                # 状态管理 (Zustand)
├── types/                # TypeScript 类型定义
└── styles/               # 全局样式文件
```

## 🌍 国际化

支持中文 (zh) 和英文 (en) 双语：

- 语言文件：`public/locales/[locale]/common.json`
- 路由前缀：`/zh/*` 和 `/en/*`
- 自动检测浏览器语言偏好

## 🔗 Web3 集成

支持 Solana 主流钱包：

- Phantom
- Solflare  
- Backpack
- Torus
- Sollet

## 📋 开发规范

### 分支管理

```bash
main            # 生产环境
develop         # 开发环境
feature/*       # 功能开发
fix/*          # 问题修复
release/*      # 版本发布
```

### 提交规范

```bash
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式
refactor: 代码重构
test: 测试相关
chore: 工具配置
```

### 代码风格

- TypeScript 严格模式
- Prettier + ESLint 自动格式化
- Tailwind CSS 原子化样式
- 组件优先，可复用设计

## 🎯 MVP 目标 (2026-03-02)

- [x] 项目搭建和基础配置
- [x] 响应式布局和 UI 组件库
- [x] 国际化支持 (中英双语)
- [x] 首页 Landing Page
- [ ] 钱包连接和资产展示
- [ ] 学习中心基础功能
- [ ] 任务系统和挖矿面板
- [ ] 用户认证和 API 集成

## 📚 相关文档

- [技术架构设计](./docs/tech-spec.md)
- [API 接口文档](./docs/api.md)
- [部署指南](./docs/deployment.md)
- [贡献指南](./CONTRIBUTING.md)

## 🔧 故障排除

### 常见问题

1. **Node.js 版本问题**
   ```bash
   node --version  # 确保 >= 18.0.0
   ```

2. **依赖安装失败**
   ```bash
   rm -rf node_modules yarn.lock
   yarn install
   ```

3. **TypeScript 错误**
   ```bash
   yarn type-check
   ```

4. **样式不生效**
   ```bash
   # 检查 Tailwind 配置
   yarn dev
   ```

## 📄 许可证

Copyright © 2026 LAC Team. All rights reserved.

---

**开发团队**: 小技 (tr-coder) | **项目启动**: 2026-02-21 | **目标上线**: 2026-03-02
EOF

    log_success "项目文档创建完成"
}

# 主函数
main() {
    echo -e "${BLUE}"
    echo "============================================="
    echo "     LAC 网站项目初始化脚本 v1.0"
    echo "     作者: 小技 (tr-coder)"  
    echo "     日期: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "============================================="
    echo -e "${NC}"

    # 执行初始化步骤
    check_dependencies
    init_project
    install_dependencies
    create_directory_structure
    create_config_files
    create_base_components
    create_i18n_files
    create_base_pages
    update_package_scripts
    init_git
    create_readme

    echo -e "${GREEN}"
    echo "============================================="
    echo "🎉 项目初始化完成！"
    echo ""
    echo "📁 项目目录: $(pwd)"
    echo "🌐 开发服务器: yarn dev"
    echo "📖 项目文档: README.md"
    echo ""
    echo "🚀 下一步:"
    echo "   1. cd $PROJECT_NAME"
    echo "   2. 编辑 .env.local 配置环境变量"
    echo "   3. yarn dev 启动开发服务器"
    echo "   4. 访问 http://localhost:3000"
    echo ""
    echo "📅 目标上线: 2026-03-02"
    echo "💼 技术支持: 小技 (tr-coder)"
    echo "============================================="
    echo -e "${NC}"
}

# 运行主函数
main "$@"