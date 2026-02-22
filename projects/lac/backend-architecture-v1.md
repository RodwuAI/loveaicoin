# LAC 后端API架构与数据库设计 v1.0

> **项目：** LAC (Love AI Coin) 后端架构设计  
> **版本：** v1.0  
> **日期：** 2026-02-21  
> **架构师：** 小技💻  
> **基于：** Supabase (PostgreSQL + Edge Functions + Realtime)

---

## 目录

1. [架构概览](#1-架构概览)
2. [API端点设计](#2-api端点设计)
3. [数据库Schema](#3-数据库schema)
4. [实时功能设计](#4-实时功能设计)
5. [Edge Functions](#5-edge-functions)
6. [挖矿奖励计算引擎](#6-挖矿奖励计算引擎)
7. [安全与权限](#7-安全与权限)
8. [性能优化](#8-性能优化)

---

## 1. 架构概览

### 1.1 技术栈选择

```
前端 (Next.js 15 + TypeScript)
    ↓ HTTP/REST API + WebSocket
Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime)
    ↓ 
区块链 (Solana Network)
    ↓
外部服务 (AI APIs, DEX APIs, 邮件服务)
```

**核心服务:**
- **Supabase Database:** PostgreSQL 15，主数据存储
- **Supabase Auth:** 钱包签名验证 + 传统邮箱登录
- **Supabase Storage:** 头像、课程素材、NFT元数据存储
- **Supabase Edge Functions:** 复杂业务逻辑、AI集成、区块链交互
- **Supabase Realtime:** 实时排行榜、挖矿状态、社交通知

### 1.2 模块化架构

| 模块 | 职责 | 优先级 |
|------|------|--------|
| **Auth** | 用户认证、钱包连接、权限管理 | 🔴 P0 |
| **User** | 用户信息、等级、成就、积分 | 🔴 P0 |
| **Mining** | 四维挖矿逻辑、奖励计算、防作弊 | 🔴 P0 |
| **Gamification** | 任务系统、排行榜、赛季管理 | 🔴 P0 |
| **Trading** | 创作者市场、拍卖、NFT、交易 | 🔴 P0 |
| **Community** | 师徒系统、团队挖矿、投票 | 🔴 P0 |
| **Content** | 课程管理、教学内容、AI工具 | 🔴 P0 |
| **Admin** | 后台管理、数据统计、系统监控 | 🟡 P1 |

---

## 2. API端点设计

### 2.1 认证模块 (Auth)

**基础路径:** `/api/v1/auth`

| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| POST | `/connect-wallet` | 钱包连接签名验证 | Public | `{signature, message, publicKey}` |
| POST | `/verify-signature` | 验证钱包签名 | Public | `{signature, message, address}` |
| POST | `/refresh-token` | 刷新访问令牌 | User | `{refreshToken}` |
| POST | `/email-signup` | 邮箱注册 | Public | `{email, username, password, inviteCode?}` |
| POST | `/email-signin` | 邮箱登录 | Public | `{email, password}` |
| POST | `/forgot-password` | 忘记密码 | Public | `{email}` |
| POST | `/reset-password` | 重置密码 | Public | `{token, newPassword}` |
| POST | `/logout` | 退出登录 | User | - |
| GET | `/me` | 获取当前用户信息 | User | - |

**响应格式:**
```typescript
interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    session: Session;
    accessToken: string;
    refreshToken: string;
  } | null;
  error?: string;
}
```

---

### 2.2 用户模块 (User)

**基础路径:** `/api/v1/users`

| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| GET | `/profile` | 获取个人资料 | User | - |
| PUT | `/profile` | 更新个人资料 | User | `{username, bio, avatar, socialLinks}` |
| GET | `/profile/:userId` | 获取他人资料 | User | - |
| GET | `/stats` | 获取用户统计数据 | User | - |
| GET | `/achievements` | 获取成就列表 | User | - |
| POST | `/achievements/claim` | 领取成就奖励 | User | `{achievementId}` |
| GET | `/level-progress` | 获取等级进度 | User | - |
| GET | `/wallet-assets` | 获取钱包资产信息 | User | - |
| POST | `/bind-wallet` | 绑定新钱包 | User | `{address, signature, message}` |
| DELETE | `/unbind-wallet` | 解绑钱包 | User | `{address}` |

**用户资料响应:**
```typescript
interface UserProfile {
  id: string;
  username: string;
  email?: string;
  bio?: string;
  avatar?: string;
  level: number;
  xp: number;
  lacBalance: number;
  pointsBalance: number;
  createdAt: string;
  updatedAt: string;
  wallets: Wallet[];
  achievements: Achievement[];
  socialLinks?: {
    twitter?: string;
    discord?: string;
    github?: string;
  };
}
```

---

### 2.3 挖矿模块 (Mining)

**基础路径:** `/api/v1/mining`

#### 学习挖矿 (Learn-to-Earn)
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| POST | `/learn/start-lesson` | 开始学习课程 | User | `{courseId, lessonId}` |
| POST | `/learn/complete-lesson` | 完成学习单元 | User | `{courseId, lessonId, timeSpent, answers?}` |
| POST | `/learn/submit-quiz` | 提交测验答案 | User | `{courseId, lessonId, answers, timeSpent}` |
| GET | `/learn/progress` | 获取学习进度 | User | `?courseId` |
| GET | `/learn/daily-stats` | 获取每日学习统计 | User | - |

#### 使用挖矿 (Use-to-Earn)
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| POST | `/use/start-session` | 开始AI工具使用会话 | User | `{toolId, sessionType}` |
| POST | `/use/end-session` | 结束使用会话 | User | `{sessionId, usageData, outputQuality?}` |
| GET | `/use/daily-stats` | 获取每日使用统计 | User | - |
| GET | `/use/session-history` | 获取使用历史 | User | `?limit&offset` |

#### 教导挖矿 (Teach-to-Earn)
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| POST | `/teach/publish-content` | 发布教学内容 | User (Lv.3+) | `{title, content, category, tags}` |
| PUT | `/teach/update-content` | 更新教学内容 | User | `{contentId, updates}` |
| DELETE | `/teach/delete-content` | 删除教学内容 | User | `{contentId}` |
| POST | `/teach/interact` | 内容互动 (点赞/收藏/评论) | User | `{contentId, type, data?}` |
| GET | `/teach/my-contents` | 获取我的教学内容 | User | `?status&limit&offset` |
| GET | `/teach/earning-stats` | 获取教导收益统计 | User | - |

#### 创造挖矿 (Create & Sell)
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| POST | `/create/upload-item` | 上传创作商品 | User (Lv.4+) | `{title, description, category, price, files}` |
| PUT | `/create/update-item` | 更新商品信息 | User | `{itemId, updates}` |
| POST | `/create/set-pricing` | 设置/修改价格 | User | `{itemId, price, auctionConfig?}` |
| DELETE | `/create/delist-item` | 下架商品 | User | `{itemId}` |
| GET | `/create/my-items` | 获取我的创作 | User | `?status&limit&offset` |
| GET | `/create/sales-stats` | 获取销售统计 | User | - |

#### 挖矿奖励查询
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| GET | `/rewards/daily-summary` | 每日挖矿汇总 | User | - |
| GET | `/rewards/history` | 挖矿历史记录 | User | `?type&startDate&endDate&limit&offset` |
| GET | `/rewards/streak-info` | 连续打卡信息 | User | - |
| POST | `/rewards/claim-daily` | 领取每日任务奖励 | User | - |

**挖矿奖励响应:**
```typescript
interface MiningReward {
  id: string;
  userId: string;
  type: 'learn' | 'use' | 'teach' | 'create';
  amount: number;
  baseAmount: number;
  multiplier: number;
  source: string; // courseId, toolId, contentId, itemId
  metadata: {
    difficulty?: number;
    quality?: number;
    streak?: number;
    timeSpent?: number;
  };
  claimedAt: string;
  txHash?: string;
}
```

---

### 2.4 游戏化模块 (Gamification)

**基础路径:** `/api/v1/gamification`

#### 任务系统
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| GET | `/quests/daily` | 获取每日任务 | User | - |
| GET | `/quests/weekly` | 获取每周挑战 | User | - |
| POST | `/quests/complete` | 完成任务 | User | `{questId, proof?}` |
| POST | `/quests/claim-chest` | 领取每日宝箱 | User | - |
| GET | `/quests/history` | 获取任务历史 | User | `?limit&offset` |

#### 成就系统
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| GET | `/achievements` | 获取所有成就 | User | - |
| GET | `/achievements/progress` | 获取成就进度 | User | - |
| POST | `/achievements/claim` | 领取成就奖励 | User | `{achievementId}` |
| POST | `/achievements/mint-nft` | 铸造成就NFT | User | `{achievementId}` |

#### 排行榜
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| GET | `/leaderboard/:type` | 获取排行榜 | User | `?period&limit&offset` |
| GET | `/leaderboard/my-rank` | 获取我的排名 | User | `{type, period}` |
| GET | `/leaderboard/season-rewards` | 赛季奖励信息 | User | - |

#### 赛季系统
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| GET | `/season/current` | 当前赛季信息 | User | - |
| GET | `/season/pass-progress` | 赛季通行证进度 | User | - |
| POST | `/season/buy-premium-pass` | 购买高级通行证 | User | - |
| POST | `/season/claim-pass-reward` | 领取通行证奖励 | User | `{level}` |

**排行榜响应:**
```typescript
interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  score: number; // 根据榜单类型而定
  change: number; // 排名变化
  isCurrentUser?: boolean;
}
```

---

### 2.5 交易模块 (Trading)

**基础路径:** `/api/v1/trading`

#### 市场浏览
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| GET | `/marketplace/items` | 浏览市场商品 | Public | `?category&priceMin&priceMax&sort&limit&offset` |
| GET | `/marketplace/item/:id` | 获取商品详情 | Public | - |
| GET | `/marketplace/search` | 搜索商品 | Public | `?q&category&filters` |
| GET | `/marketplace/featured` | 精选商品 | Public | `?limit` |

#### 购买交易
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| POST | `/buy/create-order` | 创建购买订单 | User | `{itemId, quantity?}` |
| POST | `/buy/confirm-order` | 确认支付订单 | User | `{orderId, paymentMethod}` |
| GET | `/buy/my-orders` | 我的购买订单 | User | `?status&limit&offset` |
| GET | `/buy/my-purchases` | 我的购买记录 | User | `?limit&offset` |

#### 拍卖系统
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| GET | `/auction/active` | 进行中的拍卖 | Public | `?category&sort&limit&offset` |
| GET | `/auction/item/:id` | 拍卖详情 | Public | - |
| POST | `/auction/create` | 创建拍卖 | User | `{itemId, startPrice, reservePrice?, duration}` |
| POST | `/auction/bid` | 出价 | User | `{auctionId, amount}` |
| GET | `/auction/my-bids` | 我的出价 | User | `?status&limit&offset` |
| GET | `/auction/my-auctions` | 我的拍卖 | User | `?status&limit&offset` |

#### NFT系统
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| POST | `/nft/mint` | 铸造NFT | User | `{itemId, quantity, metadata}` |
| GET | `/nft/my-nfts` | 我的NFT | User | `?collection&limit&offset` |
| POST | `/nft/list` | 挂售NFT | User | `{nftId, price, listingType}` |
| POST | `/nft/transfer` | 转移NFT | User | `{nftId, toAddress}` |
| GET | `/nft/:id/history` | NFT交易历史 | Public | - |

**商品详情响应:**
```typescript
interface MarketItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number; // LAC
  currency: 'LAC';
  sellerId: string;
  sellerUsername: string;
  sellerAvatar?: string;
  images: string[];
  files: FileInfo[];
  tags: string[];
  stats: {
    sales: number;
    views: number;
    likes: number;
    rating: number;
    ratingCount: number;
  };
  status: 'active' | 'sold' | 'auction' | 'draft';
  createdAt: string;
  updatedAt: string;
  auction?: AuctionInfo;
  nftInfo?: NFTInfo;
}
```

---

### 2.6 社区模块 (Community)

**基础路径:** `/api/v1/community`

#### 师徒系统
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| POST | `/mentorship/become-mentor` | 成为师傅 | User (Lv.4+) | `{specialties, maxApprentices}` |
| POST | `/mentorship/request-mentor` | 申请师傅 | User (Lv.1-2) | `{mentorId, message}` |
| POST | `/mentorship/accept-apprentice` | 接受徒弟 | Mentor | `{requestId}` |
| POST | `/mentorship/complete-mentorship` | 完成师徒关系 | Mentor/User | `{relationshipId, rating, feedback}` |
| GET | `/mentorship/my-mentors` | 我的师傅 | User | - |
| GET | `/mentorship/my-apprentices` | 我的徒弟 | Mentor | - |
| GET | `/mentorship/available-mentors` | 可用师傅列表 | User | `?specialty&limit&offset` |

#### 团队挖矿
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| POST | `/teams/create` | 创建团队 | User (Lv.3+) | `{name, description, maxMembers}` |
| POST | `/teams/join` | 加入团队 | User | `{teamId, inviteCode?}` |
| POST | `/teams/invite` | 邀请成员 | TeamLeader | `{teamId, userIds}` |
| POST | `/teams/leave` | 离开团队 | User | `{teamId}` |
| POST | `/teams/kick` | 踢出成员 | TeamLeader | `{teamId, userId}` |
| GET | `/teams/my-team` | 我的团队信息 | User | - |
| GET | `/teams/search` | 搜索团队 | User | `?q&limit&offset` |
| GET | `/teams/leaderboard` | 团队排行榜 | Public | `?period&limit&offset` |

#### 社区投票
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| GET | `/governance/proposals` | 获取提案列表 | User | `?status&limit&offset` |
| GET | `/governance/proposal/:id` | 提案详情 | User | - |
| POST | `/governance/create-proposal` | 创建提案 | User (持币≥10000) | `{title, description, options, duration}` |
| POST | `/governance/vote` | 投票 | User | `{proposalId, option, amount}` |
| GET | `/governance/my-votes` | 我的投票记录 | User | `?limit&offset` |

**团队信息响应:**
```typescript
interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  leaderUsername: string;
  members: TeamMember[];
  stats: {
    totalMembers: number;
    totalMining: number;
    rank: number;
    weeklyMining: number;
  };
  settings: {
    maxMembers: number;
    inviteOnly: boolean;
    activityRequirement: number;
  };
  createdAt: string;
}
```

---

### 2.7 内容模块 (Content)

**基础路径:** `/api/v1/content`

#### 课程管理
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| GET | `/courses` | 获取课程列表 | Public | `?category&difficulty&sort&limit&offset` |
| GET | `/courses/:id` | 课程详情 | Public | - |
| GET | `/courses/:id/lessons` | 课程章节列表 | User | - |
| GET | `/courses/:id/progress` | 课程学习进度 | User | - |
| POST | `/courses/enroll` | 报名课程 | User | `{courseId}` |
| POST | `/courses/rate` | 课程评分 | User | `{courseId, rating, comment?}` |

#### AI工具管理
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| GET | `/ai-tools` | 获取AI工具列表 | User | `?category&pricing&limit&offset` |
| GET | `/ai-tools/:id` | 工具详情 | User | - |
| POST | `/ai-tools/:id/use` | 使用AI工具 | User | `{input, parameters}` |
| GET | `/ai-tools/my-usage` | 使用记录 | User | `?toolId&limit&offset` |
| GET | `/ai-tools/quota` | 使用配额信息 | User | - |

#### 教学内容
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| GET | `/teaching-square` | 教学广场内容流 | User | `?category&sort&limit&offset` |
| GET | `/teaching-content/:id` | 教学内容详情 | User | - |
| POST | `/teaching-content` | 发布教学内容 | User (Lv.3+) | `{title, content, category, tags}` |
| PUT | `/teaching-content/:id` | 更新教学内容 | User | `{updates}` |
| DELETE | `/teaching-content/:id` | 删除教学内容 | User | - |
| POST | `/teaching-content/:id/interact` | 内容互动 | User | `{type, data?}` |

---

### 2.8 管理模块 (Admin)

**基础路径:** `/api/v1/admin` (需要Admin权限)

#### 用户管理
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| GET | `/users` | 用户列表 | Admin | `?search&status&limit&offset` |
| GET | `/users/:id` | 用户详情 | Admin | - |
| PUT | `/users/:id/status` | 更新用户状态 | Admin | `{status, reason?}` |
| GET | `/users/analytics` | 用户分析数据 | Admin | `?period` |

#### 内容审核
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| GET | `/moderation/pending` | 待审核内容 | Moderator | `?type&limit&offset` |
| POST | `/moderation/approve` | 审核通过 | Moderator | `{contentId, type}` |
| POST | `/moderation/reject` | 审核拒绝 | Moderator | `{contentId, type, reason}` |

#### 系统统计
| Method | Endpoint | 说明 | 权限 | 参数 |
|--------|----------|------|------|------|
| GET | `/stats/overview` | 系统概况 | Admin | - |
| GET | `/stats/mining` | 挖矿统计 | Admin | `?period` |
| GET | `/stats/trading` | 交易统计 | Admin | `?period` |
| GET | `/stats/users` | 用户统计 | Admin | `?period` |

---

## 3. 数据库Schema

### 3.1 用户相关表

#### users (用户主表)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    bio TEXT,
    
    -- 等级系统
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    
    -- 资产
    lac_balance DECIMAL(20, 6) DEFAULT 0,
    points_balance INTEGER DEFAULT 0,
    staked_lac DECIMAL(20, 6) DEFAULT 0,
    
    -- 社交信息
    social_links JSONB DEFAULT '{}',
    
    -- 状态与设置
    status TEXT DEFAULT 'active', -- active, suspended, banned
    preferences JSONB DEFAULT '{}',
    
    -- 挖矿相关
    streak_days INTEGER DEFAULT 0,
    last_checkin DATE,
    total_mining_earned DECIMAL(20, 6) DEFAULT 0,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束
    CONSTRAINT users_level_check CHECK (level >= 1 AND level <= 6),
    CONSTRAINT users_xp_check CHECK (xp >= 0),
    CONSTRAINT users_balance_check CHECK (lac_balance >= 0 AND points_balance >= 0)
);

-- 索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_level ON users(level);
CREATE INDEX idx_users_lac_balance ON users(lac_balance);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_streak_days ON users(streak_days);

-- RLS策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的完整信息，其他人只能看公开信息
CREATE POLICY "用户个人信息访问" ON users
    FOR SELECT USING (
        id = auth.uid() OR 
        -- 公开信息字段
        TRUE
    );

-- 只能更新自己的信息
CREATE POLICY "用户信息更新" ON users
    FOR UPDATE USING (id = auth.uid());
```

#### user_wallets (用户钱包关联)
```sql
CREATE TABLE user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    chain TEXT DEFAULT 'solana',
    is_primary BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, address)
);

CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX idx_user_wallets_address ON user_wallets(address);

-- RLS
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "钱包信息访问" ON user_wallets
    FOR ALL USING (user_id = auth.uid());
```

#### user_sessions (用户会话)
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    refresh_token TEXT UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

### 3.2 课程与学习表

#### courses (课程主表)
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    category TEXT NOT NULL,
    difficulty INTEGER DEFAULT 1, -- 1-4
    estimated_duration INTEGER, -- 分钟
    
    -- 奖励设置
    base_lac_reward INTEGER DEFAULT 100,
    
    -- 状态
    status TEXT DEFAULT 'draft', -- draft, published, archived
    featured BOOLEAN DEFAULT FALSE,
    
    -- 统计
    enrollment_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    -- 创建者
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 元数据
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_featured ON courses(featured);
CREATE INDEX idx_courses_rating ON courses(rating DESC);
```

#### course_lessons (课程章节)
```sql
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT, -- 可以是markdown或HTML
    video_url TEXT,
    order_index INTEGER NOT NULL,
    duration INTEGER, -- 预计学习时间(分钟)
    
    -- 测验设置
    quiz_questions JSONB DEFAULT '[]',
    passing_score INTEGER DEFAULT 70,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(course_id, order_index)
);

CREATE INDEX idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX idx_course_lessons_order ON course_lessons(course_id, order_index);
```

#### user_course_progress (学习进度)
```sql
CREATE TABLE user_course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    
    -- 进度状态
    status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
    progress_percentage INTEGER DEFAULT 0,
    
    -- 学习记录
    time_spent INTEGER DEFAULT 0, -- 秒
    attempts INTEGER DEFAULT 0,
    best_score INTEGER, -- 最好成绩
    last_score INTEGER, -- 最近成绩
    
    -- 时间记录
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX idx_user_course_progress_course_id ON user_course_progress(course_id);
CREATE INDEX idx_user_course_progress_status ON user_course_progress(status);

-- RLS
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "学习进度访问" ON user_course_progress
    FOR ALL USING (user_id = auth.uid());
```

### 3.3 AI工具相关表

#### ai_tools (AI工具)
```sql
CREATE TABLE ai_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    icon_url TEXT,
    
    -- 定价
    pricing_model TEXT DEFAULT 'freemium', -- free, freemium, paid
    free_quota_daily INTEGER DEFAULT 10,
    cost_per_use INTEGER DEFAULT 0, -- LAC
    
    -- 配置
    api_endpoint TEXT NOT NULL,
    parameters_schema JSONB DEFAULT '{}',
    
    -- 挖矿设置
    mining_multiplier DECIMAL(3,2) DEFAULT 1.0,
    min_usage_time INTEGER DEFAULT 30, -- 最小使用时间(秒)获得奖励
    
    -- 状态
    status TEXT DEFAULT 'active', -- active, maintenance, deprecated
    featured BOOLEAN DEFAULT FALSE,
    
    -- 统计
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_tools_category ON ai_tools(category);
CREATE INDEX idx_ai_tools_status ON ai_tools(status);
CREATE INDEX idx_ai_tools_featured ON ai_tools(featured);
```

#### user_ai_tool_usage (AI工具使用记录)
```sql
CREATE TABLE user_ai_tool_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES ai_tools(id) ON DELETE CASCADE,
    
    -- 使用会话
    session_id TEXT UNIQUE NOT NULL,
    
    -- 使用详情
    input_data JSONB,
    output_data JSONB,
    parameters JSONB DEFAULT '{}',
    
    -- 使用统计
    usage_time INTEGER, -- 秒
    tokens_used INTEGER,
    quality_score DECIMAL(3,2), -- AI评估的输出质量
    
    -- 挖矿奖励
    lac_earned DECIMAL(20, 6) DEFAULT 0,
    mining_multiplier DECIMAL(3,2) DEFAULT 1.0,
    
    -- 时间记录
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- 成本
    lac_cost DECIMAL(20, 6) DEFAULT 0
);

CREATE INDEX idx_user_ai_tool_usage_user_id ON user_ai_tool_usage(user_id);
CREATE INDEX idx_user_ai_tool_usage_tool_id ON user_ai_tool_usage(tool_id);
CREATE INDEX idx_user_ai_tool_usage_started_at ON user_ai_tool_usage(started_at);

-- RLS
ALTER TABLE user_ai_tool_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "工具使用记录访问" ON user_ai_tool_usage
    FOR ALL USING (user_id = auth.uid());
```

### 3.4 挖矿奖励表

#### mining_rewards (挖矿奖励记录)
```sql
CREATE TABLE mining_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 奖励类型
    reward_type TEXT NOT NULL, -- learn, use, teach, create, daily_quest, achievement
    source_type TEXT NOT NULL, -- course, lesson, tool, content, item, quest, achievement
    source_id UUID NOT NULL,
    
    -- 奖励计算
    base_amount DECIMAL(20, 6) NOT NULL,
    multiplier DECIMAL(4,2) DEFAULT 1.0,
    final_amount DECIMAL(20, 6) NOT NULL,
    
    -- 详细参数
    calculation_details JSONB DEFAULT '{}',
    
    -- 状态
    status TEXT DEFAULT 'pending', -- pending, claimed, expired
    
    -- 时间
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    claimed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- 区块链记录
    tx_hash TEXT,
    block_number BIGINT
);

CREATE INDEX idx_mining_rewards_user_id ON mining_rewards(user_id);
CREATE INDEX idx_mining_rewards_type ON mining_rewards(reward_type);
CREATE INDEX idx_mining_rewards_source ON mining_rewards(source_type, source_id);
CREATE INDEX idx_mining_rewards_earned_at ON mining_rewards(earned_at);
CREATE INDEX idx_mining_rewards_status ON mining_rewards(status);

-- RLS
ALTER TABLE mining_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "挖矿奖励访问" ON mining_rewards
    FOR ALL USING (user_id = auth.uid());
```

#### daily_mining_stats (每日挖矿统计)
```sql
CREATE TABLE daily_mining_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- 各维度统计
    learn_rewards DECIMAL(20, 6) DEFAULT 0,
    use_rewards DECIMAL(20, 6) DEFAULT 0,
    teach_rewards DECIMAL(20, 6) DEFAULT 0,
    create_rewards DECIMAL(20, 6) DEFAULT 0,
    quest_rewards DECIMAL(20, 6) DEFAULT 0,
    
    total_rewards DECIMAL(20, 6) DEFAULT 0,
    
    -- 活动统计
    lessons_completed INTEGER DEFAULT 0,
    tools_used INTEGER DEFAULT 0,
    content_published INTEGER DEFAULT 0,
    quests_completed INTEGER DEFAULT 0,
    
    -- 连续打卡
    streak_day INTEGER DEFAULT 1,
    streak_multiplier DECIMAL(3,2) DEFAULT 1.0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_mining_stats_user_date ON daily_mining_stats(user_id, date);
CREATE INDEX idx_daily_mining_stats_date ON daily_mining_stats(date);
CREATE INDEX idx_daily_mining_stats_total_rewards ON daily_mining_stats(total_rewards DESC);
```

### 3.5 游戏化系统表

#### achievements (成就定义)
```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    
    -- 稀有度和分类
    rarity TEXT DEFAULT 'common', -- common, rare, epic, legendary
    category TEXT NOT NULL, -- learning, usage, teaching, creation, social
    
    -- 解锁条件
    unlock_condition JSONB NOT NULL,
    
    -- 奖励
    lac_reward INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 0,
    
    -- NFT化设置
    can_mint_nft BOOLEAN DEFAULT FALSE,
    nft_mint_cost INTEGER DEFAULT 100, -- LAC
    
    -- 状态
    active BOOLEAN DEFAULT TRUE,
    
    -- 统计
    unlock_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);
CREATE INDEX idx_achievements_active ON achievements(active);
```

#### user_achievements (用户成就)
```sql
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    
    -- 进度
    progress DECIMAL(5,2) DEFAULT 0, -- 百分比
    current_value INTEGER DEFAULT 0,
    target_value INTEGER,
    
    -- 状态
    unlocked BOOLEAN DEFAULT FALSE,
    claimed BOOLEAN DEFAULT FALSE,
    
    -- NFT化
    nft_minted BOOLEAN DEFAULT FALSE,
    nft_token_id TEXT,
    
    -- 时间
    unlocked_at TIMESTAMP WITH TIME ZONE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked);

-- RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户成就访问" ON user_achievements
    FOR ALL USING (user_id = auth.uid());
```

#### daily_quests (每日任务)
```sql
CREATE TABLE daily_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- 任务配置
    quest_type TEXT NOT NULL, -- learn_lesson, use_tool, publish_content, etc.
    target_value INTEGER DEFAULT 1,
    
    -- 奖励
    lac_reward INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    
    -- 权重(用于随机选择)
    weight INTEGER DEFAULT 1,
    
    -- 要求等级
    min_level INTEGER DEFAULT 1,
    
    active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_daily_quests (用户每日任务)
```sql
CREATE TABLE user_daily_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES daily_quests(id),
    date DATE NOT NULL,
    
    -- 进度
    current_progress INTEGER DEFAULT 0,
    target_progress INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    claimed BOOLEAN DEFAULT FALSE,
    
    -- 时间
    completed_at TIMESTAMP WITH TIME ZONE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, quest_id, date)
);

CREATE INDEX idx_user_daily_quests_user_date ON user_daily_quests(user_id, date);
CREATE INDEX idx_user_daily_quests_completed ON user_daily_quests(completed);

-- RLS
ALTER TABLE user_daily_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户任务访问" ON user_daily_quests
    FOR ALL USING (user_id = auth.uid());
```

#### leaderboards (排行榜)
```sql
CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    board_type TEXT NOT NULL, -- learning, teaching, creation, wealth
    period TEXT NOT NULL, -- daily, weekly, monthly, season
    period_start DATE NOT NULL,
    
    score DECIMAL(20, 6) NOT NULL,
    rank INTEGER,
    
    -- 详细数据
    metrics JSONB DEFAULT '{}',
    
    -- 时间
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, board_type, period, period_start)
);

CREATE INDEX idx_leaderboards_board_period ON leaderboards(board_type, period, period_start);
CREATE INDEX idx_leaderboards_score ON leaderboards(board_type, period, period_start, score DESC);
CREATE INDEX idx_leaderboards_rank ON leaderboards(board_type, period, period_start, rank);
```

#### seasons (赛季)
```sql
CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    theme TEXT,
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- 特殊奖励倍率
    reward_multiplier DECIMAL(3,2) DEFAULT 1.0,
    
    -- 赛季通行证
    pass_levels INTEGER DEFAULT 30,
    premium_pass_price INTEGER DEFAULT 500, -- LAC
    
    active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_season_pass (用户赛季通行证)
```sql
CREATE TABLE user_season_pass (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    season_id UUID REFERENCES seasons(id),
    
    -- 通行证类型
    has_premium BOOLEAN DEFAULT FALSE,
    
    -- 进度
    current_level INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    
    -- 奖励领取状态
    claimed_rewards JSONB DEFAULT '{}', -- {level: claimed}
    
    UNIQUE(user_id, season_id)
);

-- RLS
ALTER TABLE user_season_pass ENABLE ROW LEVEL SECURITY;
CREATE POLICY "赛季通行证访问" ON user_season_pass
    FOR ALL USING (user_id = auth.uid());
```

### 3.6 创作者市场表

#### market_items (市场商品)
```sql
CREATE TABLE market_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 基本信息
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    
    -- 媒体
    thumbnail_url TEXT,
    images_urls TEXT[] DEFAULT '{}',
    
    -- 文件信息
    files JSONB DEFAULT '[]', -- 文件列表和元数据
    
    -- 定价
    price DECIMAL(20, 6) NOT NULL, -- LAC
    pricing_type TEXT DEFAULT 'fixed', -- fixed, auction
    
    -- 拍卖设置(如果是拍卖)
    auction_end_time TIMESTAMP WITH TIME ZONE,
    reserve_price DECIMAL(20, 6),
    current_bid DECIMAL(20, 6),
    bid_count INTEGER DEFAULT 0,
    
    -- 状态
    status TEXT DEFAULT 'active', -- active, sold, auction, draft, removed
    featured BOOLEAN DEFAULT FALSE,
    
    -- 统计
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    -- NFT信息
    nft_token_id TEXT,
    is_nft BOOLEAN DEFAULT FALSE,
    
    -- 时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_market_items_seller_id ON market_items(seller_id);
CREATE INDEX idx_market_items_category ON market_items(category);
CREATE INDEX idx_market_items_status ON market_items(status);
CREATE INDEX idx_market_items_price ON market_items(price);
CREATE INDEX idx_market_items_created_at ON market_items(created_at DESC);
CREATE INDEX idx_market_items_featured ON market_items(featured);

-- RLS - 卖家可以管理自己的商品，所有人可以查看公开商品
ALTER TABLE market_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "市场商品查看" ON market_items
    FOR SELECT USING (
        status IN ('active', 'auction') OR 
        seller_id = auth.uid()
    );
CREATE POLICY "市场商品管理" ON market_items
    FOR ALL USING (seller_id = auth.uid());
```

#### market_orders (交易订单)
```sql
CREATE TABLE market_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id),
    item_id UUID REFERENCES market_items(id),
    
    -- 订单信息
    order_type TEXT NOT NULL, -- purchase, auction_bid
    amount DECIMAL(20, 6) NOT NULL,
    quantity INTEGER DEFAULT 1,
    
    -- 费用计算
    item_price DECIMAL(20, 6) NOT NULL,
    platform_fee DECIMAL(20, 6) DEFAULT 0,
    seller_receives DECIMAL(20, 6) NOT NULL,
    
    -- 状态
    status TEXT DEFAULT 'pending', -- pending, completed, cancelled, expired
    
    -- 支付信息
    payment_method TEXT DEFAULT 'lac', -- lac, points
    tx_hash TEXT,
    
    -- 时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour'
);

CREATE INDEX idx_market_orders_buyer_id ON market_orders(buyer_id);
CREATE INDEX idx_market_orders_seller_id ON market_orders(seller_id);
CREATE INDEX idx_market_orders_item_id ON market_orders(item_id);
CREATE INDEX idx_market_orders_status ON market_orders(status);
CREATE INDEX idx_market_orders_created_at ON market_orders(created_at DESC);

-- RLS
ALTER TABLE market_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "订单访问" ON market_orders
    FOR ALL USING (buyer_id = auth.uid() OR seller_id = auth.uid());
```

#### auction_bids (拍卖出价)
```sql
CREATE TABLE auction_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES market_items(id) ON DELETE CASCADE,
    bidder_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    amount DECIMAL(20, 6) NOT NULL,
    
    -- 出价状态
    status TEXT DEFAULT 'active', -- active, outbid, winning, won, lost
    
    -- 时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auction_bids_item_id ON auction_bids(item_id);
CREATE INDEX idx_auction_bids_bidder_id ON auction_bids(bidder_id);
CREATE INDEX idx_auction_bids_amount ON auction_bids(item_id, amount DESC);
CREATE INDEX idx_auction_bids_created_at ON auction_bids(created_at);
```

#### nft_tokens (NFT代币)
```sql
CREATE TABLE nft_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id TEXT UNIQUE NOT NULL,
    contract_address TEXT NOT NULL,
    
    -- 所有者
    current_owner_id UUID REFERENCES users(id),
    original_creator_id UUID REFERENCES users(id),
    
    -- 元数据
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    metadata_url TEXT,
    attributes JSONB DEFAULT '{}',
    
    -- 关联的原始内容
    source_type TEXT, -- achievement, market_item, course_certificate
    source_id UUID,
    
    -- 版税设置
    royalty_percentage DECIMAL(5,2) DEFAULT 5.0, -- 5%
    royalty_recipient_id UUID REFERENCES users(id),
    
    -- 铸造信息
    mint_tx_hash TEXT,
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nft_tokens_owner ON nft_tokens(current_owner_id);
CREATE INDEX idx_nft_tokens_creator ON nft_tokens(original_creator_id);
CREATE INDEX idx_nft_tokens_source ON nft_tokens(source_type, source_id);
```

### 3.7 社交系统表

#### mentorship_relations (师徒关系)
```sql
CREATE TABLE mentorship_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    apprentice_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 师徒状态
    status TEXT DEFAULT 'active', -- active, completed, terminated
    
    -- 专业领域
    specialties TEXT[] DEFAULT '{}',
    
    -- 进度跟踪
    milestones JSONB DEFAULT '[]',
    progress_notes TEXT,
    
    -- 评价(关系结束时)
    mentor_rating INTEGER, -- 1-5
    apprentice_rating INTEGER, -- 1-5
    feedback TEXT,
    
    -- 时间管理
    duration_days INTEGER DEFAULT 30,
    
    -- 时间记录
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(mentor_id, apprentice_id)
);

CREATE INDEX idx_mentorship_mentor ON mentorship_relations(mentor_id);
CREATE INDEX idx_mentorship_apprentice ON mentorship_relations(apprentice_id);
CREATE INDEX idx_mentorship_status ON mentorship_relations(status);
```

#### teams (团队)
```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 团队设置
    max_members INTEGER DEFAULT 10,
    invite_only BOOLEAN DEFAULT FALSE,
    activity_requirement INTEGER DEFAULT 3, -- 每周最少活跃天数
    
    -- 统计数据
    total_members INTEGER DEFAULT 1,
    total_mining_this_week DECIMAL(20, 6) DEFAULT 0,
    
    -- 状态
    status TEXT DEFAULT 'active', -- active, disbanded
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_teams_leader ON teams(leader_id);
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_teams_mining ON teams(total_mining_this_week DESC);
```

#### team_members (团队成员)
```sql
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 成员角色
    role TEXT DEFAULT 'member', -- leader, co_leader, member
    
    -- 统计
    contribution_this_week DECIMAL(20, 6) DEFAULT 0,
    last_activity_date DATE,
    
    -- 时间
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_contribution ON team_members(team_id, contribution_this_week DESC);

-- RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "团队成员访问" ON team_members
    FOR ALL USING (
        user_id = auth.uid() OR 
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    );
```

#### governance_proposals (治理提案)
```sql
CREATE TABLE governance_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposer_id UUID REFERENCES users(id),
    
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    proposal_type TEXT NOT NULL, -- course_topic, feature_request, parameter_change
    
    -- 投票选项
    options JSONB NOT NULL, -- ["Option A", "Option B", ...]
    
    -- 投票规则
    min_voting_power DECIMAL(20, 6) DEFAULT 1, -- 最小投票权重要求
    quorum_threshold DECIMAL(20, 6), -- 法定人数阈值
    
    -- 时间设置
    voting_starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    voting_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- 状态
    status TEXT DEFAULT 'active', -- active, passed, failed, executed
    
    -- 结果
    total_votes DECIMAL(20, 6) DEFAULT 0,
    results JSONB DEFAULT '{}', -- {option: vote_count}
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_governance_proposals_status ON governance_proposals(status);
CREATE INDEX idx_governance_proposals_voting_ends ON governance_proposals(voting_ends_at);
```

#### governance_votes (治理投票)
```sql
CREATE TABLE governance_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES governance_proposals(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    option_chosen TEXT NOT NULL,
    voting_power DECIMAL(20, 6) NOT NULL, -- 基于LAC持有量
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(proposal_id, voter_id)
);

CREATE INDEX idx_governance_votes_proposal ON governance_votes(proposal_id);
CREATE INDEX idx_governance_votes_voter ON governance_votes(voter_id);

-- RLS
ALTER TABLE governance_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "治理投票访问" ON governance_votes
    FOR ALL USING (voter_id = auth.uid());
```

### 3.8 内容管理表

#### teaching_contents (教学内容)
```sql
CREATE TABLE teaching_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'markdown', -- markdown, html, video
    
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    difficulty INTEGER DEFAULT 1, -- 1-4
    
    -- 媒体
    thumbnail_url TEXT,
    video_url TEXT,
    
    -- 状态
    status TEXT DEFAULT 'published', -- draft, published, archived, removed
    featured BOOLEAN DEFAULT FALSE,
    
    -- 统计
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    
    -- 评分
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    -- 挖矿奖励(7天后结算)
    pending_lac_reward DECIMAL(20, 6) DEFAULT 0,
    settled_lac_reward DECIMAL(20, 6) DEFAULT 0,
    settlement_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_teaching_contents_author ON teaching_contents(author_id);
CREATE INDEX idx_teaching_contents_category ON teaching_contents(category);
CREATE INDEX idx_teaching_contents_status ON teaching_contents(status);
CREATE INDEX idx_teaching_contents_created_at ON teaching_contents(created_at DESC);
CREATE INDEX idx_teaching_contents_like_count ON teaching_contents(like_count DESC);
```

#### content_interactions (内容互动)
```sql
CREATE TABLE content_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES teaching_contents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    interaction_type TEXT NOT NULL, -- like, bookmark, share, comment, view
    
    -- 评论相关(如果是comment类型)
    comment_text TEXT,
    parent_comment_id UUID REFERENCES content_interactions(id),
    
    -- 评分相关(如果是rating类型)
    rating_score INTEGER, -- 1-5
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(content_id, user_id, interaction_type)
);

CREATE INDEX idx_content_interactions_content ON content_interactions(content_id);
CREATE INDEX idx_content_interactions_user ON content_interactions(user_id);
CREATE INDEX idx_content_interactions_type ON content_interactions(interaction_type);
```

### 3.9 系统配置表

#### system_config (系统配置)
```sql
CREATE TABLE system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- 插入默认配置
INSERT INTO system_config (key, value, description) VALUES
('mining.daily_limits', '{"learn": 500, "use": 300, "teach": 2000, "create": 5000}', '每日挖矿上限(LAC)'),
('mining.streak_multipliers', '{"3": 1.2, "7": 1.5, "14": 2.0, "30": 3.0, "60": 5.0, "90": 6.0}', '连续打卡倍率'),
('mining.base_rewards', '{"learn": 100, "use": 15, "teach": 30, "create": 200}', '基础奖励'),
('gamification.level_requirements', '{"1": 0, "2": 500, "3": 2000, "4": 8000, "5": 25000, "6": 80000}', '等级经验要求'),
('trading.platform_fees', '{"market": 0.15, "auction": 0.05, "nft_mint": 100}', '平台手续费'),
('season.current', '{"id": "s1", "name": "觉醒", "start": "2026-07-01", "end": "2026-09-30"}', '当前赛季信息');
```

---

## 4. 实时功能设计

### 4.1 Supabase Realtime 订阅

| 功能模块 | 订阅表 | 订阅条件 | 用途 |
|---------|--------|---------|------|
| **排行榜实时更新** | `leaderboards` | `board_type=specific & period=current` | 实时排名变化 |
| **挖矿奖励通知** | `mining_rewards` | `user_id=current_user & status=pending` | 新奖励提醒 |
| **拍卖实时竞价** | `auction_bids` | `item_id=specific` | 拍卖价格跳动 |
| **团队挖矿统计** | `team_members` | `team_id=user_team` | 团队成员贡献实时更新 |
| **社区投票结果** | `governance_votes` | `proposal_id=specific` | 投票进度实时显示 |
| **师徒系统通知** | `mentorship_relations` | `mentor_id=user OR apprentice_id=user` | 师徒互动通知 |

### 4.2 Realtime 订阅示例代码

```typescript
// 排行榜实时订阅
const subscribeToLeaderboard = (boardType: string, period: string) => {
  return supabase
    .channel(`leaderboard:${boardType}:${period}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leaderboards',
        filter: `board_type=eq.${boardType} and period=eq.${period}`
      },
      (payload) => {
        // 更新排行榜UI
        updateLeaderboardUI(payload);
      }
    )
    .subscribe();
};

