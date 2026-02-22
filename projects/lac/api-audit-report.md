# LAC 网站前后端接口审计报告

## 审计概览
- **审计时间**: 2026-02-22
- **前端代码位置**: `/Users/fiveowu/.openclaw/workspace/projects/lac/lac-website/`
- **已部署的 Supabase Edge Functions**: 6个
- **审计页面数**: 30+ 个页面

## 已部署的 Edge Functions 使用情况

| 函数名称 | 功能描述 | 前端使用情况 | 状态 |
|----------|----------|--------------|------|
| `auth-email` | 邮箱注册/登录 | ✅ 已在 `/login` 和 `/register` 页面调用 | 已支持 |
| `mining-checkin` | 每日签到挖矿 | ✅ 已在 `/checkin` 页面调用 | 已支持 |
| `user-profile` | 获取用户资料 | ✅ 已在 `/profile` 页面调用 | 已支持 |
| `leaderboard` | 排行榜数据 | ✅ 已在 `/community` 页面调用（学习排行榜） | 已支持 |
| `auth-connect-wallet` | 钱包连接认证 | ❌ 未在前端找到调用 | 未使用 |
| `mining-learn` | 学习挖矿奖励 | ❌ 未在前端找到调用 | 未使用 |

## 前端直接数据库查询
- `supabase.from('courses')` 在 `/learn` 页面直接查询课程表 ✅（需要确保 `courses` 表存在）

---

## 后端接口需求清单

### ✅ 已有后端支持的接口

| 页面路径 | 功能描述 | API端点 | 状态 |
|----------|----------|---------|------|
| `/login` | 邮箱登录 | `POST /functions/v1/auth-email/signin` | ✅ |
| `/register` | 邮箱注册 | `POST /functions/v1/auth-email/signup` | ✅ |
| `/checkin` | 每日签到提交 | `POST /functions/v1/mining-checkin` | ✅ |
| `/profile` | 获取用户资料 | `GET /functions/v1/user-profile` | ✅ |
| `/community` | 获取学习排行榜 | `GET /functions/v1/leaderboard?type=learning&period=weekly&limit=10` | ✅ |
| `/learn` | 获取课程列表 | `supabase.from('courses').select('*')` | ✅（直接数据库） |

---

### ❌ 需要开发的接口（前端已写但后端没有）

#### P0 - 上线必须
| 页面路径 | 功能描述 | 需要的API端点 | 预估工作量（小时） | 备注 |
|----------|----------|---------------|-------------------|------|
| `/checkin` | 获取签到统计（连续天数、本月已签到、累计收益） | `GET /api/checkin/stats` | 4 | 需要返回连续签到天数、本月签到天数、累计签到收益 |
| `/checkin` | 获取签到日历数据 | `GET /api/checkin/calendar` | 6 | 返回用户本月签到日期列表，用于日历显示 |
| `/checkin` | 获取连续签到奖励进度 | `GET /api/checkin/rewards` | 4 | 返回当前连续天数，已解锁和未解锁的奖励 |
| `/learn/[id]` | 记录章节完成状态 | `POST /api/learn/progress` | 6 | 需要记录用户课程进度，并可能触发挖矿奖励（调用 `mining-learn`） |
| `/learn/[id]` | 获取课程进度 | `GET /api/learn/progress?courseId={id}` | 4 | 返回用户在该课程的进度（已完成章节） |
| `/learn` | 获取学习Dashboard数据 | `GET /api/learn/dashboard` | 6 | 总体进度、已完成课程数、累计获得LAC、当前等级 |
| `/profile` | 获取资产详情 | `GET /api/user/assets` | 6 | lac_balance, monthly_earned, growth_rate, completed_courses, total_courses, total_study_time, badges_count, rank, checkin_streak, monthly_checkins, checkin_earnings |
| `/profile` | 获取成就徽章列表 | `GET /api/user/achievements` | 4 | 返回用户已获得的成就徽章 |
| `/profile` | 获取交易记录 | `GET /api/user/transactions` | 6 | 返回学习、签到、教导等收益记录 |

