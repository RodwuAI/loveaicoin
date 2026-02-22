# LAC 后端↔前端 对接审计 (2026-02-22 04:30)

## 核心功能清单 + 验证状态

### 1️⃣ 用户系统
| 功能 | 后端 | 前端调用 | 状态 |
|------|------|---------|------|
| 注册 | POST auth-email/signup | ✅ 正确 | ✅ |
| 登录 | POST auth-email/signin | ✅ 正确 | ✅ |
| 获取资料 | GET user-profile (Bearer) | ✅ 正确 | ✅ |
| 连接钱包 | POST auth-connect-wallet (token body) | ⚠️ 前端未实际使用 | ⚠️ |

### 2️⃣ 签到系统
| 功能 | 后端 | 前端调用 | 状态 |
|------|------|---------|------|
| 获取问题 | GET mining-checkin (Bearer) | ✅ 正确 | ✅ |
| 提交签到 | POST mining-checkin (Bearer, {answer}) | ✅ 正确 | ✅ |
| 连签状态 | GET mining-streak-simple?user_id=xxx | ✅ 已修复 | ✅ |

### 3️⃣ 学习系统
| 功能 | 后端 | 前端调用 | 状态 |
|------|------|---------|------|
| 课程列表 | GET /rest/v1/courses (Supabase REST) | ✅ 正确 | ✅ |
| 获取测验 | POST quiz-system (Bearer, {action:"get-quiz", course_id}) | ✅ 已修复 | ✅ |
| 提交测验 | POST quiz-system (Bearer, {action:"submit", course_id, answers}) | ✅ 正确 | ✅ |
| 学习完成 | POST mining-learn (Bearer, {lessonId, timeSpent}) | ✅ 已修复 | ⚠️ 后端查lessons表，但数据在courses表 |

### 4️⃣ 挖矿系统
| 功能 | 后端 | 前端调用 | 状态 |
|------|------|---------|------|
| 工具使用 | POST mining-use ({action:"record", user_id, tool_name, input_text, output_text}) | ❌ 前端传tool_id/input_chars | ❌ 参数不匹配 |
| 动态矿池 | GET dynamic-pool-simple | ✅ 正确 | ✅ |

### 5️⃣ 邀请系统
| 功能 | 后端 | 前端调用 | 状态 |
|------|------|---------|------|
| 生成邀请码 | POST invite-system ({action:"generate", user_id}) | ✅ 已修复 | ✅ |
| 邀请统计 | POST invite-system ({action:"stats", user_id}) | ✅ 正确 | ✅ |

### 6️⃣ 社区系统
| 功能 | 后端 | 前端调用 | 状态 |
|------|------|---------|------|
| 问答列表 | POST community-qa ({action:"list"}) | ✅ 正确 | ✅ |
| 发问题 | POST community-qa ({action:"ask", ...}) | ✅ 正确 | ✅ |
| 回答 | POST community-qa ({action:"answer", ...}) | ✅ 正确 | ✅ |
| 排行榜 | GET leaderboard?type=learning (Bearer) | ✅ 已修复 | ✅ |

### 7️⃣ 市场系统
| 功能 | 后端 | 前端调用 | 状态 |
|------|------|---------|------|
| 模板列表 | POST prompt-market ({action:"list"}) | ✅ 正确 | ✅ |
| 发布模板 | POST prompt-market ({action:"submit", user_id, title, template_content}) | ⚠️ 前端参数可能不全 | ⚠️ |

### 8️⃣ 公益系统
| 功能 | 后端 | 前端调用 | 状态 |
|------|------|---------|------|
| 项目列表 | POST charity-project ({action:"list"}) | ✅ 正确 | ✅ |
| 捐赠 | POST charity-donate ({action:"donate", token, project_id, amount}) | ⚠️ 需验证 | ⚠️ |

### 9️⃣ 治理系统
| 功能 | 后端 | 前端调用 | 状态 |
|------|------|---------|------|
| 提案列表 | POST governance-vote ({action:"list"}) | ✅ 正确 | ✅ |
| 投票 | POST governance-vote ({action:"vote", token, proposal_id, choice}) | ⚠️ 需验证 | ⚠️ |

### 🔟 成就/奖励系统
| 功能 | 后端 | 前端调用 | 状态 |
|------|------|---------|------|
| 成就列表 | POST achievement-unlock ({action:"all", user_id}) | ✅ 正确 | ✅ |
| AI积分 | POST ai-reward ({action:"score", ai_id}) | ❌ 前端传token不传ai_id | ❌ |

---

## 🔴 待修BUG汇总

| # | 系统 | 问题 | 优先级 | 状态 |
|---|------|------|--------|------|
| 1 | 学习 | mining-learn查lessons表但数据在courses | P0 | 待修 |
| 2 | 挖矿 | mining-use前端参数完全不匹配后端 | P1 | 待修 |
| 3 | 奖励 | ai-reward需要ai_id不是token | P1 | 待修 |
| 4 | 市场 | prompt-market发布参数需验证 | P2 | 待验 |
| 5 | 公益 | charity-donate参数需验证 | P2 | 待验 |
| 6 | 治理 | governance-vote投票参数需验证 | P2 | 待验 |
