# 官网第二阶段审计 — 蜂王摸底结果

## 一、死链 & 占位链接（href="#"）— 共5处

| 文件 | 行号 | 元素 | 问题 |
|------|------|------|------|
| page.tsx | 146 | Hero区CTA按钮1 | href="#" 无跳转 |
| page.tsx | 156 | Hero区CTA按钮2 | href="#" 无跳转 |
| Footer.tsx | 97 | "隐私政策" | href="#" 无页面 |
| Footer.tsx | 98 | "服务条款" | href="#" 无页面 |
| Header.tsx | 154 | "下载 App"按钮 | href="#" 无跳转 |

## 二、CTA跳转到不存在的子路由 — 共3处

| 页面 | CTA文字 | 跳转目标 | 问题 |
|------|---------|---------|------|
| /assets | "开始交易" | /assets/market | 路由不存在，404 |
| /intelligence | "体验Demo" | /intelligence/demo | 路由不存在，404 |
| /philanthropy | "立即捐赠" | /philanthropy/donate | 路由不存在，404（且philanthropy已废弃） |
| /entertainment | "加入" | /entertainment/join | 路由不存在，404（且entertainment已废弃） |

## 三、按钮无onClick/无功能 — 待详细统计

多个页面的button元素没有onClick事件或表单提交逻辑：
- /ai-chat: 发送按钮、开始对话按钮
- /avatars: 查看详情、开始对话、浏览更多
- /market: 交易按钮、查看详情
- /shop: 购买按钮
- /events: 了解更多、查看全部
- /explore: 搜索按钮
- /prediction: 参与预测
- /guide: 开始探索
- /faq: 联系客服
- /wish: 许下心愿
- /press: 下载资源
- /contact: 表单提交（无后端）

## 四、废弃路由仍存在

| 路由 | 状态 | 说明 |
|------|------|------|
| /entertainment | 废弃 | 应重定向到 /wish |
| /philanthropy | 废弃 | 应重定向到 /explore |

## 五、缺失页面

| 页面 | 需求 | 类型 |
|------|------|------|
| /privacy | 隐私政策 | 静态内容页 |
| /terms | 服务条款 | 静态内容页 |
| /download | App下载页 | 落地页 |
