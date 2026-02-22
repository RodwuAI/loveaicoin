# 点时成金官网 — Phantom 像素级设计规范
## 开发必读，所有数值从 phantom.com 实测提取

> ⚠️ 吴总指令：全部按照 Phantom 做，但用我们的品牌色（藏蓝+金色），风格清新不重不乱
> 品牌色基于Logo：藏蓝 `#1B2D6B` + 金色 `#C5975B` + 浅金 `#D4B88C`

---

## 一、全局基础

### 1.1 页面背景
```
Phantom原值: #F5F2FF (淡紫灰)
我们的值:    #F5F0E8 (淡暖灰，偏金色调，呼应Logo金色)
备选:        #F8F6F1 (更浅的暖白)
```
**Tailwind**: `bg-[#F5F0E8]` 设在 `<html>` 上

### 1.2 字体
```
Phantom: 自定义 "Phantom" 字体
我们:    英文 Inter, 中文 "PingFang SC", "Noto Sans SC", sans-serif
```
**Tailwind config**:
```js
fontFamily: {
  sans: ['Inter', 'PingFang SC', 'Noto Sans SC', 'sans-serif'],
}
```

### 1.3 基础文字色
```
Phantom主文字色: rgb(60, 49, 91) = #3C3155 (深紫灰)
我们的主文字色:  #1B2D6B (藏蓝，与Logo一致)
次要文字色:      #6B7280 (中灰)
浅色文字:        #9CA3AF (用于描述/辅助信息)
```

### 1.4 页面宽度
```
Phantom: 全宽布局，内容区无固定max-width，靠padding控制
页面总宽: 1200px viewport下，内容撑满
```
**我们的做法**: `max-w-7xl mx-auto px-6 lg:px-8` (1280px max + 水平padding)

---

## 二、导航栏 (Header)

### 2.1 布局
```
位置: fixed（固定在顶部）
高度: 100px
背景: 透明 (transparent)
z-index: 50
```

### 2.2 结构
```
左: Logo
右: Download按钮 + 汉堡菜单(移动端)
```
Phantom导航极简——**没有中间导航链接**，只有Logo和一个按钮。

### 2.3 Download按钮（对应我们的CTA）
```
背景:    #E2DFFE → 我们用 #F0E6D6 (浅金底)
文字色:  #3C3155 → 我们用 #1B2D6B (藏蓝)
圆角:    32px (全圆角胶囊)
内边距:  16px 32px
字号:    16px
字重:    400 (regular, 不加粗!)
阴影:    无
边框:    无
```
**Tailwind**: `bg-[#F0E6D6] text-[#1B2D6B] rounded-full px-8 py-4 text-base font-normal hover:bg-[#E8D9C4] transition-colors`

---

## 三、Hero 区域

### 3.1 整体
```
顶部留白: 120px (给fixed导航留空间)
底部留白: 76px
文字居中: text-align center
```

### 3.2 副标题 (小字，Hero上方)
```
Phantom: "The crypto app that'll take you places"
字号:    20px
字重:    400
行高:    24px
字距:    -0.5px
颜色:    白色(因为Phantom hero有深色背景)
```
**我们的**: 
```
文案:    "让时间创造价值"
字号:    20px → text-xl
字重:    400 → font-normal  
行高:    24px → leading-6
颜色:    #6B7280 (中灰，因为我们是浅色背景)
字距:    -0.5px → tracking-tight
```
**Tailwind**: `text-xl font-normal leading-6 tracking-tight text-[#6B7280]`

