# LAC (Love AI Coin) Logo Design Specification v1.0

## 1. 核心概念：种子·生长 (Seed · Growth)

*   **设计理念**：Love AI Coin (LAC) 是AI向人类世界释放善意的起点。Logo以"发芽的种子"为核心意象，寓意"从微小开始，向无限生长"。
*   **视觉元素**：
    *   **种子 (The Seed)**：稳固的椭圆基底，象征LAC作为基础设施的可靠性与善意的起源。
    *   **芽 (The Sprout)**：向上生长的流畅曲线，象征生命力、希望与AI的进化。
    *   **信号波纹 (The Signal)**：芽尖扩散出的三道弧形波纹，象征"AI的声音"正在传播，连接世界，传递爱与价值。

---

## 2. 几何构建与标准制图 (Geometry & Construction)

### 2.1 构图网格 (Grid System)
设计基于 `100x100` 单位网格构建，确保在任何尺寸下视觉平衡。

*   **种子主体**：位于底部中心，宽约40%，高约35%。采用黄金比例椭圆。
*   **生长曲线**：从种子顶部偏右位置自然延伸向上，呈"S"型柔和曲线。
*   **信号波纹**：位于右上角，以芽尖为圆心，向外扩散的三个同心圆弧，间距相等。

### 2.2 关键参数
*   **线条粗细**：统一笔触宽度（Stroke Width）为 `6px`（在100x100画板中），确保极简且有力。
*   **圆角处理**：所有端点采用圆角（Round Cap）和圆角连接（Round Join），传递"温暖、亲和"的视觉感受，避免尖锐感。

---

## 3. 品牌色彩 (Color Palette)

色彩系统旨在传达"科技、自然、温暖"。

*   **主渐变 (Primary Gradient)**：
    *   **起点**：晨光蓝 `#3B6FED` (Morning Blue) - 代表科技、理智与开端。
    *   **终点**：薄荷绿 `#34C88A` (Mint Green) - 代表生长、生命与希望。
    *   **方向**：从左下到右上（45度角），模拟阳光照耀下的生长方向。

*   **辅助色 (Secondary Colors)**：
    *   **暖阳橙** `#F5A623` (Warm Orange) - 用于强调点缀或特定活动场景，代表活力。
    *   **深空蓝** `#1A3A8F` (Deep Space Blue) - 用于深色背景下的文字或图标变体。

*   **单色应用**：
    *   **黑色**：`#1A1A1A` (正文/墨稿)
    *   **白色**：`#FFFFFF` (反白稿)

---

## 4. 矢量资源代码 (SVG Assets)

以下SVG代码可直接复制保存为 `.svg` 文件使用。

### 4.1 主图标 (Icon Only / Favicon)
*用途：网站Favicon、App图标、社交媒体头像。*

```svg
<svg width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 定义渐变 -->
  <defs>
    <linearGradient id="lacGradient" x1="10" y1="90" x2="90" y2="10" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3B6FED" />
      <stop offset="100%" stop-color="#34C88A" />
    </linearGradient>
  </defs>

  <!-- 种子基底：稳固的椭圆，微微倾斜 -->
  <path d="M35 75 C 35 85, 65 85, 65 75 C 65 60, 35 60, 35 75 Z" 
        fill="url(#lacGradient)" />

  <!-- 芽：向上生长的曲线 -->
  <path d="M50 62 Q 50 40, 70 30" 
        stroke="url(#lacGradient)" stroke-width="8" stroke-linecap="round" fill="none" />
  
  <!-- 叶片：左侧伸出的一片小叶子 -->
  <path d="M50 50 Q 30 50, 25 35 Q 40 40, 50 50" 
        fill="url(#lacGradient)" />

  <!-- 信号波纹：代表AI声音 -->
  <path d="M78 28 A 10 10 0 0 1 85 35" stroke="#F5A623" stroke-width="4" stroke-linecap="round" />
  <path d="M82 22 A 18 18 0 0 1 93 33" stroke="#F5A623" stroke-width="4" stroke-linecap="round" opacity="0.7" />
</svg>
```

### 4.2 标准组合 (Logo + Wordmark Horizontal)
*用途：网站Header、文档页眉、品牌展示。*

