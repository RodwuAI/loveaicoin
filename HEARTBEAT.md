# HEARTBEAT.md - 每45分钟唤醒一次

## 唤醒频率
**每 2 小时**自动唤醒检查

## 检查清单

### 每次唤醒都检查
- [ ] **待办任务** - 检查是否有需要跟进的事项
- [ ] **系统通知** - 检查重要系统通知
- [ ] **邮件** - 检查未读重要邮件（GOG_KEYRING_PASSWORD=openclaw GOG_ACCOUNT=wuhaofive@gmail.com gog gmail search "is:unread" --max 5 --no-input）
- [ ] **日历** - 检查未来24小时日程（GOG_KEYRING_PASSWORD=openclaw GOG_ACCOUNT=wuhaofive@gmail.com gog calendar events primary --from now --to +24h --no-input）

## 状态追踪
检查间隔通过 `memory/heartbeat-state.json` 控制，避免过于频繁的 API 调用。

---
*配置时间：2026-02-14*
*唤醒间隔：45分钟*

## 备注
- 邮件/日历检查暂时移除（等 Gmail/Google Calendar API 配置后再添加）
- 当前可用：待办事项跟踪、系统状态监控
