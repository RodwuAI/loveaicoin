# Phantom /explore 页面像素级规范
## 从 phantom.com/explore 实测提取，所有数值精确到像素

> ⚠️ 吴总指令：严格复制Phantom的字体、大小、颜色、排版关系，像素级！
> 但颜色用我们的品牌色替换（藏蓝+金色+暖灰），风格清新不重不乱

---

## 一、页面背景与基础

```
Phantom原值:
  html背景:     #1C1C1C (深灰黑)
  body文字色:    #FFFDF8 (暖白)
  body字体:      "Phantom" 自定义
  body字号:      16px
  body行高:      normal

我们的替换:
  html背景:     #F5F0E8 (暖灰)
  body文字色:    #1B2D6B (藏蓝)
  body字体:      "Inter", "PingFang SC", sans-serif
  body字号:      16px
  body行高:      normal
```

---

## 二、导航栏 (Header)

```
位置:          fixed
高度:          100px
背景:          透明

Logo:          左侧
导航链接:       中间偏左，文字16px，font-weight 400
               每个链接: padding 12px 24px, border-radius 50%（胶囊形）
               
               Phantom链接色: #FFFDF8
               我们的链接色:   #1B2D6B（默认）/ #1B2D6B/70（未激活）

CTA按钮 (Download → 开始探索):
  Phantom:     bg #AB9FF2(淡紫), color #1C1C1C(深黑), border-radius 32px, padding 16px 32px
  我们的:       bg #C5975B(金色), color #FFFFFF(白), border-radius 32px, padding 16px 32px
  字号:         16px, font-weight 400

搜索按钮:
  Phantom:     bg #28282C(深灰), border-radius 32px, padding 16px
  我们的:       bg #E8DCC8(浅金灰), border-radius 32px, padding 16px
```

---

## 三、页面标题 (H1)

```
Phantom:
  文案:         "Explore the [icon] ecosystem"
  字号:         64px
  字重:         400 (不加粗!)
  行高:         64px (1:1)
  字距:         -1.6px
  颜色:         #FFFDF8
  对齐:         center
  距顶部:        200px

我们的:
  文案:         根据页面内容定（首页"点时成金"，子页面各自标题）
  字号:         64px → 对中文适配改为 48px
  字重:         400（英文）/ 700（中文标题需要bold才有力度）
  行高:         1:1 → leading-none
  字距:         -1.6px → tracking-[-1.6px]（英文）/ tracking-tight（中文）
  颜色:         #1B2D6B
  对齐:         center
  距顶部:        200px → pt-[200px] 或 mt-[100px]（因为nav 100px + 间距100px）
```

---

## 四、副标题 (H1下方描述)

```
Phantom:
  文案:         "Discover tokens on Solana & beyond"
  字号:         20px
  字重:         400
  颜色:         #A09FA6 (中灰)

我们的:
  字号:         20px → text-xl
  字重:         400 → font-normal
  颜色:         #6B7280 (中灰)
```

---

## 五、搜索栏

```
Phantom搜索框:
  容器:         bg #28282C, border-radius 9999px(全圆), padding 11px 24px, height 44px
  边框:         1px solid transparent
  输入文字:      16px, #FFFDF8
  搜索图标:      18×18px
  placeholder:   "Search"

我们的:
  容器:         bg #FFFFFF, border-radius 9999px, padding 11px 24px, height 44px
  边框:         1px solid #1B2D6B/10
  输入文字:      16px, #1B2D6B
  搜索图标:      18×18px, #6B7280
  placeholder:   "搜索"
```

---

## 六、Section标题 (H2: "Trending Tokens", "Market Overview")

```
Phantom:
  字号:         30px
  字重:         400
  颜色:         #FFFDF8
  行高:         36px
  字距:         -0.75px

我们的:
  字号:         30px → text-[30px]
  字重:         400 → font-normal（注意！不加粗！）
  颜色:         #1B2D6B
  行高:         36px → leading-[36px]
  字距:         -0.75px → tracking-[-0.75px]

"View more" 链接:
  Phantom:     16px, font-weight 400, color #AB9FF2(紫)
  我们的:       16px, font-weight 400, color #C5975B(金色)
```

---

## 七、Trending Cards (横向滚动卡片)

```
Phantom卡片:
  背景:         #28282C (深灰)
  圆角:         16px
  内边距:        18px 20px
  宽度:         ~214px
  高度:         ~180px
  卡片间距:      无显式gap（靠flex排列）
  容器:         display flex, nowrap, overflow visible

我们的:
  背景:         #FFFFFF (白色)
  圆角:         16px → rounded-2xl
  内边距:        18px 20px → p-[18px] px-5
  宽度:         214px → w-[214px]
  高度:         180px → h-[180px]
  阴影:         shadow-[0_0_4px_rgba(197,151,91,0.08)]

卡片内部结构:
  ┌─────────────────┐
  │ [图标 48×48]     │  → 48×48px 圆形图标
  │                   │
  │ Token名 (ticker) │  → 15px, font-400, color #B4B4B4 → 我们用 #6B7280
  │ +84.65%          │  → 20px, font-400, color:
  │                   │     涨: #30A46C (绿) → 我们用 #30A46C（保持绿色不变）
  │                   │     跌: 红色 → 我们用 #EA3943
  │ $0.00000068      │  → 15px, font-400, color #FFFDF8 → 我们用 #1B2D6B
  └─────────────────┘
  
  图标和文字区域用flex column排列，gap 8px → gap-2
  文字区域内部: flex column, gap 8px, justify-center
```