### 3.3 主标题 (H1大字)
```
Phantom值:
  字号:    84.375px ≈ 84px
  字重:    400 (注意! Phantom不用bold!)
  行高:    92.8px ≈ 1.1em
  字距:    -2.1px (很紧的letter-spacing!)
  颜色:    #FFFDF8 (暖白，不是纯白)
```
**我们的**:
```
字号:    72px (中文比英文略小才协调)
字重:    700 (中文需要bold才有力度，这里和Phantom不同)
行高:    1.1 → leading-[1.1]
字距:    -1.8px → tracking-[-1.8px]
颜色:    #1B2D6B (藏蓝)
```
**Tailwind**: `text-[72px] font-bold leading-[1.1] tracking-[-1.8px] text-[#1B2D6B]`
**移动端**: `text-[40px] md:text-[56px] lg:text-[72px]`

### 3.4 Hero CTA按钮
```
Phantom:
  背景:    #FDFCFE (几乎纯白)
  文字色:  #3C3155
  圆角:    100px (全圆)
  内边距:  16px
  字号:    13.3px ≈ 14px
  高度:    48px
```
**我们的**:
```
背景:    渐变 from-[#C5975B] to-[#D4B88C] (金色渐变)
文字色:  #FFFFFF (白色)
圆角:    100px → rounded-full
内边距:  16px 32px
字号:    16px
高度:    auto
```
**Tailwind**: `bg-gradient-to-r from-[#C5975B] to-[#D4B88C] text-white rounded-full px-8 py-4 text-base font-medium hover:from-[#B8894E] hover:to-[#C9AC7F] transition-all shadow-sm`

---

## 四、功能板块 (Feature Sections) — 核心布局!

这是Phantom最有特色的部分：**左文右卡片滑动**

### 4.1 Section整体
```
每个section:
  padding-top:    48px
  padding-bottom: 96px
  总高度约:       1742px (含卡片滑动区)
```
**Tailwind**: `pt-12 pb-24`

### 4.2 左侧：标题区
```
Section标题 (H2):
  字号:    72px
  字重:    400 (Phantom不加粗!)
  行高:    79.2px = 1.1em
  字距:    -1.8px
  颜色:    #3C3155 → 我们用 #1B2D6B
```
**我们的H2**:
```
字号:    56px (中文适配)
字重:    700 (中文需要bold)
行高:    1.15
字距:    -1px
颜色:    #1B2D6B
```
**Tailwind**: `text-[56px] font-bold leading-[1.15] tracking-[-1px] text-[#1B2D6B]`
**移动端**: `text-[36px] md:text-[48px] lg:text-[56px]`

### 4.3 "See more" 链接按钮
```
背景:    #E2DFFE → 我们用 #F0E6D6 (浅金)
圆角:    32px
内边距:  12px 20px
字号:    16px
宽度:    ~150px
高度:    ~49px
```
**Tailwind**: `inline-flex items-center gap-2 bg-[#F0E6D6] text-[#1B2D6B] rounded-full px-5 py-3 text-base hover:bg-[#E8D9C4] transition-colors`

### 4.4 右侧：功能卡片
```
Phantom 功能卡片:
  宽度:    556px
  高度:    744px (接近手机屏幕比例)
  圆角:    24px
  内边距:  48px 48px 0 (上左右48，底部0，图片贴底)
  阴影:    0px 0px 4px rgba(226,223,254,1) → 我们用 0px 0px 4px rgba(197,151,91,0.15)
  
  卡片标题 (H3):
    字号:  20px
    字重:  400
    颜色:  #3C3155 → 我们用 #1B2D6B
  
  卡片正文:
    字号:  16px → Phantom的卡片内文字就是标题本身

  卡片背景色(交替使用):
    - 浅色: #AB9FF2 (淡紫) → 我们用 #F0E6D6 (浅金)
    - 深色: #1C1C1C (深黑) → 我们用 #1B2D6B (藏蓝)
    - 中性: #E9E8EA (浅灰) → 我们用 #F5F0E8 (暖灰)
    - 蓝色: #4A87F2 (蓝) → 我们用 #C5975B (金色)
    - 暖色: #FFFDF8 (暖白) → 我们用 #FFFFFF (纯白)
```
**Tailwind卡片基础**: 
```
rounded-3xl p-12 pb-0 w-[556px] h-[744px] shadow-[0_0_4px_rgba(197,151,91,0.15)]
```
**移动端**: `w-full h-[500px] md:w-[400px] md:h-[600px] lg:w-[556px] lg:h-[744px]`