#### P1 - 重要
| 页面路径 | 功能描述 | 需要的API端点 | 预估工作量（小时） | 备注 |
|----------|----------|---------------|-------------------|------|
| `/community` | 获取社区统计数据 | `GET /api/community/stats` | 3 | 社区总人数、各频道人数等 |
| `/community` | 获取公告列表 | `GET /api/community/announcements` | 4 | 按时间倒序返回公告 |
| `/community` | 获取活动列表 | `GET /api/community/events` | 4 | 即将到来的社区活动 |
| `/genesis` | 获取创世成员进度 | `GET /api/genesis/progress` | 3 | 当前创世成员数/总名额，进度百分比 |
| `/market` | 获取市场作品列表 | `GET /api/market/works` | 8 | 支持分类筛选、排序、分页 |
| `/market` | 购买作品 | `POST /api/market/purchase` | 8 | 处理LAC支付，发放作品权限 |
| `/market` | 发布作品 | `POST /api/market/publish` | 8 | 创作者上传作品到市场 |
| `/ai-tools` | 获取AI工具列表 | `GET /api/ai-tools` | 4 | 返回工具信息，包括价格、使用次数等 |
| `/ai-tools` | 使用AI工具 | `POST /api/ai-tools/use` | 6 | 扣除LAC余额，记录使用次数 |
| `/ai-tools` | 获取工具使用统计 | `GET /api/ai-tools/stats` | 3 | 今日免费额度、LAC余额、使用历史 |
| `/charity-join` | 获取公益项目列表 | `GET /api/charity/projects` | 5 | 返回项目详情、筹款进度等 |
| `/charity-join` | 捐赠项目 | `POST /api/charity/donate` | 6 | 处理LAC/USDT捐赠，更新项目进度 |
| `/charity-join` | 提交公益项目申请 | `POST /api/charity/submit` | 5 | 保存申请到数据库，等待审核 |
| `/teach` | 获取教学帖子列表 | `GET /api/teach/posts` | 6 | 支持分类、类型、难度筛选 |
| `/teach` | 发布教学帖子 | `POST /api/teach/publish` | 6 | 创建图文、视频、直播教学 |
| `/teach` | 打赏教学 | `POST /api/teach/tip` | 4 | 向教学者打赏LAC |
| `/teach` | 获取我的教学统计 | `GET /api/teach/my-stats` | 3 | 发布教程数、获得打赏数等 |

#### P2 - 可延后
| 页面路径 | 功能描述 | 需要的API端点 | 预估工作量（小时） | 备注 |
|----------|----------|---------------|-------------------|------|
| `/learn` | 获取热门专区内容 | `GET /api/learn/hot` | 4 | 热门AI课程推荐 |
| `/learn` | 获取OpenClaw专区内容 | `GET /api/learn/openclaw` | 4 | OpenClaw相关课程 |
| `/mining/*` | 挖矿数据统计 | `GET /api/mining/stats` | 6 | 各维度挖矿收益汇总 |
| `/market` | 获取明星创作者 | `GET /api/market/top-creators` | 4 | 按收益或作品数排序 |
| `/profile` | 连接钱包绑定 | `POST /api/user/connect-wallet` | 6 | 调用 `auth-connect-wallet` Edge Function |
| `/checkin` | 签到排行榜（非学习） | `GET /api/checkin/leaderboard` | 4 | 按连续签到天数或总签到收益排名 |

---

### ⚠️ 前端目前是假数据/硬编码，需要后端化的功能

#### 1. 签到页面 (`/checkin`)
- **假数据**：连续签到7天、本月已签到15天、累计获得350 LAC
- **假数据**：日历数据（随机生成已签到日期）
- **假数据**：连续签到奖励进度（当前7天，已解锁前几档）
- **假数据**：排行榜数据（硬编码5个用户）

#### 2. 个人资料页面 (`/profile`)
- **假数据**：资产概览字段（lac_balance, monthly_earned, growth_rate等）
- **假数据**：成就徽章（4个硬编码成就）
- **假数据**：交易记录（5条硬编码交易）

