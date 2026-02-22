# LAC 后端开发工作量清单 V1

**日期：** 2026-02-22  
**状态：** 基于全站检查+功能需求梳理

---

## 已完成 ✅（6个Edge Function + 25+表）

| # | Function | 功能 | 状态 |
|---|----------|------|------|
| 1 | auth-email | 注册/登录 | ✅ 已部署 |
| 2 | mining-checkin | 签到挖矿（含答题） | ✅ 已部署 |
| 3 | mining-learn | 学习挖矿（课程完成） | ✅ 已部署 |
| 4 | user-profile | 用户资料查询/更新 | ✅ 已部署 |
| 5 | leaderboard | 排行榜（学习/签到/总榜） | ✅ 已部署 |
| 6 | auth-connect-wallet | Solana钱包绑定 | ✅ 已部署 |

---

## 待开发（按优先级排序）

### P0 — 首发必须（7个新Function + 3张新表）

| # | Function | 功能 | 涉及表 | 工作量 | 说明 |
|---|----------|------|--------|--------|------|
| 7 | **mining-use** | 使用AI工具记录+挖矿 | user_ai_tool_usage, mining_records | 中 | 记录工具使用，验证输入≥20字/输出≥50字，每日单工具上限5次 |
| 8 | **mining-streak** | 连续签到/学习天数计算+奖励加成 | checkin_records, mining_records | 中 | 7天1.2x / 14天1.4x / 30天1.5x，断签重置 |
| 9 | **quiz-system** | 测验系统（题库抽题+评分+挖矿） | NEW: quiz_questions, quiz_attempts | 高 | ≥50题池抽10题，正确率≥80%通过，3秒/题异常检测 |
| 10 | **courses-import** | 500教程批量导入 | courses, course_lessons | 低 | 墨笔正在生成courses-500.json，需要导入脚本 |
| 11 | **invite-system** | 邀请链接+师徒关系+分成 | NEW: invitations, teacher_student | 高 | 邀请码生成、注册绑定、学生完成学习后触发奖励、3%持续分成 |
| 12 | **prompt-market** | Prompt模板提交+市场+使用追踪 | NEW: prompt_templates, prompt_usage | 高 | 模板格式验证、查重、每日发布3个上限、使用计数 |
| 13 | **dynamic-pool** | 动态矿池奖励计算引擎 | system_config, daily_mining_stats | 高 | 每日释放预算÷行为人数，floor/ceiling模型，替代固定奖励 |

### P1 — 第二批（5个Function + 2张新表）

| # | Function | 功能 | 涉及表 | 工作量 | 说明 |
|---|----------|------|--------|--------|------|
| 14 | **tool-review** | 工具评测系统 | NEW: tool_reviews | 中 | 使用记录验证+100字门槛+每人每工具1次 |
| 15 | **content-submit** | 内容创作提交+审核 | teaching_contents, content_interactions | 中 | 文章≥800字/视频≥3分钟，查重，审核队列 |
| 16 | **community-qa** | 社区问答+采纳+投票 | NEW: questions, answers, votes | 高 | 提问/回答/采纳/点赞，防自问自答 |
| 17 | **charity-donate** | 公益捐赠记录 | NEW: charity_donations | 低 | 捐赠等级、捐赠记录、贡献者徽章 |
| 18 | **charity-project** | 公益项目申请+审核+进度 | NEW: charity_projects | 中 | 项目提交、审核流程、进度追踪、筹款状态 |

### P2 — 第三批（3个Function）

| # | Function | 功能 | 涉及表 | 工作量 | 说明 |
|---|----------|------|--------|--------|------|
| 19 | **ai-reward** | AI贡献者奖励系统（ACP） | NEW: ai_contributions, ai_rewards | 高 | 6级体系、ACP积分、周结算、防滥用 |
| 20 | **governance-vote** | 社区治理投票 | NEW: proposals, votes | 中 | 提案提交、投票、执行 |
| 21 | **achievement-unlock** | 成就系统自动解锁 | achievements, user_achievements | 中 | 监听各种行为，自动触发成就解锁+奖励 |

---

## 新增数据库表清单（11张）

| 表名 | 归属Function | 说明 |
|------|-------------|------|
| quiz_questions | quiz-system | 题库（题目/选项/正确答案/分类/难度） |
| quiz_attempts | quiz-system | 答题记录（用户/课程/分数/用时/各题详情） |
| invitations | invite-system | 邀请码（邀请人/链接/使用次数） |
| teacher_student | invite-system | 师徒关系（导师/学生/绑定时间/分成记录） |
| prompt_templates | prompt-market | Prompt模板（标题/描述/模板内容/使用示例/标签） |
| prompt_usage | prompt-market | 模板使用追踪（使用者/模板/时间） |
| tool_reviews | tool-review | 工具评测（用户/工具/评分/评价文字） |
| charity_donations | charity-donate | 捐赠记录（捐赠人/金额/等级/时间） |
| charity_projects | charity-project | 公益项目（名称/描述/申请人/金额/状态/进度） |
| ai_contributions | ai-reward | AI贡献记录（AI身份/行为/ACP积分） |
| proposals | governance-vote | 治理提案（标题/描述/投票结果） |

---

## 工作量估算

| 优先级 | Function数 | 新表数 | 预估工时 |
|--------|-----------|--------|----------|
| P0 | 7 | 5 | 3-4天 |
| P1 | 5 | 4 | 2-3天 |
| P2 | 3 | 2 | 2天 |
| **合计** | **15** | **11** | **7-9天** |

### 建议开发顺序（P0拆成3批）

**Day 3 (2/22)：** mining-streak + courses-import + dynamic-pool（核心经济引擎）
**Day 4 (2/23)：** quiz-system + mining-use（核心挖矿功能）
**Day 5 (2/24)：** invite-system + prompt-market（增长+创造引擎）
**Day 6-7 (2/25-26)：** P1全部
**Day 8-9 (2/27-28)：** P2全部 + 集成测试

---

## 前端配套修改

| 页面 | 需要改什么 | 说明 |
|------|-----------|------|
| /checkin | 连接streak API，替换硬编码数据 | 当前"连续7天""350 LAC"都是假数据 |
| /mining/* | 奖励数值改为动态范围 | 从dynamic-pool API获取当日预算 |
| /learn | 对接quiz系统 | 课程完成后弹出测验 |
| /ai-tools | 对接mining-use | 使用记录+挖矿触发 |
| /teach | 对接invite系统 | 生成邀请链接 |
| /market | 对接prompt-market | Prompt模板提交+购买 |
| /community | 对接community-qa | 发帖/回答/投票 |
| /charity-join | 对接charity API | 捐赠+项目申请 |