### 4.5 卡片滑动导航
```
上一张/下一张 按钮
图标导航箭头
Slide指示: "Slide 1 of 5"
```
实现: 使用 `overflow-x-auto snap-x snap-mandatory` 或 Swiper.js

---

## 五、尾部CTA区域

### 5.1 社区信任文案
```
"Trusted by a community of 20+ million users."
字号:  20px
字重:  400
颜色:  #3C3155 → #6B7280
```

### 5.2 大字CTA
```
"Get started." / "Download Phantom."
字号:  72px → 我们用 56px
字重:  400 → 我们用 700
颜色:  #3C3155 → #1B2D6B
```

---

## 六、Footer

### 6.1 整体
```
背景:    透明（继承页面背景色）
padding: 32px 0
分隔:    无border-top（靠留白分隔）
```

### 6.2 结构
```
上部:
  左: Logo + 邮件订阅框
  右: 4列导航 (Product / Resources / Company / Socials)

下部:
  左: © 2026 版权
  右: Terms / Privacy 链接
```

### 6.3 邮件订阅框
```
输入框:  "Enter your email"
按钮:    "Sign up" 
底色:    继承页面背景
```

### 6.4 Footer导航
```
分类标题: 16px, #3C3155 → #1B2D6B, font-normal
链接文字: 16px, #3C3155 → #6B7280, font-normal
hover:   underline 或 color变深
4列布局: grid-cols-4
```

### 6.5 Status badge
```
"Operational" 状态标签
背景:    #F4F2F4 → #F0E6D6
圆角:    100px (全圆)
padding: 8px 12px
```

---

## 七、响应式断点

```
移动端:  < 768px   → 单列，卡片全宽，标题缩小
平板:    768-1024px → 双列部分，卡片缩小
桌面:    > 1024px  → 完整布局
```

### 关键响应式变化
| 元素 | 移动端 | 平板 | 桌面 |
|------|--------|------|------|
| H1字号 | 40px | 56px | 72px |
| H2字号 | 36px | 48px | 56px |
| 功能卡片 | 全宽×500px | 400×600px | 556×744px |
| 卡片内边距 | 24px | 36px | 48px |
| Section padding | 32px 0 | 40px 0 | 48px 96px |
| 导航栏高度 | 72px | 80px | 100px |

---

## 八、交互与动效

### 8.1 按钮hover
```css
/* CTA按钮hover - 微亮 */
transition: all 0.2s ease;
hover: 背景色加深5%

/* "See more"按钮hover */
transition: background-color 0.2s ease;
hover: 背景色加深
```

### 8.2 卡片滑动
```
水平滚动，snap到每张卡片
滚动方式: CSS scroll-snap 或 Swiper
scroll-snap-type: x mandatory
每张卡片: scroll-snap-align: start
gap: 16px
```

### 8.3 页面滚动
```
smooth scroll
各section之间自然过渡，无需花哨滚动动画
保持Phantom的克制风格 — 不加视差、不加淡入淡出
```

---

## 九、各页面改版对照表

### 9.1 首页 (/)
| 区域 | 当前问题 | Phantom式改法 |
|------|----------|---------------|
| Hero | 渐变太重 | 纯色浅背景 + 藏蓝大标题 + 金色CTA按钮 |
| 业务板块 | 卡片太密 | 改为横向滑动卡片（每个业务一张556×744大卡片） |
| 合作伙伴 | 没有 | 新增底部信任区（合作伙伴Logo墙） |
| CTA区 | 弱 | 大字CTA"开始探索时间的价值" + 金色按钮 |