// 挖矿奖励实时通知
const subscribeToMiningRewards = (userId: string) => {
  return supabase
    .channel(`mining_rewards:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mining_rewards',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        // 显示挖矿奖励通知
        showMiningRewardNotification(payload.new);
      }
    )
    .subscribe();
};

// 拍卖实时竞价
const subscribeToAuctionBids = (itemId: string) => {
  return supabase
    .channel(`auction:${itemId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'auction_bids',
        filter: `item_id=eq.${itemId}`
      },
      (payload) => {
        // 更新拍卖界面
        updateAuctionUI(payload.new);
      }
    )
    .subscribe();
};
```

---

## 5. Edge Functions

### 5.1 Edge Functions 列表

| 函数名 | 触发方式 | 用途 | 优先级 |
|--------|---------|------|--------|
| **mining-reward-calculator** | HTTP POST | 计算挖矿奖励 | 🔴 P0 |
| **anti-cheat-detector** | HTTP POST | 防作弊检测 | 🔴 P0 |
| **daily-quest-generator** | Cron | 生成每日任务 | 🔴 P0 |
| **leaderboard-updater** | Cron | 更新排行榜 | 🔴 P0 |
| **auction-finalizer** | Cron | 处理拍卖结算 | 🔴 P0 |
| **season-rewards-distributor** | Cron | 分发赛季奖励 | 🔴 P0 |
| **blockchain-sync** | Cron | 同步区块链数据 | 🔴 P0 |
| **ai-content-moderator** | DB Trigger | AI内容审核 | 🟡 P1 |
| **email-notification** | HTTP POST | 发送邮件通知 | 🟡 P1 |
| **analytics-processor** | Cron | 处理分析数据 | 🟢 P2 |

### 5.2 核心Edge Functions详细设计

#### 5.2.1 mining-reward-calculator

**文件:** `supabase/functions/mining-reward-calculator/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface MiningRewardRequest {
  userId: string;
  rewardType: 'learn' | 'use' | 'teach' | 'create';
  sourceId: string;
  sourceType: string;
  metadata: {
    difficulty?: number;
    timeSpent?: number;
    quality?: number;
    streak?: number;
  };
}

