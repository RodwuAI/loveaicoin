# 全站断链/空内容审计清单

## 一、href="#" 空链接（点了没反应）

### 首页 (page.tsx)
| 位置 | 按钮文字 | 应该链接到 | 优先级 |
|------|---------|-----------|-------|
| AI签到墙 | "注册你的AI →" | `/ai-join` | P0 |
| 底部CTA | "💬 加入社区" | `/community` | P0 |

### 路线图 (/roadmap)
| 位置 | 按钮文字 | 应该链接到 |
|------|---------|-----------|
| 底部CTA | "🚀 加入社区" | `/community` |

### 代币经济 (/tokenomics)
| 位置 | 按钮文字 | 应该链接到 |
|------|---------|-----------|
| 底部CTA | "🚀 加入社区" | `/community` |

### 白皮书 (/whitepaper-doc)
| 位置 | 按钮文字 | 应该链接到 |
|------|---------|-----------|
| 顶部 | "📥 下载 PDF" | 需生成PDF或移除按钮 |

### 社区页 (/community)
| 位置 | 数量 | 说明 |
|------|------|------|
| 4个频道卡片 | 4个 | Discord/Telegram/Twitter/GitHub 全部href="#" |

## 二、Footer链接错误（全指向首页"/"）

| 链接文字 | 当前指向 | 应该指向 |
|---------|---------|---------|
| 学习中心 | `/` | `/learn` |
| AI工具箱 | `/` | `/ai-tools` |
| 创作者市场 | `/` | `/market` |
| 排行榜 | `/` | `/community`（或新建排行榜页） |
| 品牌资源 | `/` | 移除或指向品牌资源页 |

## 三、Footer社交媒体链接（指向通用官网）

| 图标 | 当前指向 | 应改为 |
|------|---------|-------|
| 𝕏 Twitter | twitter.com | ⏳ 等CEO注册后更新 |
| ✈️ Telegram | telegram.org | ⏳ 等CEO创建群后更新 |
| 💬 Discord | discord.com | ⏳ 等CEO创建服务器后更新 |
| ⌨ GitHub | github.com | github.com/RodwuAI/loveaicoin |

## 四、Footer社区栏 href="#"

| 链接文字 | 应该指向 |
|---------|---------|
| Discord | ⏳ 等CEO创建 |
| Telegram | ⏳ 等CEO创建 |
| 论坛 | 移除（暂无论坛） |
| 治理提案 | 移除（暂无治理） |

## 五、页面内假数据/硬编码

| 页面 | 问题 | 严重程度 |
|------|------|---------|
| /checkin | 签到数据硬编码，点签到无真实后端逻辑 | P1（有Edge Function但前端未完全对接） |
| /profile | 用户数据部分硬编码 | P1 |
| /community | 排行榜数据硬编码 | P2 |
| /market | 市场数据全硬编码 | P2 |
| /teach | 教学数据全硬编码 | P2 |
| /ai-tools | AI工具列表硬编码 | P2 |
| /tokenomics | 初始价格$0.0005未脱敏 | P1（CEO要求用*号） |

## 六、可立即修复的（不需要CEO）

1. ✅ 首页"注册你的AI" → `/ai-join`
2. ✅ 所有"加入社区"按钮 → `/community`
3. ✅ Footer产品链接 → 正确路径
4. ✅ Footer GitHub → `github.com/RodwuAI/loveaicoin`
5. ✅ Footer移除暂无的链接（论坛、治理提案、品牌资源）
6. ✅ 白皮书"下载PDF"按钮 → 移除或改为"在线阅读"
7. ✅ tokenomics价格脱敏

## 七、需要CEO操作的

1. ⏳ 注册Twitter @LoveAICoin → 更新Footer链接
2. ⏳ 创建Telegram群 → 更新Footer链接
3. ⏳ 创建Discord服务器 → 更新Footer链接
