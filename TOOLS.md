# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## ⚠️ Lessons Learned（仅环境/工具相关的坑，方法论教训归MEMORY.md）

### GitHub API 文件上传 - 中文编码
**错误做法:** 直接在 shell 命令中放置中文字符串进行 base64 编码
**问题原因:** shell 环境对中文字符处理不当，编码前就变成乱码
**正确做法:** 
1. 先将中文内容写入临时文件
2. 用 `base64` 命令编码文件内容
3. 将编码后的内容传给 GitHub API

**示例:**
```bash
# ❌ 错误
-c '{"content":"中文内容..."}'

# ✅ 正确
echo "中文内容..." > /tmp/file.md
base64 -i /tmp/file.md | tr -d '\n'
```

---

### Kimi 模型配置说明（2026-02-17 核实）
**实际配置**：
- `kimi-coding/k2p5`：Kimi Coding API（`api.kimi.com/coding/v1`）— 只支持 Coding Agent CLI
- `moonshot/kimi-k2.5`：Moonshot API（`api.moonshot.cn/v1`）— 标准 OpenAI-compatible API，**可以用于 subagent**
**墨笔用的是 `moonshot/kimi-k2.5`**，不是 `kimi-coding/k2p5`，所以墨笔可以正常 spawn。
**教训**：之前没区分这两个 provider 就下结论说墨笔不能用，是错的。以后先查配置再说话。

---

### PDF发送流程
message工具只允许从workspace目录发文件。标准流程：
1. `cp 桌面PDF → workspace/`
2. `message send filePath=workspace/xxx.pdf`
3. `rm workspace/xxx.pdf`（发完即删，不留副本）

### Google Workspace (gog)
- **账号**：wuhaofive@gmail.com
- **keyring**：file模式（非macOS钥匙串）
- **环境变量**：`GOG_KEYRING_PASSWORD=openclaw GOG_ACCOUNT=wuhaofive@gmail.com`
- **已开通服务**：Gmail + Calendar
- **配置时间**：2026-02-18

Add whatever helps you do your job. This is your cheat sheet.

### Telegram Bot 群聊配置三步曲（2026-02-19 吴总确认）
要让bot在群里不用@就能收发消息，**三步缺一不可**：

1. **BotFather `/setprivacy` → Disable** — 关闭隐私模式，bot才能收到所有群消息
2. **群里提升bot为Admin** — 确保bot有完整的消息读取权限
3. **OpenClaw配置 `requireMention: false`** — 配置群组白名单并关闭@要求

**踩坑记录：**
- 只改OpenClaw配置没用，Telegram Privacy Mode会拦截消息
- Privacy Mode改了之后，可能需要踢出bot再重新拉进群才生效
- 10个bot同时免@响应会打爆Gemini API限流，注意控制