serve(async (req) => {
  try {
    const { userId, rewardType, sourceId, sourceType, metadata } = await req.json() as MiningRewardRequest;
    
    // 1. 获取用户信息和今日统计
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { data: user } = await supabase
      .from('users')
      .select('level, streak_days')
      .eq('id', userId)
      .single();
      
    const { data: dailyStats } = await supabase
      .from('daily_mining_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();
    
    // 2. 获取系统配置
    const { data: config } = await supabase
      .from('system_config')
      .select('key, value')
      .in('key', ['mining.base_rewards', 'mining.daily_limits', 'mining.streak_multipliers']);
    
    const baseRewards = config.find(c => c.key === 'mining.base_rewards')?.value;
    const dailyLimits = config.find(c => c.key === 'mining.daily_limits')?.value;
    const streakMultipliers = config.find(c => c.key === 'mining.streak_multipliers')?.value;
    
    // 3. 计算奖励
    let baseAmount = baseRewards[rewardType];
    
    // 难度系数
    if (metadata.difficulty) {
      baseAmount *= metadata.difficulty;
    }
    
    // 质量系数
    if (metadata.quality) {
      baseAmount *= metadata.quality;
    }
    
    // 连续打卡倍率
    const streakDays = user?.streak_days || 0;
    let streakMultiplier = 1.0;
    for (const [days, multiplier] of Object.entries(streakMultipliers)) {
      if (streakDays >= parseInt(days)) {
        streakMultiplier = multiplier as number;
      }
    }
    
    // 等级加成
    const levelBonus = 1 + (user?.level - 1) * 0.05; // 每级+5%
    
    const finalAmount = baseAmount * streakMultiplier * levelBonus;
    
    // 4. 检查日上限
    const currentTypeRewards = dailyStats?.[`${rewardType}_rewards`] || 0;
    const dailyLimit = dailyLimits[rewardType];
    
    if (currentTypeRewards + finalAmount > dailyLimit) {
      return new Response(
        JSON.stringify({ 
          error: 'Daily limit exceeded',
          limit: dailyLimit,
          current: currentTypeRewards
        }),
        { status: 400 }
      );
    }
    
    // 5. 创建奖励记录
    const { data: reward } = await supabase
      .from('mining_rewards')
      .insert({
        user_id: userId,
        reward_type: rewardType,
        source_type: sourceType,
        source_id: sourceId,
        base_amount: baseAmount,
        multiplier: streakMultiplier * levelBonus,
        final_amount: finalAmount,
        calculation_details: {
          baseAmount,
          streakMultiplier,
          levelBonus,
          metadata
        },
        status: 'pending'
      })
      .select()
      .single();
    
    // 6. 更新每日统计
    await supabase
      .from('daily_mining_stats')
      .upsert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        [`${rewardType}_rewards`]: currentTypeRewards + finalAmount,
        total_rewards: (dailyStats?.total_rewards || 0) + finalAmount
      });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        reward,
        calculation: {
          baseAmount,
          streakMultiplier,
          levelBonus,
          finalAmount
        }
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

#### 5.2.2 anti-cheat-detector

**文件:** `supabase/functions/anti-cheat-detector/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface AntiCheatRequest {
  userId: string;
  action: string;
  metadata: {
    timeSpent?: number;
    mouseTracking?: number[];
    answerPattern?: string;
    deviceFingerprint?: string;
    ipAddress?: string;
  };
}

serve(async (req) => {
  try {
    const { userId, action, metadata } = await req.json() as AntiCheatRequest;
    
    const suspiciousSignals = [];
    let riskScore = 0;
    
    // 1. 时间异常检测
    if (action === 'complete_lesson' && metadata.timeSpent) {
      if (metadata.timeSpent < 30) { // 少于30秒完成课程
        suspiciousSignals.push('time_too_short');
        riskScore += 30;
      }
      if (metadata.timeSpent > 3600 && metadata.timeSpent < 3700) { // 刚好1小时，可能挂机
        suspiciousSignals.push('suspicious_timing');
        riskScore += 20;
      }
    }
    
    // 2. 鼠标轨迹异常
    if (metadata.mouseTracking) {
      const movements = metadata.mouseTracking;
      if (movements.length < 10) { // 鼠标移动次数过少
        suspiciousSignals.push('insufficient_mouse_activity');
        riskScore += 25;
      }
    }
    
    // 3. 答题模式检测
    if (metadata.answerPattern) {
      const pattern = metadata.answerPattern;
      if (pattern.match(/^[A]{5,}$|^[B]{5,}$|^[C]{5,}$/)) { // 全选同一个选项
        suspiciousSignals.push('suspicious_answer_pattern');
        riskScore += 40;
      }
    }
    
    // 4. 设备指纹检测
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    if (metadata.deviceFingerprint) {
      // 检查是否有其他用户使用相同设备指纹
      const { data: sameDevice } = await supabase
        .from('user_sessions')
        .select('user_id')
        .eq('device_fingerprint', metadata.deviceFingerprint)
        .neq('user_id', userId);
      
      if (sameDevice && sameDevice.length > 0) {
        suspiciousSignals.push('shared_device');
        riskScore += 50;
      }
    }
    
    // 5. IP地址检测
    if (metadata.ipAddress) {
      // 检查同一IP是否有过多账户
      const { data: sameIP } = await supabase
        .from('user_sessions')
        .select('user_id')
        .eq('ip_address', metadata.ipAddress)
        .gte('created_at', new Date(Date.now() - 24*60*60*1000).toISOString()); // 24小时内
      
      const uniqueUsers = new Set(sameIP?.map(s => s.user_id));
      if (uniqueUsers.size > 5) { // 同一IP超过5个用户
        suspiciousSignals.push('suspicious_ip');
        riskScore += 35;
      }
    }
    
    // 6. 记录检测结果
    await supabase
      .from('anti_cheat_logs')
      .insert({
        user_id: userId,
        action,
        risk_score: riskScore,
        suspicious_signals: suspiciousSignals,
        metadata,
        created_at: new Date().toISOString()
      });
    
    // 7. 决定处理方式
    let action_taken = 'none';
    
    if (riskScore >= 80) {
      action_taken = 'block_reward';
      // 阻止奖励发放
    } else if (riskScore >= 50) {
      action_taken = 'reduce_reward';
      // 减少奖励50%
    } else if (riskScore >= 30) {
      action_taken = 'flag_for_review';
      // 标记人工审核
    }
    
    return new Response(
      JSON.stringify({ 
        riskScore,
        suspiciousSignals,
        actionTaken: action_taken,
        allowReward: riskScore < 80
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

#### 5.2.3 daily-quest-generator

**文件:** `supabase/functions/daily-quest-generator/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// 每天凌晨0:00 UTC触发
serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const today = new Date().toISOString().split('T')[0];
    
    // 1. 获取所有活跃用户
    const { data: activeUsers } = await supabase
      .from('users')
      .select('id, level')
      .eq('status', 'active')
      .gte('last_checkin', new Date(Date.now() - 7*24*60*60*1000).toISOString());
    
    // 2. 获取可用任务模板
    const { data: questTemplates } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('active', true);
    
    // 3. 为每个用户生成3个每日任务
    for (const user of activeUsers || []) {
      // 根据用户等级筛选合适的任务
      const eligibleQuests = questTemplates?.filter(q => q.min_level <= user.level) || [];
      
      // 加权随机选择3个任务
      const selectedQuests = weightedRandomSelection(eligibleQuests, 3);
      
      // 插入用户每日任务
      const userQuests = selectedQuests.map(quest => ({
        user_id: user.id,
        quest_id: quest.id,
        date: today,
        current_progress: 0,
        target_progress: quest.target_value,
        completed: false,
        claimed: false
      }));
      
      await supabase
        .from('user_daily_quests')
        .upsert(userQuests, { 
          onConflict: 'user_id,quest_id,date',
          ignoreDuplicates: true 
        });
    }
    
    // 4. 生成每周挑战(只在周一)
    const isMonday = new Date().getDay() === 1;
    if (isMonday) {
      // 为所有用户生成每周挑战
      const weeklyChallenge = selectWeeklyChallenge();
      // ... 实现每周挑战生成逻辑
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        generated_for_users: activeUsers?.length || 0,
        date: today
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error('Daily quest generation failed:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});

// 加权随机选择函数
function weightedRandomSelection(items: any[], count: number): any[] {
  const selected = [];
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  
  for (let i = 0; i < count && items.length > 0; i++) {
    let randomWeight = Math.random() * totalWeight;
    let selectedIndex = 0;
    
    for (let j = 0; j < items.length; j++) {
      randomWeight -= items[j].weight;
      if (randomWeight <= 0) {
        selectedIndex = j;
        break;
      }
    }
    
    selected.push(items.splice(selectedIndex, 1)[0]);
  }
  
  return selected;
}
```

#### 5.2.4 leaderboard-updater

**文件:** `supabase/functions/leaderboard-updater/index.ts`

```typescript
// 每小时运行一次，更新排行榜
serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // 1. 更新学习排行榜(日榜)
    await updateLearningLeaderboard(supabase, 'daily', today);
    
    // 2. 更新教导排行榜(周榜)
    if (now.getDay() === 1) { // 周一更新周榜
      const weekStart = getWeekStart(now).toISOString().split('T')[0];
      await updateTeachingLeaderboard(supabase, 'weekly', weekStart);
    }
    
    // 3. 更新创作排行榜(月榜)
    if (now.getDate() === 1) { // 月初更新月榜
      const monthStart = getMonthStart(now).toISOString().split('T')[0];
      await updateCreationLeaderboard(supabase, 'monthly', monthStart);
    }
    
    // 4. 更新财富排行榜(实时)
    await updateWealthLeaderboard(supabase);
    
    return new Response(
      JSON.stringify({ success: true, updated_at: now.toISOString() }),
      { headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});

async function updateLearningLeaderboard(supabase: any, period: string, periodStart: string) {
  // 计算用户学习积分
  const { data: learningStats } = await supabase
    .from('daily_mining_stats')
    .select(`
      user_id,
      SUM(learn_rewards) as total_learn_rewards,
      SUM(lessons_completed) as total_lessons
    `)
    .eq('date', periodStart)
    .group('user_id')
    .order('total_learn_rewards', { ascending: false });
    
  // 更新排行榜
  const leaderboardEntries = learningStats?.map((stat, index) => ({
    user_id: stat.user_id,
    board_type: 'learning',
    period,
    period_start: periodStart,
    score: stat.total_learn_rewards,
    rank: index + 1,
    metrics: {
      rewards: stat.total_learn_rewards,
      lessons: stat.total_lessons
    }
  })) || [];
  
  await supabase
    .from('leaderboards')
    .upsert(leaderboardEntries, { 
      onConflict: 'user_id,board_type,period,period_start' 
    });
}

// ... 其他排行榜更新函数
```

---

## 6. 挖矿奖励计算引擎

### 6.1 四维挖矿计算公式

#### 6.1.1 学习挖矿 (Learn-to-Earn)

**基础公式:**
```
学习奖励 = 基础奖励 × 课程难度系数 × 完成质量系数 × 连续学习加成 × 等级加成
```

**具体实现:**
```typescript
interface LearnMiningCalculation {
  baseReward: number;      // 基础奖励 50-200 LAC
  difficultyMultiplier: number;  // L1=1.0, L2=1.5, L3=2.5, L4=4.0
  qualityScore: number;    // 基于测验成绩 0.3-1.0
  streakMultiplier: number;      // 连续打卡倍率 1.0-6.0
  levelBonus: number;      // 等级加成 1.0-1.25
}

function calculateLearningReward(params: LearnMiningCalculation): number {
  return params.baseReward * 
         params.difficultyMultiplier * 
         params.qualityScore * 
         params.streakMultiplier * 
         params.levelBonus;
}

// 质量系数计算
function calculateQualityScore(examScore: number): number {
  if (examScore < 60) return 0.1; // 不及格
  if (examScore < 70) return 0.3; // 及格
  if (examScore < 80) return 0.6; // 良好
  if (examScore < 90) return 0.8; // 优良
  if (examScore < 95) return 0.9; // 优秀
  return 1.0; // 完美
}

// 连续打卡倍率计算
function getStreakMultiplier(consecutiveDays: number): number {
  if (consecutiveDays >= 90) return 6.0;
  if (consecutiveDays >= 60) return 5.0;
  if (consecutiveDays >= 30) return 3.0;
  if (consecutiveDays >= 14) return 2.0;
  if (consecutiveDays >= 7) return 1.5;
  if (consecutiveDays >= 3) return 1.2;
  return 1.0;
}
```

#### 6.1.2 使用挖矿 (Use-to-Earn)

**基础公式:**
```
使用奖励 = 功能基础值 × 使用深度系数 × 频率衰减系数 × 连续加成
```

**具体实现:**
```typescript
interface UseMiningCalculation {
  toolType: 'chat' | 'image' | 'code' | 'analyze' | 'create';
  usageTime: number;      // 使用时长(秒)
  dailyUsageCount: number; // 今日使用次数
  qualityScore?: number;   // 输出质量(可选)
}

function calculateUsageReward(params: UseMiningCalculation): number {
  // 功能系数
  const toolMultipliers = {
    chat: 1.0,
    image: 2.0,
    code: 3.0,
    analyze: 2.5,
    create: 3.0
  };
  
  // 使用深度系数
  let depthMultiplier = 0.2; // 默认浅度使用
  if (params.usageTime >= 300) depthMultiplier = 1.0; // 深度使用(5分钟+)
  else if (params.usageTime >= 30) depthMultiplier = 0.6; // 中度使用
  
  // 频率衰减
  let frequencyMultiplier = 1.0;
  if (params.dailyUsageCount > 30) frequencyMultiplier = 0; // 封顶
  else if (params.dailyUsageCount > 15) frequencyMultiplier = 0.2;
  else if (params.dailyUsageCount > 5) frequencyMultiplier = 0.5;
  
  const baseReward = 15; // 基础15 LAC
  
  return baseReward * 
         toolMultipliers[params.toolType] * 
         depthMultiplier * 
         frequencyMultiplier *
         (params.qualityScore || 1.0);
}
```

#### 6.1.3 教导挖矿 (Teach-to-Earn)

**基础公式:**
```
教导奖励 = (点赞×1 + 评论×3 + 收藏×5) × 质量系数 × 原创度系数
```

**T+7结算机制:**
```typescript
interface TeachMiningCalculation {
  likes: number;
  comments: number;
  bookmarks: number;
  aiQualityScore: number;    // AI评估质量 0.0-1.0
  communityRating: number;   // 社区评分 0.0-1.0
  originalityScore: number;  // 原创度 0.0-1.0
}

function calculateTeachingReward(params: TeachMiningCalculation): number {
  // 互动积分
  const interactionScore = params.likes * 1 + params.comments * 3 + params.bookmarks * 5;
  
  // 质量系数 (AI评分60% + 社区评分40%)
  const qualityMultiplier = params.aiQualityScore * 0.6 + params.communityRating * 0.4;
  
  // 原创度系数
  let originalityMultiplier = 1.0;
  if (params.originalityScore < 0.3) originalityMultiplier = 0.2; // 低原创
  else if (params.originalityScore < 0.6) originalityMultiplier = 0.6; // 中等
  else if (params.originalityScore < 0.8) originalityMultiplier = 1.0; // 高原创
  
  return interactionScore * qualityMultiplier * originalityMultiplier;
}

// T+7延迟结算函数
async function settleTutorialRewards() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  // 查找7天前发布的待结算内容
  const { data: contentToSettle } = await supabase
    .from('teaching_contents')
    .select('*')
    .eq('settlement_date', null)
    .lte('created_at', sevenDaysAgo.toISOString());
    
  for (const content of contentToSettle || []) {
    // 计算最终奖励
    const reward = calculateTeachingReward({
      likes: content.like_count,
      comments: content.comment_count,
      bookmarks: content.bookmark_count,
      aiQualityScore: await getAIQualityScore(content.content),
      communityRating: content.rating,
      originalityScore: await checkOriginality(content.content)
    });
    
    // 发放奖励
    await issueMiningReward(content.author_id, 'teach', content.id, reward);
    
    // 更新结算状态
    await supabase
      .from('teaching_contents')
      .update({ 
        settled_lac_reward: reward,
        settlement_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', content.id);
  }
}
```

#### 6.1.4 创造挖矿 (Create & Sell)

**直接销售分成机制:**
```typescript
interface CreateMiningCalculation {
  salePrice: number;        // 销售价格 LAC
  platformFeeRate: number;  // 平台抽成比例 0.10-0.15
  creatorLevel: number;     // 创作者等级 1-6
}

function calculateCreatorEarnings(params: CreateMiningCalculation): {
  creatorEarns: number;
  platformFee: number;
  burnAmount: number;
} {
  // 等级折扣 (高等级创作者享受低抽成)
  let actualFeeRate = params.platformFeeRate;
  if (params.creatorLevel >= 6) actualFeeRate -= 0.06; // 钻石级-6%
  else if (params.creatorLevel >= 5) actualFeeRate -= 0.04; // 黄金级-4%
  else if (params.creatorLevel >= 4) actualFeeRate -= 0.02; // 白银级-2%
  
  const platformFee = params.salePrice * actualFeeRate;
  const creatorEarns = params.salePrice - platformFee;
  
  // 平台费用的50%用于销毁
  const burnAmount = platformFee * 0.5;
  
  return {
    creatorEarns,
    platformFee,
    burnAmount
  };
}
```

### 6.2 防作弊逻辑

#### 6.2.1 多层防作弊架构

```typescript
interface AntiCheatSystem {
  // 第一层：行为模式检测
  behaviorAnalyzer: BehaviorAnalyzer;
  
  // 第二层：统计异常检测
  statisticalDetector: StatisticalDetector;
  
  // 第三层：社交图谱分析
  socialGraphAnalyzer: SocialGraphAnalyzer;
  
  // 第四层：经济模型约束
  economicConstraints: EconomicConstraints;
}

class BehaviorAnalyzer {
  analyzeLearnPattern(userId: string, sessions: LearningSession[]): RiskScore {
    let riskScore = 0;
    
    // 时间分布异常
    const timeDistribution = this.analyzeTimeDistribution(sessions);
    if (timeDistribution.variance < 0.1) riskScore += 30; // 时间过于规律
    
    // 答题模式检测
    const answerPatterns = this.analyzeAnswerPatterns(sessions);
    if (answerPatterns.randomness < 0.3) riskScore += 40; // 答案缺乏随机性
    
    // 鼠标轨迹分析
    const mouseActivity = this.analyzeMouseActivity(sessions);
    if (mouseActivity.averageMovements < 5) riskScore += 25; // 鼠标活动过少
    
    return new RiskScore(riskScore, 'behavior');
  }
  
  private analyzeTimeDistribution(sessions: LearningSession[]): {variance: number} {
    const durations = sessions.map(s => s.duration);
    const mean = durations.reduce((a, b) => a + b) / durations.length;
    const variance = durations.reduce((acc, dur) => acc + Math.pow(dur - mean, 2), 0) / durations.length;
    return { variance: variance / (mean * mean) }; // 归一化方差
  }
}

class StatisticalDetector {
  detectOutliers(userId: string, period: '24h' | '7d' | '30d'): RiskScore {
    let riskScore = 0;
    
    // 获取用户产出数据
    const userOutput = this.getUserOutput(userId, period);
    const peerAverages = this.getPeerAverages(userId, period);
    
    // 3σ异常检测
    Object.keys(userOutput).forEach(metric => {
      const userValue = userOutput[metric];
      const peerMean = peerAverages[metric].mean;
      const peerStdDev = peerAverages[metric].stdDev;
      
      const zScore = Math.abs((userValue - peerMean) / peerStdDev);
      
      if (zScore > 3) { // 3σ外的异常值
        riskScore += Math.min(50, zScore * 10); // 最高50分
      }
    });
    
    return new RiskScore(riskScore, 'statistical');
  }
}

class SocialGraphAnalyzer {
  detectSybilAttacks(userId: string): RiskScore {
    let riskScore = 0;
    
    // 设备指纹聚类
    const deviceCluster = this.getDeviceCluster(userId);
    if (deviceCluster.size > 1) {
      riskScore += 30 * deviceCluster.size; // 每个关联账户+30分
    }
    
    // IP地址关联
    const ipCluster = this.getIPCluster(userId);
    if (ipCluster.size > 3) {
      riskScore += 15 * (ipCluster.size - 3);
    }
    
    // 互动模式分析(防刷赞联盟)
    const interactionGraph = this.buildInteractionGraph(userId);
    const circularInteractions = this.detectCircularInteractions(interactionGraph);
    if (circularInteractions.length > 0) {
      riskScore += 40; // 发现环形互动网络
    }
    
    return new RiskScore(riskScore, 'social_graph');
  }
}
```

#### 6.2.2 日上限控制机制

```typescript
interface DailyLimits {
  learn: number;    // 500 LAC
  use: number;      // 300 LAC
  teach: number;    // 2000 LAC
  create: number;   // 5000 LAC
}

class DailyLimitController {
  async checkAndApplyLimits(
    userId: string, 
    rewardType: keyof DailyLimits, 
    proposedReward: number
  ): Promise<{allowed: boolean, actualReward: number}> {
    
    const today = new Date().toISOString().split('T')[0];
    
    // 获取今日已获得奖励
    const { data: todayStats } = await supabase
      .from('daily_mining_stats')
      .select(`${rewardType}_rewards`)
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    
    const currentRewards = todayStats?.[`${rewardType}_rewards`] || 0;
    const limit = this.getDailyLimit(rewardType);
    
    // 检查是否超限
    if (currentRewards >= limit) {
      return { allowed: false, actualReward: 0 };
    }
    
    // 计算实际可发放奖励
    const remainingQuota = limit - currentRewards;
    const actualReward = Math.min(proposedReward, remainingQuota);
    
    return { allowed: true, actualReward };
  }
  
  private getDailyLimit(rewardType: keyof DailyLimits): number {
    const baseLimits: DailyLimits = {
      learn: 500,
      use: 300, 
      teach: 2000,
      create: 5000
    };
    
    // 连续打卡可以突破基础上限(最多3倍)
    // 这里简化处理，实际需要查询用户连续打卡天数
    return baseLimits[rewardType];
  }
}
```

#### 6.2.3 连续打卡倍率衰减模型

```typescript
class StreakSystem {
  calculateStreakMultiplier(consecutiveDays: number): number {
    const multipliers = [
      { threshold: 90, multiplier: 6.0 },  // 90天+ 6倍
      { threshold: 60, multiplier: 5.0 },  // 60天  5倍
      { threshold: 30, multiplier: 3.0 },  // 30天  3倍
      { threshold: 14, multiplier: 2.0 },  // 14天  2倍
      { threshold: 7,  multiplier: 1.5 },  // 7天   1.5倍
      { threshold: 3,  multiplier: 1.2 },  // 3天   1.2倍
      { threshold: 0,  multiplier: 1.0 }   // 基础  1倍
    ];
    
    for (const tier of multipliers) {
      if (consecutiveDays >= tier.threshold) {
        return tier.multiplier;
      }
    }
    return 1.0;
  }
  
  async updateUserStreak(userId: string, date: string): Promise<void> {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // 检查昨天是否有学习记录
    const { data: yesterdayActivity } = await supabase
      .from('daily_mining_stats')
      .select('id')
      .eq('user_id', userId)
      .eq('date', yesterdayStr)
      .single();
    
    // 获取当前用户连续天数
    const { data: user } = await supabase
      .from('users')
      .select('streak_days, last_checkin')
      .eq('id', userId)
      .single();
    
    let newStreakDays = 1;
    
    // 如果昨天有活动，连续天数+1
    if (yesterdayActivity && user) {
      newStreakDays = user.streak_days + 1;
    }
    
    // 更新用户连续打卡记录
    await supabase
      .from('users')
      .update({
        streak_days: newStreakDays,
        last_checkin: date
      })
      .eq('id', userId);
  }
  
  // 断签保护机制
  async useStreakProtection(userId: string): Promise<boolean> {
    const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    
    // 检查本月是否已使用过保护
    const { data: usage } = await supabase
      .from('streak_protections')
      .select('id')
      .eq('user_id', userId)
      .eq('used_month', thisMonth)
      .single();
    
    if (usage) {
      return false; // 本月已使用过
    }
    
    // 记录保护使用
    await supabase
      .from('streak_protections')
      .insert({
        user_id: userId,
        used_month: thisMonth,
        used_at: new Date().toISOString()
      });
    
    return true;
  }
}
```

---

## 7. 安全与权限

### 7.1 Row Level Security (RLS) 策略

#### 7.1.1 用户数据安全

```sql
-- 用户表RLS策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的完整信息，其他人只能看到公开信息
CREATE POLICY "用户信息访问控制" ON users
  FOR SELECT USING (
    CASE 
      WHEN id = auth.uid() THEN TRUE  -- 自己的完整信息
      ELSE (                          -- 他人的公开信息
        email IS NULL AND           -- 隐藏邮箱
        social_links IS NOT NULL    -- 仅显示公开社交信息
      )
    END
  );

-- 仅可更新自己的信息
CREATE POLICY "用户信息更新" ON users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 钱包信息完全私有
CREATE POLICY "钱包信息私有" ON user_wallets
  FOR ALL USING (user_id = auth.uid());
```

#### 7.1.2 挖矿数据安全

```sql
-- 挖矿奖励记录私有
CREATE POLICY "挖矿记录私有" ON mining_rewards
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "挖矿记录插入" ON mining_rewards
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    -- 只能通过Edge Function插入，确保计算正确
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- 每日统计私有
CREATE POLICY "每日统计私有" ON daily_mining_stats
  FOR ALL USING (user_id = auth.uid());
```

#### 7.1.3 交易数据安全

```sql
-- 市场商品：公开商品所有人可见，私有商品仅卖家可见
CREATE POLICY "市场商品可见性" ON market_items
  FOR SELECT USING (
    status IN ('active', 'auction') OR  -- 公开商品
    seller_id = auth.uid()              -- 卖家自己的商品
  );

-- 仅商品所有者可管理
CREATE POLICY "商品管理权限" ON market_items
  FOR UPDATE USING (seller_id = auth.uid());
  
CREATE POLICY "商品删除权限" ON market_items
  FOR DELETE USING (seller_id = auth.uid());

-- 订单：买卖双方可见
CREATE POLICY "订单可见性" ON market_orders
  FOR SELECT USING (
    buyer_id = auth.uid() OR 
    seller_id = auth.uid()
  );
```

### 7.2 API权限分级

#### 7.2.1 权限等级定义

| 等级 | 名称 | 权限描述 |
|------|------|---------|
| 0 | Public | 无需认证，公开访问 |
| 1 | User | 需要用户认证 |
| 2 | Level3+ | 需要用户等级3以上 |
| 3 | Level4+ | 需要用户等级4以上(师傅、创作者) |
| 4 | Moderator | 内容审核员 |
| 5 | Admin | 系统管理员 |
| 6 | Service | 内部服务调用 |

#### 7.2.2 权限检查中间件

```typescript
// Supabase Edge Functions权限检查
async function checkPermission(req: Request, requiredLevel: number): Promise<{allowed: boolean, user?: any}> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return { allowed: requiredLevel === 0 }; // 仅Public接口允许无认证
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { allowed: false };
    }
    
    // 获取用户详细信息
    const { data: userProfile } = await supabase
      .from('users')
      .select('level, status, role')
      .eq('id', user.id)
      .single();
    
    if (!userProfile || userProfile.status !== 'active') {
      return { allowed: false };
    }
    
    // 权限检查
    let hasPermission = false;
    
    switch (requiredLevel) {
      case 0: hasPermission = true; break;  // Public
      case 1: hasPermission = true; break;  // User (已认证)
      case 2: hasPermission = userProfile.level >= 3; break;  // Level3+
      case 3: hasPermission = userProfile.level >= 4; break;  // Level4+
      case 4: hasPermission = userProfile.role === 'moderator' || userProfile.role === 'admin'; break;
      case 5: hasPermission = userProfile.role === 'admin'; break;
      case 6: hasPermission = token === Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); break;
    }
    
    return { allowed: hasPermission, user: userProfile };
    
  } catch (error) {
    console.error('Permission check failed:', error);
    return { allowed: false };
  }
}
```

### 7.3 API调用频率限制

```typescript
class RateLimiter {
  // 基于Redis的频率限制
  async checkRateLimit(userId: string, endpoint: string): Promise<{allowed: boolean, remaining: number}> {
    const key = `rate_limit:${userId}:${endpoint}`;
    
    // 不同端点的限制策略
    const limits = {
      '/mining/learn/complete-lesson': { requests: 100, window: 3600 }, // 1小时100次
      '/mining/use/start-session': { requests: 200, window: 3600 },     // 1小时200次
      '/teach/publish-content': { requests: 10, window: 86400 },        // 1天10次
      '/marketplace/buy': { requests: 50, window: 3600 },               // 1小时50次购买
      'default': { requests: 1000, window: 3600 }                       // 默认限制
    };
    
    const limit = limits[endpoint] || limits['default'];
    
    // 使用滑动窗口算法检查频率
    const current = await this.getCurrentCount(key, limit.window);
    
    if (current >= limit.requests) {
      return { allowed: false, remaining: 0 };
    }
    
    await this.incrementCount(key, limit.window);
    return { allowed: true, remaining: limit.requests - current - 1 };
  }
  
  private async getCurrentCount(key: string, windowSize: number): Promise<number> {
    // Redis ZREMRANGEBYSCORE 删除过期记录
    const now = Date.now();
    const cutoff = now - (windowSize * 1000);
    
    // 这里需要实际的Redis客户端实现
    // 伪代码展示逻辑
    return 0; // 实际实现中返回当前窗口内的请求次数
  }
  
  private async incrementCount(key: string, windowSize: number): Promise<void> {
    // Redis ZADD 添加当前时间戳
    const now = Date.now();
    // 实际实现中向有序集合添加时间戳
  }
}
```

---

## 8. 性能优化

### 8.1 数据库索引优化

#### 8.1.1 查询分析与索引设计

```sql
-- 1. 用户查询优化
-- 常用查询：按用户名查找、按等级排序、按注册时间排序
CREATE INDEX CONCURRENTLY idx_users_username_trgm ON users USING gin(username gin_trgm_ops);
CREATE INDEX CONCURRENTLY idx_users_level_created ON users(level DESC, created_at DESC);
CREATE INDEX CONCURRENTLY idx_users_lac_balance_desc ON users(lac_balance DESC) WHERE lac_balance > 0;

-- 2. 挖矿记录优化
-- 常用查询：用户挖矿历史、按时间范围、按奖励类型
CREATE INDEX CONCURRENTLY idx_mining_rewards_user_time ON mining_rewards(user_id, earned_at DESC);
CREATE INDEX CONCURRENTLY idx_mining_rewards_type_time ON mining_rewards(reward_type, earned_at DESC);
CREATE INDEX CONCURRENTLY idx_mining_rewards_pending ON mining_rewards(status, earned_at) WHERE status = 'pending';

-- 3. 排行榜查询优化
-- 常用查询：按榜单类型、时间段、分数排序
CREATE INDEX CONCURRENTLY idx_leaderboards_board_period_rank ON leaderboards(board_type, period, period_start, rank);
CREATE INDEX CONCURRENTLY idx_leaderboards_score_desc ON leaderboards(board_type, period, period_start, score DESC);

-- 4. 市场商品优化
-- 常用查询：按分类、价格区间、创建时间、状态
CREATE INDEX CONCURRENTLY idx_market_items_category_status ON market_items(category, status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY idx_market_items_price_range ON market_items(price) WHERE status = 'active';
CREATE INDEX CONCURRENTLY idx_market_items_featured_created ON market_items(featured DESC, created_at DESC) WHERE status = 'active';

-- 5. 学习进度优化
-- 常用查询：用户课程进度、完成状态
CREATE INDEX CONCURRENTLY idx_user_course_progress_user_status ON user_course_progress(user_id, status);
CREATE INDEX CONCURRENTLY idx_user_course_progress_course_completion ON user_course_progress(course_id, completed_at) WHERE completed_at IS NOT NULL;
```

#### 8.1.2 分区表设计

```sql
-- 挖矿奖励按月分区 (历史数据量大)
CREATE TABLE mining_rewards_partitioned (
    LIKE mining_rewards INCLUDING ALL
) PARTITION BY RANGE (earned_at);

-- 创建月度分区
CREATE TABLE mining_rewards_2026_07 PARTITION OF mining_rewards_partitioned
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
    
CREATE TABLE mining_rewards_2026_08 PARTITION OF mining_rewards_partitioned
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

-- 每日统计按月分区
CREATE TABLE daily_mining_stats_partitioned (
    LIKE daily_mining_stats INCLUDING ALL
) PARTITION BY RANGE (date);
```

### 8.2 查询优化策略

#### 8.2.1 复杂查询优化

```sql
-- 排行榜查询优化（避免实时计算）
CREATE MATERIALIZED VIEW leaderboard_cache AS
SELECT 
    board_type,
    period,
    period_start,
    user_id,
    score,
    ROW_NUMBER() OVER (PARTITION BY board_type, period, period_start ORDER BY score DESC) as rank,
    updated_at
FROM leaderboards
WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days';

-- 创建唯一索引支持并发刷新
CREATE UNIQUE INDEX ON leaderboard_cache (board_type, period, period_start, user_id);

-- 定时刷新（通过Edge Function调用）
REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_cache;
```

#### 8.2.2 API响应缓存

```typescript
// Redis缓存层
class CacheManager {
  private redis: RedisClient;
  
  async getLeaderboard(boardType: string, period: string): Promise<LeaderboardEntry[] | null> {
    const cacheKey = `leaderboard:${boardType}:${period}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    // 从数据库查询
    const { data } = await supabase
      .from('leaderboard_cache')
      .select('*')
      .eq('board_type', boardType)
      .eq('period', period)
      .order('rank');
    
    // 缓存5分钟
    await this.redis.setex(cacheKey, 300, JSON.stringify(data));
    
    return data;
  }
  
  async getCoursesList(category?: string): Promise<Course[] | null> {
    const cacheKey = `courses:${category || 'all'}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    let query = supabase
      .from('courses')
      .select(`
        id, title, description, thumbnail_url, category, difficulty,
        estimated_duration, base_lac_reward, enrollment_count,
        completion_count, rating, rating_count
      `)
      .eq('status', 'published');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data } = await query.order('featured', { ascending: false });
    
    // 缓存10分钟
    await this.redis.setex(cacheKey, 600, JSON.stringify(data));
    
    return data;
  }
  
  // 缓存失效机制
  async invalidateUserCache(userId: string) {
    const pattern = `user:${userId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
  
  async invalidateLeaderboardCache(boardType?: string) {
    const pattern = boardType ? `leaderboard:${boardType}:*` : 'leaderboard:*';
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### 8.3 CDN与存储优化

#### 8.3.1 Supabase Storage配置

```typescript
// 媒体文件存储策略
const storageConfig = {
  // 用户头像
  avatars: {
    bucket: 'avatars',
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    optimization: {
      resize: { width: 200, height: 200 },
      quality: 80,
      format: 'webp'
    }
  },
  
  // 课程缩略图
  course_thumbnails: {
    bucket: 'course-media',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    optimization: {
      resize: { width: 400, height: 300 },
      quality: 85,
      format: 'webp'
    }
  },
  
  // 市场商品图片
  market_images: {
    bucket: 'market-media',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/*'],
    optimization: {
      resize: { width: 800, height: 600 },
      quality: 90
    }
  },
  
  // 创作者文件
  creator_files: {
    bucket: 'creator-content',
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['*/*'], // 允许所有类型
    encryption: true
  }
};

// 文件上传处理函数
async function uploadFile(
  file: File, 
  type: keyof typeof storageConfig, 
  userId: string
): Promise<{url: string, path: string}> {
  
  const config = storageConfig[type];
  
  // 验证文件类型和大小
  if (!isAllowedType(file.type, config.allowedTypes)) {
    throw new Error(`File type ${file.type} not allowed`);
  }
  
  if (file.size > config.maxSize) {
    throw new Error(`File size exceeds ${config.maxSize} bytes`);
  }
  
  // 生成文件路径
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  // 优化图片(如果需要)
  let fileToUpload = file;
  if (config.optimization && file.type.startsWith('image/')) {
    fileToUpload = await optimizeImage(file, config.optimization);
  }
  
  // 上传到Supabase Storage
  const { data, error } = await supabase.storage
    .from(config.bucket)
    .upload(fileName, fileToUpload, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  // 获取公开URL
  const { data: { publicUrl } } = supabase.storage
    .from(config.bucket)
    .getPublicUrl(fileName);
  
  return { url: publicUrl, path: fileName };
}
```

#### 8.3.2 CDN缓存策略

```typescript
// HTTP缓存头设置
const cacheStrategies = {
  // 静态资源 - 长期缓存
  static: {
    'Cache-Control': 'public, max-age=31536000, immutable', // 1年
    'Vary': 'Accept-Encoding'
  },
  
  // API数据 - 短期缓存
  api: {
    'Cache-Control': 'public, max-age=300, s-maxage=600', // 5分钟客户端，10分钟CDN
    'Vary': 'Authorization'
  },
  
  // 用户数据 - 私有缓存
  user: {
    'Cache-Control': 'private, max-age=60', // 1分钟私有缓存
    'Vary': 'Authorization'
  },
  
  // 排行榜 - 中期缓存
  leaderboard: {
    'Cache-Control': 'public, max-age=300, s-maxage=300', // 5分钟
    'Vary': 'Accept'
  }
};

// Edge Function响应缓存
function setCacheHeaders(response: Response, strategy: keyof typeof cacheStrategies) {
  const headers = cacheStrategies[strategy];
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}
```

---

## 总结

本文档详细设计了LAC项目的后端架构，包括：

### 核心特性 ✅
- **完整API架构**：8大模块，100+端点，支持四维挖矿和完整业务流程
- **PostgreSQL Schema**：25+张表，完整RLS安全策略，优化索引设计
- **实时功能**：基于Supabase Realtime的排行榜、挖矿通知、拍卖竞价
- **Edge Functions**：10个核心函数，处理复杂业务逻辑和定时任务
- **挖矿引擎**：四维计算公式，多层防作弊机制，经济模型约束
- **安全体系**：RLS策略，权限分级，频率限制，数据加密

### 技术亮点 🚀
- **基于Supabase**：一体化BaaS解决方案，降低运维复杂度
- **实时能力**：WebSocket订阅，毫秒级数据同步
- **防作弊系统**：AI驱动的行为分析，社交图谱检测，统计异常识别
- **经济模型**：连续打卡倍率，日上限控制，通缩销毁机制
- **性能优化**：分区表，物化视图，Redis缓存，CDN加速

### 可扩展性 📈
- **模块化设计**：松耦合架构，支持独立扩展
- **分布式部署**：Edge Functions全球分发
- **数据分区**：支持海量历史数据存储
- **缓存策略**：多层缓存，减少数据库压力

这套架构能够支撑LAC从MVP到百万级用户的增长需求，为"学习即挖矿，拥抱即未来"的愿景提供坚实的技术基础。

---

**架构师签名：小技💻**  
**完成时间：2026-02-21**  
**文档状态：Ready for Implementation 🚀**