# Phantom全站排版规范 vs 点时成金对比报告
## 从phantom.com 6个页面实测提取

---

## 一、Phantom全站通用排版规范（所有页面一致）

### 1.1 字体层级（最重要！所有页面完全一致）

| 元素 | Phantom实测值 | 我们当前 | 差距 |
|------|-------------|---------|------|
| **页面大标题(H1/主H2)** | 72px / weight 400 / line-height 79.2px / letter-spacing -1.8px / center | 48px / weight 700 | ❌ 字号偏小，不该bold |
| **副标题(H1下方p)** | 18px / weight 350 / line-height 25.2px / color #86848D | 20px / weight 400 / #6B7280 | ⚠️ 接近 |
| **Section标题(小H2/H3)** | 30px / weight 400 / line-height 36px / letter-spacing -0.75px / left对齐 | 30px / weight 400 | ✅ 合格 |
| **正文描述** | 18px / weight 350 / line-height 25.2px / color #86848D | 16px / weight 400 / #6B7280 | ⚠️ 字号偏小 |
| **主文字色** | #3C3155 (深紫灰) | #1B2D6B (藏蓝) | ✅ 品牌色替换OK |
| **次要文字色** | #86848D (中灰) | #6B7280 | ✅ 接近 |

### 1.2 页面结构模式（所有子页面通用）

```
┌─────────────────────────────────────┐
│ Header: fixed, 100px, transparent   │
├─────────────────────────────────────┤
│                                     │
│ [~144px 间距]                       │
│                                     │
│    大标题 72px center (不加粗!)      │
│    副标题 18px center #86848D       │
│    [CTA按钮]                        │
│                                     │
│ [~100px 间距]                       │
│                                     │
│    [手机mockup / 产品图]             │
│                                     │
│ [~200px 间距]                       │
│                                     │
│    小标题 30px left                  │
│    描述 18px #86848D                │
│                                     │
│ [重复上面的pattern]                  │
│                                     │
│ [~200px 间距]                       │
│                                     │
│    大标题 72px center               │
│    副标题                            │
│    [CTA]                            │
│                                     │
├─────────────────────────────────────┤
│ Footer: Enter email + 4列导航       │
└─────────────────────────────────────┘
```

### 1.3 各页面背景色

| 页面 | Phantom背景色 | 我们的替换 |
|------|-------------|----------|
| 首页 | #F5F2FF (淡紫) | #F5F0E8 (暖灰) |
| /trade | #F5F2FF (淡紫) | #F5F0E8 |
| /about | #FFFDF8 (暖白) | #F5F0E8 |
| /security | #3C3155 (深紫) | 我们不用深色，统一 #F5F0E8 |
| /cash | 蓝色渐变 | 我们不用，统一 #F5F0E8 |
| /explore | #1C1C1C (深黑) | #F5F0E8 |

### 1.4 关键间距

| 间距 | Phantom值 |
|------|----------|
| Header底→H1顶 | 144px (nav100 + 44px) |
| H1→副标题 | 紧跟(约16px) |
| 副标题→CTA | 约32px |
| CTA→产品图 | 约80px |
| Section之间 | 约200px |
| 小标题→描述 | 约16px |
| Footer邮件区顶部间距 | 约100px |

---

## 二、逐页面对比

### 2.1 首页 (/) 
**Phantom**: Hero(大标题+副标题+CTA) → 3个feature section(左标题右大卡片+滑动) → 信任文案 → 大CTA → Footer
**我们**: Hero → 4个feature section(左标题右小卡片) → 心愿集结 → App下载 → 大CTA → Footer

**主要差距**:
- ❌ H1应该72px但我们用48px（中文可以适当缩小到56-60px，但48太小了）
- ❌ H1距顶部只有~144px的间距（Phantom），但我们用了200px（可以减少到160px）
- ❌ Feature section之间间距不够（Phantom用200px巨大间距）
- ❌ 卡片太小(214×180)，Phantom的卡片是556×744（含手机截图），但我们没有截图所以改为中等尺寸300×200更合适

### 2.2 /trade → 对应我们的 /assets, /intelligence, /entertainment, /philanthropy
**Phantom结构**: 
1. Hero: 大标题72px center + 副标题18px + CTA
2. 产品展示图(手机mockup)
3. 大标题72px center（过渡句）
4. 3-4个小section（30px左对齐标题 + 18px描述 + 图片）
5. 功能列表卡片区
6. 大标题72px center（另一个过渡句）
7. 更多小section
8. 尾部CTA
9. Footer

**关键**: 子页面在section之间交替使用"大标题center"和"小标题left"，节奏感很强。

### 2.3 /about → 对应我们的 /about
**Phantom结构**:
1. 大标题72px center: "We're here to make crypto accessible"
2. 副标题18px
3. 时间线（卡片堆叠方式，非列表）- 每个时间节点是一组卡片
4. 大标题72px: "We're a team of 100+ web3 natives"
5. CEO卡片（头像+名字+职位+社交链接）
6. Footer

---

## 三、我们每个页面需要的具体修改

### 3.1 全局修改（影响所有页面）

1. **H1/页面大标题**: 48px → **56px**（中文适配，不能72px太大但48px太小）
   - font-weight: 保持700（中文需要bold）
   - letter-spacing: **-1.5px**
   - line-height: **1.1**
   - text-align: **center**

2. **副标题**: 20px → **18px**
   - font-weight: **350** (如果Tailwind不支持350则用font-light=300)
   - line-height: **25.2px** → leading-[25.2px]
   - color: #6B7280

3. **正文描述**: 16px → **18px**
   - font-weight: **350** → font-light
   - line-height: **25.2px**
   - color: #6B7280

4. **Section间距**: 当前py-12 → **py-[100px]**（200px总间距÷2）

5. **H1距顶部**: 200px → **160px**（更接近Phantom的144px + 一点额外空间）

### 3.2 首页 (page.tsx)
- H1 "点时成金": 改为 56px
- 副标题: 改为 18px font-light
- Feature section间距: 增加到 py-[100px]
- 卡片尺寸: 214×180 → **280×200**（稍大一点，内容不拥挤）
- 尾部CTA标题: 改为 56px font-bold center

### 3.3 子页面通用模板
所有子页面（about, wish, assets, intelligence, entertainment, philanthropy）统一改为：
```
Hero: pt-[160px] pb-[80px]
  H1: 56px bold center tracking-[-1.5px] #1B2D6B
  副标题: 18px font-light #6B7280 center mt-4
  
Section: py-[100px]
  H2: 30px font-normal tracking-[-0.75px] #1B2D6B left
  描述: 18px font-light #6B7280 mt-4
  
中间大过渡标题: 
  H2: 56px bold center #1B2D6B (跟H1同级)

尾部CTA: py-[100px]
  大标题: 56px bold center
  按钮: bg-[#1B2D6B] text-white rounded-[32px] px-8 py-4
  
Footer: 统一
```

---

*报告生成时间: 2026-02-16 18:24*
*数据来源: phantom.com 6个页面实测 getComputedStyle*