#### 3. 学习页面 (`/learn`)
- **假数据**：热门专区内容（5条硬编码）
- **假数据**：OpenClaw专区内容（5条硬编码）
- **假数据**：学习Dashboard数据（总体进度60%、已完成3门课、累计250 LAC、等级Lv.3）

#### 4. 学习详情页面 (`/learn/[id]`)
- **假数据**：所有课程数据硬编码（5门课程）
- **假数据**：章节完成状态仅存于前端，未同步到后端

#### 5. 社区页面 (`/community`)
- **假数据**：频道数据（Twitter, Telegram, Discord, GitHub）
- **假数据**：公告列表（3条硬编码）
- **假数据**：活动列表（2条硬编码）
- **假数据**：社区总人数（12,580）

#### 6. 创世页面 (`/genesis`)
- **假数据**：创世成员进度（1,273/10,000）

#### 7. 市场页面 (`/market`)
- **假数据**：精选作品（3个硬编码）
- **假数据**：作品列表（9个硬编码）
- **假数据**：明星创作者（3个硬编码）

#### 8. AI工具页面 (`/ai-tools`)
- **假数据**：工具列表（5个硬编码）
- **假数据**：使用统计（今日免费额度3次、LAC余额1,250、累计使用156次）

#### 9. 慈善页面 (`/charity-join`)
- **假数据**：公益项目列表（3个硬编码）
- **假数据**：捐赠等级（4档硬编码）

#### 10. 教导页面 (`/teach`)
- **假数据**：教学帖子列表（6条硬编码）
- **假数据**：我的教学统计（发布教程12个、获得打赏1,234 LAC）

---

## 总计工作量估算

| 优先级 | 接口数量 | 预估总工时（小时） |
|--------|----------|-------------------|
| P0     | 9        | 50                |
| P1     | 16       | 84                |
| P2     | 6        | 28                |
| **总计** | **31** | **162**           |

---

## 建议开发顺序

### 第一阶段（上线必须 - P0）
1. 签到相关API：签到统计、日历、奖励进度
2. 学习相关API：课程进度、Dashboard数据
3. 用户资料API：资产详情、成就徽章、交易记录

### 第二阶段（核心功能 - P1）
1. 社区API：统计数据、公告、活动
2. 市场API：作品列表、购买、发布
3. AI工具API：工具列表、使用、统计
4. 慈善API：项目列表、捐赠、提交
5. 教导API：帖子列表、发布、打赏

### 第三阶段（增强功能 - P2）
1. 热门推荐API
2. 挖矿数据统计API
3. 钱包连接绑定API
4. 其他排行榜API

---

## 注意事项

1. **数据库表需要创建**：除了现有的 `users` 表，可能需要以下表：
   - `courses`（课程）
   - `user_course_progress`（用户课程进度）
   - `checkin_records`（签到记录）
   - `transactions`（交易记录）
   - `achievements`（成就徽章）
   - `market_works`（市场作品）
   - `ai_tools`（AI工具）
   - `charity_projects`（公益项目）
   - `teaching_posts`（教学帖子）
   - 等等...

2. **Edge Functions 未使用**：`auth-connect-wallet` 和 `mining-learn` 已部署但未调用，需要确认是否需要整合。

3. **前端代码调整**：所有硬编码数据需要替换为API调用，前端需要增加加载状态和错误处理。

4. **安全性考虑**：所有涉及LAC交易的API需要严格验证用户权限和余额。

5. **性能优化**：排行榜、社区数据等可考虑缓存机制。

---

## 审计结论

LAC网站前端已完成大部分UI开发，但后端接口严重缺失。目前仅有的6个Edge Functions只覆盖了基础认证和部分功能，大量数据仍为硬编码。

**建议立即启动P0接口开发，以确保网站上线基本功能可用。** 预计需要约50小时完成P0接口，使签到、学习、个人资料等核心功能正常运作。

完成所有接口（P0+P1+P2）预计需要162小时，可分期迭代开发。