# Skill 下载安装标准流程

## 三步骤

### 第一步：找
- 去 https://clawhub.com 浏览可用技能
- 或 GitHub https://github.com/openclaw/skills
- 确认skill功能符合需求

### 第二步：审
- 小技（代码审查专家）负责审查安全性
- 检查 SKILL.md：要求什么权限、执行什么命令
- 检查 scripts/：有无可疑的外传数据、读取密钥、删除文件等行为
- 红线：读取配置文件、发送数据到未知服务器、要求过高权限 → 直接拒绝
- 优先官方 github.com/openclaw/skills，第三方先审后装

### 第三步：装
- 将skill文件夹放入 `/Users/fiveowu/.openclaw/workspace/skills/`
- 每个skill必须包含 `SKILL.md` 文件
- 运行 `openclaw skills list` 验证生效
- 无需重启，OpenClaw自动扫描

## 注意事项
- 有些skill依赖外部工具（ffmpeg、yt-dlp等），需额外安装
- **绝对不动 openclaw.json 配置文件**
- 安装完记录到 memory 日志

---
*制定日期：2026-02-19*
*制定人：吴总 / 执行人：小嘀嗒（蜂王）*