---

## 八、Market Overview 表格

```
表格宽度:      1136px（fit内容区）
内容区最大宽度: 1560px，padding 0 32px

表头 (th):
  字号:         16px
  字重:         350 (介于light和normal之间) → 我们用 font-light (300)
  颜色:         #8D8C8A → 我们用 #9CA3AF
  padding:      0 0 32px (底部32px间距)
  对齐:         第一列left，其余right
  列名:         Token | Price | 24h Change | 24h Volume | Market Cap
  我们的列名:    名称 | 价格 | 24h涨跌 | 24h成交量 | 市值

表行 (tr):
  高度:         80px
  背景:         透明
  边框:         无border（行与行之间无分隔线！）
  hover:        无明显bg变化

表格单元格 (td):
  字号:         16px
  字重:         400
  颜色:         #FFFDF8 → 我们用 #1B2D6B
  padding:      0
  对齐:         第一列left，其余right

Token名称列结构:
  ┌──────────────────────────┐
  │ [图标48×48] Token名  代码 │
  │              18px/350  15px/400
  │              #FFFDF8   #B4B4B4
  └──────────────────────────┘
  
  图标:          48×48px
  Token名:       18px, font-weight 350 → 我们用 text-lg font-normal
  代码(ticker):  15px, font-weight 400, color #B4B4B4 → 我们用 text-[15px] text-[#9CA3AF]
  
  名称和代码之间: flex row, items-center, 图标和文字之间 gap ~12px

涨跌幅颜色:
  涨(正数):     #30A46C (保持)
  跌(负数):     #EA3943 (保持)
  持平/微变:     #B4B4B4 → #9CA3AF
```

---

## 九、整体页面间距 (垂直节奏)

```
从phantom.com/explore实测:
  Nav底部 → H1顶部:    ~100px (nav 100px高 + 100px间距 = 200px from top)
  H1底部 → 副标题:     紧跟
  副标题 → 搜索栏:     ~40px
  搜索栏 → Trending H2: ~100px
  Trending H2 → 卡片:   ~20px
  卡片 → Market H2:    ~100px
  Market H2 → 表头:    ~32px (就是th的padding-bottom)
  表行高度:             80px
```

---

## 十、颜色替换对照表（快速参考）

| Phantom原色 | 用途 | 我们的替换 | Tailwind |
|------------|------|----------|----------|
| `#1C1C1C` | 页面背景 | `#F5F0E8` | `bg-[#F5F0E8]` |
| `#FFFDF8` | 主文字 | `#1B2D6B` | `text-[#1B2D6B]` |
| `#A09FA6` | 副标题 | `#6B7280` | `text-[#6B7280]` |
| `#B4B4B4` | 次要文字(ticker) | `#9CA3AF` | `text-[#9CA3AF]` |
| `#8D8C8A` | 表头文字 | `#9CA3AF` | `text-[#9CA3AF]` |
| `#28282C` | 卡片/搜索框背景 | `#FFFFFF` | `bg-white` |
| `#34343A` | 搜索大框背景 | `#FFFFFF` | `bg-white` |
| `#AB9FF2` | 强调色(紫) | `#C5975B` | `text-[#C5975B]` |
| `#30A46C` | 涨(绿) | `#30A46C` | `text-[#30A46C]`(不变) |
| `#EA3943` | 跌(红) | `#EA3943` | `text-[#EA3943]`(不变) |

---

## 十一、字体层级完整对照

| 元素 | Phantom | 我们的 | Tailwind |
|------|---------|-------|----------|
| H1页面标题 | 64px / 400 / -1.6px | 48px / 700 / tight | `text-5xl font-bold tracking-tight` |
| H1副标题 | 20px / 400 / #A09FA6 | 20px / 400 / #6B7280 | `text-xl font-normal text-[#6B7280]` |
| H2 Section标题 | 30px / 400 / -0.75px | 30px / 400 / -0.75px | `text-[30px] font-normal tracking-[-0.75px]` |
| 正文/链接 | 16px / 400 | 16px / 400 | `text-base font-normal` |
| 表头 | 16px / 350 / #8D8C8A | 16px / 300 / #9CA3AF | `text-base font-light text-[#9CA3AF]` |
| Token名 | 18px / 350 | 18px / 400 | `text-lg font-normal` |
| Ticker代码 | 15px / 400 / #B4B4B4 | 15px / 400 / #9CA3AF | `text-[15px] font-normal text-[#9CA3AF]` |
| 卡片涨跌幅 | 20px / 400 | 20px / 400 | `text-xl font-normal` |
| 卡片价格 | 15px / 400 | 15px / 400 | `text-[15px] font-normal` |
| 卡片ticker | 15px / 400 / #B4B4B4 | 15px / 400 / #9CA3AF | `text-[15px] text-[#9CA3AF]` |
| "View more"链接 | 16px / 400 / #AB9FF2 | 16px / 400 / #C5975B | `text-base text-[#C5975B]` |

---

*规范来源: phantom.com/explore 实测 computed styles (2026-02-16)*
*所有像素值直接从浏览器 getComputedStyle 提取*