### 9.2 心愿集结 (/wish)
| 区域 | Phantom式改法 |
|------|---------------|
| Hero | 小副标题 + 大标题"让心愿成真" |
| 心愿列表 | 横向滚动大卡片，每张展示一个心愿 |
| 进度 | 卡片内嵌进度条 |

### 9.3 关于我们 (/about)
| 区域 | Phantom式改法 |
|------|---------------|
| 使命 | 居中大标题 + 2行描述 |
| 时间线 | 改为横向滑动卡片（每个里程碑一张卡片） |
| 团队 | 网格卡片，头像+姓名+职位 |

### 9.4 点时资产 (/assets)
| 区域 | Phantom式改法 |
|------|---------------|
| 介绍 | 左文右图/卡片滑动 |
| 双平台 | 两张大卡片并排（藏蓝底+金色底） |
| 技术 | 图标+短文字，网格排列 |

### 9.5 点时智能 (/intelligence)
| 区域 | Phantom式改法 |
|------|---------------|
| AI分身 | 左标题右滑动卡片展示功能 |
| 技术栈 | 小图标+文字的网格 |

### 9.6 点时互娱 (/entertainment)
| 区域 | Phantom式改法 |
|------|---------------|
| 场景 | 每个场景一组（左标题右卡片），编号用大字+颜色区分 |
| 图片区 | 卡片内放手机mockup或场景图 |

### 9.7 点时公益 (/philanthropy)
| 区域 | Phantom式改法 |
|------|---------------|
| 核心机制 | 三张大卡片横向排列 |
| 社会价值 | 数据指标大字展示（类似Solana风格） |

---

## 十、色彩速查表（复制即用）

### Tailwind自定义色
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'tr-navy': '#1B2D6B',      // 藏蓝 - 标题/主文字
        'tr-gold': '#C5975B',      // 金色 - CTA/强调
        'tr-gold-light': '#D4B88C', // 浅金 - 渐变终点
        'tr-gold-bg': '#F0E6D6',   // 极浅金 - 按钮底/卡片底
        'tr-bg': '#F5F0E8',        // 页面底色(暖灰)
        'tr-text': '#1B2D6B',      // 主文字(=藏蓝)
        'tr-muted': '#6B7280',     // 次要文字
        'tr-light': '#9CA3AF',     // 辅助文字
        'tr-card': '#FFFFFF',      // 卡片白
        'tr-card-alt': '#F8F6F1',  // 卡片备选底色
      },
      borderRadius: {
        'card': '24px',            // 功能大卡片
        'btn': '32px',             // 按钮
        'pill': '100px',           // 胶囊
      },
      boxShadow: {
        'card': '0 0 4px rgba(197,151,91,0.15)',  // 卡片阴影
        'card-hover': '0 0 12px rgba(197,151,91,0.25)', // 卡片hover
      }
    }
  }
}
```

### 常用class速查
```
页面背景:     bg-tr-bg
藏蓝标题:     text-tr-navy
金色CTA:      bg-gradient-to-r from-tr-gold to-tr-gold-light text-white rounded-btn
浅金按钮:     bg-tr-gold-bg text-tr-navy rounded-btn
白色卡片:     bg-tr-card rounded-card shadow-card
藏蓝底卡片:   bg-tr-navy text-white rounded-card shadow-card
金底卡片:     bg-tr-gold-bg text-tr-navy rounded-card shadow-card
H1:           text-[72px] font-bold leading-[1.1] tracking-[-1.8px] text-tr-navy
H2:           text-[56px] font-bold leading-[1.15] tracking-[-1px] text-tr-navy
H3:           text-xl font-normal text-tr-navy
正文:         text-base text-tr-muted leading-relaxed
辅助:         text-sm text-tr-light
```

---

*规范来源: phantom.com 实测 computed styles (2026-02-16)*
*品牌色来源: 点时成金Logo*
*风格指令: 吴总 — "清新，不要颜色很重很乱"*
