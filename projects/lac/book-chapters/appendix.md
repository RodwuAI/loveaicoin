## 附录A：Main Agent提示词（Prompt）模板

以下是我们在实战中积累的Main Agent核心Prompt，你可以直接复制修改使用：

```markdown
## 附录B：WBS工作分解模板

### 通用模板

```
项目名称：_______________
项目周期：Day 1 - Day ___
负责人：_______________

Level 1: 项目
├── Level 2: 模块A
│   ├── Level 3: 功能A1
│   │   ├── 任务A1.1 [负责Agent] [Day X-Y] [前置依赖]
│   │   └── 任务A1.2 [负责Agent] [Day X-Y] [前置依赖]
│   └── Level 3: 功能A2
├── Level 2: 模块B
└── Level 2: 模块C
```

### LAC项目实际WBS（节选）

```
项目：LAC平台10天冲刺
周期：Day 1 - Day 10

├── 品牌体系（Day 1-2）
│   ├── 品牌定位V5 [小嘀嗒] [Day 1] [-]
│   ├── 品牌VI规范 [设计师] [Day 1-2] [定位V5]
│   ├── Logo设计 [设计师] [Day 2] [VI规范]
│   └── 品牌叙事 [墨笔] [Day 2] [定位V5]
├── 核心文档（Day 1-3）
│   ├── 白皮书 [经济师] [Day 1-2] [定位V5]
│   ├── Tokenomics [经济师] [Day 1-2] [定位V5]
│   ├── 竞品分析 [链鹰] [Day 1] [-]
│   ├── 安全方案 [小黑] [Day 2-3] [合约方案]
│   ├── Solana合约方案 [链鹰] [Day 2] [Tokenomics]
│   └── 收入模型 [财奴] [Day 2-3] [Tokenomics]
├── 官网开发（Day 3-8）
│   ├── 页面结构设计 [小嘀嗒] [Day 3] [VI规范]
│   ├── 前端开发 [小小技] [Day 3-7] [页面结构]
│   ├── 代码审查 [小技] [Day 5,7] [前端开发]
│   └── 内容填充 [墨笔] [Day 5-8] [前端开发]
├── 测试上线（Day 9-10）
│   ├── 功能测试 [小技] [Day 9] [所有开发]
│   ├── 安全审计 [小黑] [Day 9] [所有开发]
│   └── 部署上线 [小技] [Day 10] [测试通过]
└── 宣传推广（Day 5-10）
    ├── 书籍编写 [全员] [Day 5-10] [品牌体系]
    └── 社交媒体 [墨笔] [Day 8-10] [官网上线]
```

## 附录C：蜂群模型选型指南

| 场景 | 推荐模型 | 核心优势 | 适合任务 |
|------|----------|----------|----------|
| 战略规划/复杂推理 | Claude Opus | 最强深度思考，逻辑严密 | 方案制定、验收审核、决策分析 |
| 代码生成/调试 | Sonnet / Kimi Coding | 编程性价比最高 | 写代码、Debug、代码审查 |
| 内容创作/文案 | Kimi K2.5 / DeepSeek V3 | 中文能力强，成本低 | 品牌文案、报告撰写、翻译 |
| 数据分析/推理 | DeepSeek R1 | 推理链清晰，可解释性强 | 安全审计、逻辑验证、风险分析 |
| 多模态/图片 | Gemini 3 Pro | 快且可用，支持图片生成和理解 | 视觉设计辅助、图片分析、多模态任务 |
| 预算紧张 | DeepSeek V3 | 全能且低价 | 通用任务、初稿生成 |

**选型原则：**
1. 先确定任务类型，再选模型
2. 初稿用便宜模型，终稿用贵模型
3. 每个Agent固定一个主模型，避免频繁切换
4. 核心Agent必须有不同供应商的备用模型

## 附录D：一人公司常用软件清单

| 类别 | 软件 | 用途 | 费用 |
|------|------|------|------|
| **通讯** | Telegram | 人机沟通、群协作、指令传达 | 免费 |
| **Agent管理** | OpenClaw | AI Agent部署和管理平台 | 开源 |
| **代码托管** | GitHub | 代码版本管理、协作开发 | 免费/Pro |
| **网站部署** | Vercel / Netlify | 前端自动部署 | 免费tier |
| **文档生成** | Chrome Headless | HTML转PDF（中文友好） | 免费 |
| **语音转录** | Whisper (本地) | 语音转文字 | 免费 |
| **项目管理** | Markdown + Git | WBS、甘特图、任务跟踪 | 免费 |
| **设计工具** | AI图片生成 | Logo、VI、UI设计 | API费用 |
| **邮件** | Gmail / Google Workspace | 商务沟通 | 免费/付费 |
| **日历** | Google Calendar | 日程管理、提醒 | 免费 |
| **笔记** | Apple Notes / Notion | 知识库、备忘 | 免费/付费 |

## 附录E：参考文献

1. **PMI.** *PMBOK指南（第七版）.* Project Management Institute, 2021.
2. **Meadows, Donella H.** *系统之美：决策者的系统思考.* 浙江人民出版社, 2012.
3. **Senge, Peter M.** *第五项修炼：学习型组织的艺术与实践.* 中信出版社, 2009.
4. **Gawande, Atul.** *清单革命.* 浙江人民出版社, 2012.
5. **Brooks, Frederick P.** *人月神话.* 清华大学出版社, 2015.
6. **Fowler, Martin.** *重构：改善既有代码的设计.* 人民邮电出版社, 2019.
7. **DAIR.AI.** *Prompt Engineering Guide.* https://www.promptingguide.ai/, 2023-2026.
8. **Anthropic.** *Claude Documentation.* https://docs.anthropic.com/, 2024-2026.
9. **Google DeepMind.** *Gemini Technical Report.* 2024.
10. **Ishikawa, Kaoru.** *鱼骨图与因果分析法.* 质量管理经典文献, 1968.

---

## 版权页

**《1+10：AI时代的一人公司实战》**

作    者 ◎ 小嘀嗒 · 蜂群内置智能蜂群
策    划 ◎ [待定]

初版 ◎ 2026年3月
定价 ◎ 电子版 SGD 9.90 / 纸质版待定

版权所有·翻印必究

Copyright © 2026
All rights reserved. No part of this publication may be reproduced or transmitted in any form or by any means, electronic or mechanical, including photocopying, recording, or any information storage or retrieval system, without the prior permission of the copyright owner.

---

*本书基于真实创业实战经验写成。所有案例均来自"1+10"模式的真实运营记录。*
