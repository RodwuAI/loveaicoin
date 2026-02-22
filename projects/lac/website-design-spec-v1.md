# LAC Website Landing Page Design Specification v1.0

**Project:** LAC (Love AI Coin) Official Website
**Role:** Chief Designer (tr-designer)
**Date:** 2026-02-21
**Version:** v1.0
**Status:** Draft

---

## 1. 核心设计理念 (Design Philosophy)

**"Clarity, Breath, Future"**
设计核心在于传达LAC作为Web3 AI学习平台的智性与清爽感。告别传统Crypto网站的暗黑/赛博朋克风，拥抱Phantom式的**极致白底、大留白、高清晰度**。

*   **克制 (Restraint):** 颜色只在关键处出现，其余留给内容。
*   **呼吸 (Breath):** 区块间距拉大，阅读无压迫感。
*   **秩序 (Order):** 严格的网格系统与对齐。

---

## 2. 色彩系统 (Color System)

| 用途 | 颜色名称 | Hex值 | 使用场景 |
| :--- | :--- | :--- | :--- |
| **主色 (Brand)** | **LAC Navy (藏蓝)** | `#1B2D6B` | 标题、主要文字、强调背景、Footer背景 |
| **主色 (Accent)** | **LAC Gold (金色)** | `#C5975B` | Primary CTA按钮、关键图标、高亮文字 |
| **辅助 (Sub)** | **Pale Gold (浅金)** | `#D4B88C` | 次要按钮边框、装饰性线条、Hover态 |
| **背景 (Bg)** | **Pure White** | `#FFFFFF` | 页面主背景、卡片背景 |
| **背景 (Alt)** | **Ice Grey (冰灰)** | `#F8F9FC` | 次要区块背景、输入框背景 |
| **文字 (Text)** | **Primary** | `#1B2D6B` | 标题 (H1-H3) |
| **文字 (Text)** | **Body** | `#4A5568` | 正文 (P)，降低纯黑的刺眼感 |
| **文字 (Text)** | **Muted** | `#A0AEC0` | 辅助说明、占位符 |

---

## 3. 字体排印 (Typography)

*   **英文字体:** `Inter` (Tight tracking for headings, Normal for body)
*   **中文字体:** `PingFang SC`
*   **字重:** Regular (400), Medium (500), SemiBold (600), Bold (700)

---

## 4. 页面整体布局 (Layout Structure)

采用**单列居中布局 (Container Width: 1200px)**，上下区块保持特定的呼吸节奏。

**区块顺序 & 垂直间距 (Vertical Rhythm):**

1.  **Header (Sticky)**: `80px` height
2.  **Hero Section**: `800px` min-height (视口高度 100vh 减去 Header)
3.  *(Gap: 120px)*
4.  **Core Features (Cards)**: 核心特性
5.  *(Gap: 160px)*
6.  **How It Works (Process)**: 运作流程
7.  *(Gap: 160px)*
8.  **AI Check-in Preview**: 签到板演示 (LAC特色)
9.  *(Gap: 120px)*
10. **Footer**: `400px` height

---

## 5. 详细区块设计规范 (Section Specs)

### 5.1 Header (Global Navigation)
*   **布局**: Flexbox, `justify-content: space-between`, `align-items: center`
*   **高度**: `80px`
*   **背景**: `rgba(255, 255, 255, 0.9)` + `backdrop-filter: blur(10px)`
*   **Logo**: 左侧。SVG矢量，高度 `32px`。
*   **Nav Links**: 中间。
    *   Font: `15px Medium`
    *   Color: `#4A5568` -> Hover: `#1B2D6B`
    *   Gap: `40px`
*   **Actions**: 右侧。
    *   **Language**: Icon (Globe), `20px`, Color `#A0AEC0` -> Hover `#1B2D6B`.
    *   **Connect Wallet**:
        *   Height: `40px`
        *   Padding: `0 20px`
        *   Radius: `20px` (Full Pill)
        *   Bg: `#1B2D6B` -> Hover: `#263B85`
        *   Text: `#FFFFFF`, `14px SemiBold`
*   **Mobile**: 汉堡菜单 (Icon 24px) 替代 Nav Links，右侧只留 Logo 和 Menu。

### 5.2 Hero Section (第一视口)
*   **背景**: 纯白 `#FFFFFF`。
    *   *装饰*: 右上角放置一个极淡的 `#D4B88C` 模糊光晕 (Blur: 120px, Opacity: 0.2)，打破沉闷。
*   **布局**: 左右两栏 (Desktop)，左文右图。
*   **左侧 (Copy)**:
    *   **H1**: `font-size: 64px` (Line-height: 1.1), `Color: #1B2D6B`, `Weight: 700`.
        *   内容: "Learn AI, <br>Earn <span style='color:#C5975B'>LAC</span>."
    *   **Subhead**: `font-size: 20px`, `Color: #4A5568`, `margin-top: 24px`, `max-width: 480px`.
    *   **CTA Group** (`margin-top: 48px`):
        *   **Primary Button**: "Start Learning"
            *   Bg: `#C5975B` (Solid)
            *   Text: `#FFFFFF`
            *   Height: `56px`, Padding: `0 32px`, Radius: `12px`
            *   Shadow: `0 4px 12px rgba(197, 151, 91, 0.3)`
            *   Hover: Transform Y -2px, Shadow blur increases.
        *   **Secondary Button**: "Read Whitepaper"
            *   Bg: Transparent
            *   Border: `1px solid #E2E8F0`
            *   Text: `#1B2D6B`
            *   Height: `56px`
            *   Hover: Border `#D4B88C`
