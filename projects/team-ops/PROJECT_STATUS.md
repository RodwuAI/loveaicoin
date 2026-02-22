# 团队管理与配置状态
> 最后更新：2026-02-21

## 蜂群阵容（10个Agent）

| # | emoji | 名字 | agentId | 模型 | 角色 | Telegram Bot |
|---|-------|------|---------|------|------|-------------|
| 1 | 💫 | 小嘀嗒 | main | Claude Opus 4 | 蜂王/PM | @Rodwubot |
| 2 | 🦅 | 链鹰 | web3-analyst | Gemini 3 Pro | Web3分析 | @Web3Hawk_bot |
| 3 | ✍️ | 墨笔 | content-writer | Kimi K2.5 | 内容创作 | @MOMOMoBi_bot |
| 4 | 🧮 | 小算盘 | tr-finance | DeepSeek V3 | 财务合规 | @RodSuanpan_bot |
| 5 | 📊 | 经济师 | tr-economist | Claude Opus 4 | 经济模型 | @Rod_economist_bot |
| 6 | 🎨 | 设计师 | tr-designer | Gemini 3 Pro | UI/VI | @Rodsheji_bot |
| 7 | 💻 | 小技 | tr-coder | Sonnet 4 | 架构审查 | @Rod_coder_bot |
| 8 | 🔨 | 小小技 | tr-coder-junior | Kimi Coding | 开发写码 | @Rod_xiaoxiaoji_Bot |
| 9 | 🔒 | 小黑 | tr-security | DeepSeek R1 | 安全 | @xiaohei |
| 10 | 💰 | 财奴 | tr-revenue | Gemini 3 Pro | 商业增长 | @Rodcainu_bot |

## 关键配置规则

### 🔴 红线
- **配置文件禁令**：未经CEO直接命令，任何蜂工不能修改 `openclaw.json`
- **修改前必须备份**到 `/Users/fiveowu/Desktop/配置文件备份/`
- **语音转录**：仅限本地Whisper，禁止云端API

### 模型限制
- **Kimi Coding（小小技）不能用于subagent** — 只支持CLI Agent
- **Gemini 3 Pro 有时503**（服务器过载，非配额问题）→ 用Opus做fallback
- **墨笔(Kimi K2.5)可以spawn为subagent**（走moonshot API）

### 新蜂工入职标准流程
1. agents.list添加配置 + main.subagents.allowAgents添加权限
2. 创建workspace + agentDir + AGENTS.md + IDENTITY.md
3. 配置Telegram Bot（BotFather + requireMention:false）
4. 备份配置文件
5. 更新MEMORY.md蜂群阵容表 + daily log
6. 重启后验证

### 开发流程
- 小小技写代码 → 小技审查调试 → 交付

### 蜂群培养方案v4.5已执行
- CEO审批通过，职责已分发到所有蜂工ROLE.md

## 通信架构
- 群聊：Telegram群（所有蜂工+CEO）
- 私聊：各蜂工独立Telegram bot
- 跨agent：session_send（但有限制）
- 蜂王调度：sessions_spawn分派任务

## 工具备忘
- **Google Workspace**：wuhaofive@gmail.com，file模式keyring
- **GitHub**：已配置
- **Notion**：已配置
- **PDF生成**：Chrome Headless + PingFang SC字体

---
*蜂王：小嘀嗒 💫*