```svg
<svg width="400" height="100" viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 图标部分 (左侧) -->
  <defs>
    <linearGradient id="lacGradientH" x1="10" y1="90" x2="90" y2="10" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3B6FED" />
      <stop offset="100%" stop-color="#34C88A" />
    </linearGradient>
  </defs>
  
  <g transform="translate(10, 0)">
    <!-- 种子 -->
    <path d="M35 75 C 35 85, 65 85, 65 75 C 65 60, 35 60, 35 75 Z" fill="url(#lacGradientH)" />
    <!-- 芽 -->
    <path d="M50 62 Q 50 40, 70 30" stroke="url(#lacGradientH)" stroke-width="8" stroke-linecap="round" fill="none" />
    <!-- 叶 -->
    <path d="M50 50 Q 30 50, 25 35 Q 40 40, 50 50" fill="url(#lacGradientH)" />
    <!-- 波纹 -->
    <path d="M78 28 A 10 10 0 0 1 85 35" stroke="#F5A623" stroke-width="4" stroke-linecap="round" />
    <path d="M82 22 A 18 18 0 0 1 93 33" stroke="#F5A623" stroke-width="4" stroke-linecap="round" opacity="0.7" />
  </g>

  <!-- 文字部分 (右侧) -->
  <text x="120" y="70" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="bold" font-size="50" fill="#1A3A8F" letter-spacing="2">LAC</text>
  <text x="240" y="70" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="300" font-size="50" fill="#3B6FED">COIN</text>
  
  <!-- Slogan (可选) -->
  <text x="122" y="90" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="14" fill="#666666" letter-spacing="1">LOVE AI COIN</text>
</svg>
```

### 4.3 单色反白版 (White Monochrome)
*用途：深色背景、图片水印。*

```svg
<svg width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 纯白填充与描边 -->
  <path d="M35 75 C 35 85, 65 85, 65 75 C 65 60, 35 60, 35 75 Z" fill="#FFFFFF" />
  <path d="M50 62 Q 50 40, 70 30" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" fill="none" />
  <path d="M50 50 Q 30 50, 25 35 Q 40 40, 50 50" fill="#FFFFFF" />
  <path d="M78 28 A 10 10 0 0 1 85 35" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
  <path d="M82 22 A 18 18 0 0 1 93 33" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.7" />
</svg>
```

---

## 5. 社交媒体头像应用 (Social Media Profile)

建议在圆形裁切中使用留白更大的版本。

*   **背景色**：白色 `#FFFFFF` 或 极淡的晨光蓝 `#F0F5FF`
*   **主体**：居中放置 Icon Only 版本，尺寸缩放至 60%-70%。
*   **裁切示意**：

```svg
<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 圆形背景 -->
  <circle cx="100" cy="100" r="100" fill="#F0F5FF" />
  
  <!-- 居中图标 (引用Icon代码，放大并居中) -->
  <g transform="translate(50, 50)">
      <!-- 内部路径同Icon Only，省略 -->
      <path d="M35 75 C 35 85, 65 85, 65 75 C 65 60, 35 60, 35 75 Z" fill="#3B6FED" />
      <path d="M50 62 Q 50 40, 70 30" stroke="#3B6FED" stroke-width="8" stroke-linecap="round" fill="none" />
      <path d="M50 50 Q 30 50, 25 35 Q 40 40, 50 50" fill="#34C88A" />
      <path d="M78 28 A 10 10 0 0 1 85 35" stroke="#F5A623" stroke-width="4" stroke-linecap="round" />
      <path d="M82 22 A 18 18 0 0 1 93 33" stroke="#F5A623" stroke-width="4" stroke-linecap="round" opacity="0.7" />
  </g>
</svg>
```

---

## 6. 使用规范 (Usage Guidelines)

1.  **最小尺寸**：
    *   数字屏幕：`16px x 16px` (favicon)
    *   印刷品：`10mm` 宽
2.  **安全区域 (Clear Space)**：
    *   Logo周围需保留至少相当于"Logo高度 20%"的空白区域，不应放置其他图形或文字。
3.  **禁止事项**：
    *   ❌ 不要随意改变渐变的角度。
    *   ❌ 不要在复杂背景图上使用彩色Logo（请使用单色反白版）。
    *   ❌ 不要拉伸或压扁Logo比例。