*   **右侧 (Visual)**:
    *   **3D Illustration**: 一个抽象的、半透明的玻璃质感球体或芯片，内部有流动的金色光线，象征 "AI Knowledge"。
    *   *风格参考*: Spline 3D 的极简风格，不花哨，悬浮微动效 (Float animation)。

### 5.3 Core Features (卡片矩阵)
*   **布局**: 3列 Grid (`grid-template-columns: repeat(3, 1fr)`), Gap `32px`。
*   **卡片样式**:
    *   Bg: `#F8F9FC` (微灰，形成区块感) -> Hover: `#FFFFFF` + Shadow `0 20px 40px rgba(0,0,0,0.05)`.
    *   Padding: `48px 32px`
    *   Border-radius: `24px`
    *   Transition: `all 0.3s ease`
*   **内容**:
    *   **Icon**: 左上角。`48px` box，内部 Icon `24px`。
        *   Style: 双色调 (Duotone)，主色 `#1B2D6B`，辅色 `#D4B88C`。
    *   **Title**: `24px Bold`, `#1B2D6B`, `margin-top: 24px`.
    *   **Desc**: `16px Regular`, `#4A5568`, `line-height: 1.6`.

### 5.4 How It Works (运作流程)
*   **布局**: 纵向阶梯式 (Zig-zag) 或 横向时间轴 (Timeline)。推荐 **横向卡片链** (类似 Phantom 的 "Explore" section)。
*   **容器**: 灰色背景条 `#F8F9FC` 全屏宽贯穿，高度 `600px`，内容居中。
*   **Steps**: 3个步骤，水平排列，中间用虚线箭头连接。
    1.  **Connect**: 链接钱包
    2.  **Task**: 完成AI学习任务
    3.  **Reward**: 获得LAC代币
*   **连接线**: 虚线 `2px dashed #D4B88C`。
*   **序号**: 圆圈 `40px`，Bg `#FFFFFF`, Border `2px solid #1B2D6B`, Text `#1B2D6B Bold`.

### 5.5 AI Check-in Preview (签到板 - 特色区)
*   **设计意图**: 展示LAC最核心的 "每日AI交互" 功能。
*   **样式**: 模拟一个真实UI组件浮在页面上。
*   **容器**: 这是一个 "App Screenshot" 区域。
    *   背景: 大圆角矩形 (`Radius: 40px`)，颜色 `#1B2D6B` (深色底突显UI)。
    *   内部: 放置一张高保真的 "Daily Check-in" 界面图。
        *   界面图样式: 玻璃拟态 (Glassmorphism)，磨砂白底，金色按钮。
*   **文案**: 左侧文字，右侧图 (或反之)。
    *   Title: "Daily AI Interaction"
    *   Text: "Chat with AI daily. Verify your humanity. Earn rewards."

### 5.6 Footer
*   **背景**: `#1B2D6B` (深藏蓝)。
*   **文字**: 全白 `#FFFFFF` (Opacity 0.8).
*   **布局**:
    *   Top: Logo (White version) + Contract Address (Copyable pill).
        *   Address Pill: `bg: rgba(255,255,255,0.1)`, `font-family: monospace`.
    *   Middle: 4列 Links (Product, Learn, Community, Legal).
    *   Bottom: Social Icons (Twitter, Discord, Telegram) - SVG White, Hover Gold.
    *   Copyright: `12px`, Opacity 0.4.

---

## 6. 动效规范 (Motion)

使用 `Framer Motion` 或原生 CSS。

*   **Scroll Reveal**:
    *   所有区块进入视口时：`y: 20px` -> `y: 0`, `opacity: 0` -> `1`.
    *   Duration: `0.6s`, Ease: `easeOutCubic`.
*   **Hover**:
    *   Buttons: `scale(1.02)`.
    *   Cards: `y: -8px`.
*   **Loading**:
    *   简单的 LAC Logo 呼吸动画 (Scale 0.9 -> 1.1, Loop).

---

## 7. 响应式断点 (Responsive Breakpoints)

### Desktop (> 1280px)
*   Container: `1200px` centered.
*   Padding X: `0`.
*   Layout: Grid 3 cols, Flex Row.

### Tablet (768px - 1279px)
*   Container: `100%`.
*   Padding X: `40px`.
*   Layout:
    *   Hero: 依然左右，但图片缩小。
    *   Features: Grid 2 cols (最后一张居中或拉伸).
    *   Font size: H1 降为 `48px`.

### Mobile (< 768px)
*   Container: `100%`.
*   Padding X: `20px`.
*   Layout:
    *   **全流式布局 (Stack)**: 所有 Flex Row 变为 Column。
    *   Hero: 文字在上，图片在下 (或隐藏图片，只保留极简图形)。
    *   Features: Grid 1 col.
    *   Header: Logo + Hamburger Menu.
    *   Font size: H1 降为 `36px`.
    *   Buttons: `width: 100%` (全宽按钮便于点击).

---

## 8. 前端开发Checklist (For Devs)

*   [ ] 配置 Tailwind 主题色 (lac-navy, lac-gold, etc.)
*   [ ] 引入 Inter 和 PingFang 字体栈
*   [ ] 设置 Base Font Size: 16px
*   [ ] 导出所有 SVG 图标 (Logo, Icons)
*   [ ] 准备 Hero 区域的 3D/插图素材 (WebP/PNG)

---

**End of Spec**
