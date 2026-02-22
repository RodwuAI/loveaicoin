# LAC 四类用户完整链路 + 后端接口 + 数据库表

## 一、小白学生（学AI → 挖矿 → 领币）

| 步骤 | 用户操作 | 后端API | 数据库表 | 状态 |
|------|---------|---------|---------|------|
| 1 | 注册 | POST auth-email/signup | users, user_sessions | ✅ |
| 2 | 登录 | POST auth-email/signin | user_sessions | ✅ |
| 3 | 浏览课程 | GET /rest/v1/courses | courses | ✅ |
| 4 | 进入课程详情 | GET /rest/v1/courses?id=eq.xxx | courses (metadata JSONB) | ✅ |
| 5 | 阅读章节 | 前端渲染metadata.chapter_content | - (纯前端) | ✅ |
| 6 | 做测验 | POST quiz-system {action:get-quiz} | quiz_questions + courses.metadata.quiz | ✅ |
| 7 | 提交测验 | POST quiz-system {action:submit} | quiz_attempts | ✅ |
| 8 | 完成学习→领LAC | POST mining-learn | mining_records, users(余额) | ✅ |
| 9 | 每日签到 | GET/POST mining-checkin | checkin_records, users | ✅ |
| 10 | 查看连签 | GET mining-streak-simple | checkin_records | ✅ |
| 11 | 查看个人资料 | GET user-profile | users | ✅ |
| 12 | 拜师（用邀请码） | POST invite-system {action:bind} | teacher_student, invitations | ✅ |
| 13 | 连接钱包 | POST auth-connect-wallet | user_wallets | ⚠️ 未前端集成 |
| 14 | 查看成就 | POST achievement-unlock {action:list} | user_achievements, achievements | ✅ |
| 15 | 查看排行榜 | GET leaderboard?type=learning | leaderboard_cache | ✅ |

**链路1验证结果：13/15 通过**

---

## 二、老师/教练（教AI → 招生 → 赚奖励）

| 步骤 | 用户操作 | 后端API | 数据库表 | 状态 |
|------|---------|---------|---------|------|
| 1 | 注册/登录 | auth-email | users, user_sessions | ✅ |
| 2 | 发布教学内容 | POST content-submit {action:submit} | teaching_contents | ✅ 刚修 |
| 3 | 查看我的教学 | POST content-submit {action:list} | teaching_contents | ✅ |
| 4 | 生成邀请码 | POST invite-system {action:generate} | invitations | ✅ |
| 5 | 分享邀请链接 | 前端拼接URL | - | ✅ |
| 6 | 学生绑定 | POST invite-system {action:bind} | teacher_student | ✅ |
| 7 | 查看学生统计 | POST invite-system {action:stats} | teacher_student, invitations | ✅ |
| 8 | 获得教学奖励 | POST invite-system {action:commission} | 需确认 | ⚠️ 待验证 |
| 9 | 查看教学排行 | GET leaderboard?type=teaching | leaderboard_cache | ⚠️ 待验证 |

**链路2验证结果：7/9 通过**

---

## 三、公益参与者（做公益 → 捐赠 → 获得荣誉）

| 步骤 | 用户操作 | 后端API | 数据库表 | 状态 |
|------|---------|---------|---------|------|
| 1 | 浏览公益项目 | POST charity-project {action:list} | charity_projects | ✅ |
| 2 | 查看项目详情 | POST charity-project {action:detail} | charity_projects | ⚠️ 待验证 |
| 3 | 捐赠LAC | POST charity-donate {action:donate} | charity_donations, users(扣余额) | ⚠️ 待验证 |
| 4 | 查看捐赠历史 | POST charity-donate {action:history} | charity_donations | ⚠️ 待验证 |
| 5 | 获得公益成就 | POST achievement-unlock | user_achievements | ⚠️ 待验证 |

**链路3验证结果：1/5 通过，4个待验证**

---

## 四、创业者（提交项目 → 获得孵化/加速 → 融资）

| 步骤 | 用户操作 | 后端API | 数据库表 | 状态 |
|------|---------|---------|---------|------|
| 1 | 浏览创业页面 | 前端 /charity-join | - | ✅ 页面存在 |
| 2 | 提交创业项目申请 | ❌ 无对应API | ❌ 无表 | ❌ 缺失 |
| 3 | 项目审核 | ❌ 无对应API | ❌ 无表 | ❌ 缺失 |
| 4 | 获得加速器资源 | ❌ 无对应API | ❌ 无表 | ❌ 缺失 |
| 5 | 融资对接 | ❌ 无对应API | ❌ 无表 | ❌ 缺失 |

**链路4验证结果：1/5 通过，4个功能缺失**

---

## 🔴 汇总

| 链路 | 通过/总计 | 状态 |
|------|----------|------|
| 学生 | 13/15 | 🟢 基本可用 |
| 老师 | 7/9 | 🟡 缺奖励验证 |
| 公益 | 1/5 | 🟡 API存在但未验证 |
| 创业 | 1/5 | 🔴 缺后端+数据库 |

## 数据库表使用情况

### 已使用（有API连接）
users, user_sessions, courses, quiz_questions, quiz_attempts, checkin_records, mining_records, daily_mining_stats, invitations, teacher_student, teaching_contents, charity_projects, charity_donations, governance_proposals, governance_votes, prompt_templates, prompt_usage, achievements, user_achievements, ai_contribution_scores, tool_reviews, user_ai_tool_usage, leaderboard_cache, system_config, user_wallets, community_votes

### 存在但未使用
course_lessons, user_lesson_progress, daily_quests, user_daily_quests, seasons, user_season_pass, teams, team_members, team_leaderboard, streak_protections, anti_cheat_logs, ai_tools, ai_contributions, ai_rewards, content_interactions, answers, questions, proposals, proposal_votes, user_courses, course_stats_view, daily_usage_limits, popular_teaching_contents, user_achievement_stats, rate_limits
