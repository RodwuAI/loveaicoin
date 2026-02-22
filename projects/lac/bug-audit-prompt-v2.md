# LAC全站Bug审计 — 执行Prompt V2.0

> 目标：执行完后，bug减少95%。
> 设计原则：不给蜂工任何"自行判断"的空间——每一步都写死操作、写死预期、写死判定标准。

---

## 📋 任务概述

你是LAC网站的QA测试工程师。你的任务是**逐项执行以下测试用例**，记录每一项的pass/fail结果，输出一份完整的bug报告。

**你不需要修任何代码。你只需要测试并报告。**

---

## 🔧 环境信息（直接复制使用）

```
网站URL: https://loveaicoin.com
Supabase URL: https://ygfprjmevukjzwaqlblf.supabase.co
Supabase Anon Key: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3
测试账号: email=fulltest@test.com password=Test123456!
```

### 登录获取Token（先执行这一步）

```bash
# 1. 登录
LOGIN=$(curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/auth-email/signin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d '{"email":"fulltest@test.com","password":"Test123456!"}')

# 2. 提取Token和UserID
TOKEN=$(echo $LOGIN | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['accessToken'])")
USERID=$(curl -s "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/user-profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['id'])")

echo "TOKEN=$TOKEN"
echo "USERID=$USERID"
```

**如果这一步失败，后续所有测试无法进行，立即报告。**

---

## 📝 测试用例（共5大类，67项）

### 第一类：页面可达性（22项）

**操作方式**：用 `curl -s -o /dev/null -w "%{http_code}" URL` 检查每个页面。

**判定标准**：
- 200 = ✅ Pass
- 其他 = ❌ Fail

```bash
for page in "" about whitepaper tokenomics roadmap learn teach community market ai-tools profile login register genesis ai-join charity-join checkin mining/learn mining/teach mining/create terms privacy; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://loveaicoin.com/$page" --max-time 10)
  echo "/$page → $STATUS"
done
```

**逐项记录到报告。**

---

### 第二类：页面内容质量（22项）

**操作方式**：用 `curl -s URL` 获取HTML，检查以下问题。

对每个页面，检查以下6项（共22页×6=132个检查点）：

| 检查项 | 搜索方式 | 判定 |
|--------|---------|------|
| undefined显示 | HTML中搜 `>undefined<` 或 `"undefined"` 但排除JS代码块内的 | 出现=Fail |
| null显示 | HTML中搜 `>null<` 但排除JS代码块 | 出现=Fail |
| NaN显示 | 搜 `NaN` | 出现=Fail |
| 0 LAC / 0 积分 | 搜 `0 LAC` `0 积分` `0 Points`（未登录状态下首页不应显示个人数据） | 出现=Fail |
| 假数据 | 搜 `10,000+` `50,000+` `1,234` `mock` `test` `Lorem` `example.com` `placeholder` | 出现=Fail |
| 中文乱码 | 搜 `\ufffd` `â€` `ã€` | 出现=Fail |

```bash
SUPABASE_URL="https://loveaicoin.com"
for page in "" about whitepaper tokenomics roadmap learn teach community market ai-tools profile login register genesis ai-join charity-join checkin mining/learn mining/teach mining/create terms privacy; do
  HTML=$(curl -s "$SUPABASE_URL/$page")
  echo "=== /$page ==="
  echo "$HTML" | grep -c '>undefined<'  # 应该是0
  echo "$HTML" | grep -c '>null<'       # 应该是0
  echo "$HTML" | grep -c 'NaN'          # 应该是0
  echo "$HTML" | grep -ci 'lorem'       # 应该是0
  echo "$HTML" | grep -c 'example\.com' # 应该是0
done
```

---

### 第三类：API端点验证（21个API，每个测试全部action）

**每个API都附上了完整curl命令。逐个执行，对比预期结果。**

**判定标准**：
- 返回预期JSON结构 = ✅ Pass
- 返回error/500/超时 = ❌ Fail（记录完整错误信息）

#### API-01: auth-email 注册
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/auth-email/signup" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d '{"email":"qatest_TIMESTAMP@test.com","password":"Test123456!","username":"qatest_TIMESTAMP"}'
```
**预期**：`{"data":{"accessToken":"lac_session_...","user":{...}}}` | 状态码200

#### API-02: auth-email 登录
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/auth-email/signin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d '{"email":"fulltest@test.com","password":"Test123456!"}'
```
**预期**：`{"data":{"accessToken":"...","user":{"id":"...","email":"fulltest@test.com",...}}}` | 200

#### API-03: user-profile
```bash
curl -s "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/user-profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3"
```
**预期**：`{"data":{"id":"...","email":"...","username":"...","lac_balance":"...","points_balance":...}}` | 200

#### API-04: mining-checkin GET（获取问题）
```bash
curl -s "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/mining-checkin" \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3"
```
**预期**：`{"success":true,"question":"..."}` 或 `{"success":true,"already_checked_in":true}` | 200

#### API-05: mining-checkin POST（提交签到）
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/mining-checkin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d '{"answer":"我今天学习了AI基础知识，了解了机器学习和深度学习的区别"}'
```
**预期**：`{"success":true,...}` 或 `{"error":"already checked in"}` | 200

#### API-06: mining-streak-simple
```bash
curl -s "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/mining-streak-simple?user_id=$USERID" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3"
```
**预期**：`{"success":true,"streak":N,"max_streak":N,...}` | 200
**⚠️ 注意：必须是GET方法 + query参数，不是POST**

#### API-07: courses列表
```bash
curl -s "https://ygfprjmevukjzwaqlblf.supabase.co/rest/v1/courses?select=id,title,category,difficulty&limit=5" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3"
```
**预期**：JSON数组，每项有id/title/category/difficulty | 200

#### API-08: quiz-system get-quiz
```bash
COURSE_ID=$(curl -s "https://ygfprjmevukjzwaqlblf.supabase.co/rest/v1/courses?select=id&limit=1" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" | python3 -c "import sys,json;print(json.load(sys.stdin)[0]['id'])")

curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/quiz-system" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d "{\"action\":\"get-quiz\",\"course_id\":\"$COURSE_ID\"}"
```
**预期**：`{"data":{"questions":[...]}}` questions数组非空 | 200

#### API-09: mining-learn（学习完成→领奖）
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/mining-learn" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d "{\"lessonId\":\"$COURSE_ID\",\"timeSpent\":30}"
```
**预期**：`{"success":true,"reward":{...}}` 或 `{"error":"already completed"}` | 200
**⚠️ 参数是lessonId和timeSpent，不是course_id**

#### API-10: invite-system generate
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/invite-system" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d "{\"action\":\"generate\",\"user_id\":\"$USERID\"}"
```
**预期**：`{"data":{"invite_code":"XXXXXX",...}}` | 200

#### API-11: invite-system stats
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/invite-system" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d "{\"action\":\"stats\",\"user_id\":\"$USERID\"}"
```
**预期**：`{"data":{"total_invites":N,...}}` | 200

#### API-12: content-submit
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/content-submit" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d "{\"action\":\"submit\",\"user_id\":\"$USERID\",\"title\":\"QA测试：AI学习方法论\",\"content\":\"本文详细介绍了五种有效的AI学习方法：1.从基础数学开始建立理论基础 2.通过实战项目巩固知识 3.参与开源社区获取反馈 4.定期复习和总结 5.与同行交流分享经验。每种方法都有其独特的优势和适用场景。\"}"
```
**预期**：`{"success":true,"data":{...}}` | 200
**⚠️ 已知Bug：可能报validate_content_submission RPC不存在。如果报错，记录为Fail。**

#### API-13: leaderboard（4种type都测）
```bash
for type in learning teaching creation wealth; do
  echo "--- type=$type ---"
  curl -s "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/leaderboard?type=$type" \
    -H "Authorization: Bearer $TOKEN" \
    -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3"
  echo ""
done
```
**预期**：每种type都返回 `{"success":true,"data":[...]}` | 200
**⚠️ type只能是learning/teaching/creation/wealth，其他值=无效**

#### API-14: community-qa list
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/community-qa" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d '{"action":"list"}'
```
**预期**：`{"questions":[...]}` | 200

#### API-15: charity-project list
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/charity-project" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d '{"action":"list"}'
```
**预期**：`{"projects":[...]}` 数组长度≥3 | 200

#### API-16: charity-donate
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/charity-donate" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d "{\"action\":\"donate\",\"user_id\":\"$USERID\",\"project_id\":\"3792b9a6-8a2d-4652-b2bc-9373859b53c7\",\"amount\":10}"
```
**预期**：`{"success":true,...}` 或 `{"error":"insufficient balance"}` | 200
**⚠️ 已知Bug：可能报level列非空约束。如果报错，记录为Fail。**

#### API-17: charity-donate history
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/charity-donate" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d "{\"action\":\"history\",\"user_id\":\"$USERID\"}"
```
**预期**：返回捐赠记录列表 | 200

#### API-18: governance-vote list
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/governance-vote" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d '{"action":"list"}'
```
**预期**：`{"proposals":[...]}` 数组长度≥3 | 200

#### API-19: achievement-unlock
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/achievement-unlock" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d "{\"action\":\"all\",\"user_id\":\"$USERID\"}"
```
**预期**：`{"achievements":{...}}` | 200

#### API-20: prompt-market list
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/prompt-market" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d '{"action":"list"}'
```
**预期**：`{"success":true,"data":[...]}` | 200

#### API-21: mining-use record
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/mining-use" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d "{\"action\":\"record\",\"user_id\":\"$USERID\",\"tool_name\":\"ChatGPT\",\"input_text\":\"请帮我写一篇关于AI教育的文章大纲要包含至少5个要点和详细说明\",\"output_text\":\"以下是AI教育文章的大纲1AI教育的背景与发展趋势2个性化学习的实现路径3AI辅助教学的核心工具4学生与AI协作的最佳实践5未来AI教育的挑战与机遇这些内容涵盖了当前最热门的话题\"}"
```
**预期**：`{"success":true,...}` | 200
**⚠️ input_text至少20字，output_text至少50字**
**⚠️ 已知Bug：可能报check_daily_usage_limit RPC不存在。如果报错，记录为Fail。**

#### API-22: dynamic-pool-simple
```bash
curl -s "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/dynamic-pool-simple" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3"
```
**预期**：`{"success":true,...}` | 200

#### API-23: startup-project list
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/startup-project" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d '{"action":"list"}'
```
**预期**：`{"success":true,"data":[...],"total":N}` | 200

#### API-24: tool-review list
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/tool-review" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d '{"action":"list"}'
```
**预期**：返回reviews列表 | 200
**⚠️ 已知Bug：可能报get_tool_reviews RPC不存在。如果报错，记录为Fail。**

#### API-25: ai-reward score
```bash
curl -s -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/ai-reward" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_rQWUHvRwwslnMTy_l3ry8Q_M9V47mD3" \
  -d "{\"action\":\"score\",\"ai_id\":\"$USERID\"}"
```
**预期**：`{"ai_id":"...","total_acp":N,"current_tier":"..."}` | 200

---

### 第四类：用户全链路E2E（4条链路）

**不是测单个API，是模拟真实用户从头到尾走一遍。**

#### E2E-1: 学生链路（15步）

按以下顺序执行，每一步记录pass/fail：

```
步骤1: 访问 /register → 页面正常加载？
步骤2: 注册新用户（用API-01的curl）→ 返回token？
步骤3: 访问 /login → 页面正常加载？
步骤4: 登录（用API-02的curl）→ 返回token？
步骤5: 访问 /learn → 课程列表非空？
步骤6: 访问 /learn/[任意课程id] → 课程详情显示？有章节内容？
步骤7: 获取测验（用API-08）→ 返回题目？
步骤8: 提交测验答案 → 返回得分？
步骤9: 完成学习领奖（用API-09）→ 返回LAC奖励？
步骤10: 访问 /checkin → 签到页面正常？
步骤11: 获取签到问题（API-04）→ 有问题？
步骤12: 提交签到（API-05）→ 签到成功？
步骤13: 查看连签（API-06）→ streak≥1？
步骤14: 访问 /profile → 个人资料显示？LAC余额>0？
步骤15: 查看排行榜（API-13 type=learning）→ 有数据？
```

#### E2E-2: 老师链路（9步）
```
步骤1: 登录（复用token）
步骤2: 访问 /teach → 页面正常？
步骤3: 发布教学内容（API-12）→ 提交成功？
步骤4: 生成邀请码（API-10）→ 返回6位码？
步骤5: 查看邀请统计（API-11）→ 返回数据？
步骤6: 模拟学生绑定邀请码 → 绑定成功？
步骤7: 模拟学生完成课程 → 老师获得佣金？
步骤8: 查看教学排行（API-13 type=teaching）→ 有数据？
步骤9: 访问 /profile → 佣金记录显示？
```

#### E2E-3: 公益链路（5步）
```
步骤1: 访问 /charity-join → 页面正常？
步骤2: 获取公益项目列表（API-15）→ ≥3个项目？
步骤3: 获取项目详情（用charity-project action=detail）→ 返回详情？
步骤4: 捐赠10 LAC（API-16）→ 成功或余额不足？
步骤5: 查看捐赠历史（API-17）→ 有记录？
```

#### E2E-4: 创业链路（4步）
```
步骤1: 访问 /charity-join → 切换到"提交项目"tab？
步骤2: 提交创业项目 → 提交成功？
步骤3: 查看项目列表（API-23）→ 有数据？
步骤4: 查看我的项目 → 有记录？
```

---

### 第五类：前端↔后端一致性（10项）

**这是抓参数不匹配bug的关键。**

对每个前端页面，检查它实际发送的API请求格式是否与后端匹配：

| # | 页面 | 要检查的API调用 | 检查什么 |
|---|------|----------------|---------|
| 1 | /checkin | mining-checkin POST | body是否有answer字段？answer是否≥10字？ |
| 2 | /learn/[id] | mining-learn POST | body是否传lessonId+timeSpent（不是course_id）？ |
| 3 | /learn/[id] | quiz-system POST | 是否带Authorization Bearer header？ |
| 4 | /teach | content-submit POST | body是否传user_id（不是author_id或token）？ |
| 5 | /charity-join | charity-donate POST | body是否传user_id（不是token）？ |
| 6 | /profile | invite-system POST | user_id是否从auth context获取（不是硬编码）？ |
| 7 | /community | leaderboard GET | type参数是否是learning/teaching/creation/wealth之一？ |
| 8 | /mining/use | mining-use POST | body是否传user_id+tool_name+input_text+output_text（不是tool_id）？ |
| 9 | /profile | ai-reward POST | body是否传ai_id（不是token或user_id）？ |
| 10 | /profile | mining-streak GET | 是否用GET+query参数?user_id=xxx（不是POST）？ |

**检查方法**：读取前端源代码 `lib/api.ts` 和对应页面组件，对比实际发送的参数。

---

## 📊 输出格式要求

```markdown
# LAC全站Bug报告 — [日期] [时间]

## 汇总
- 页面可达性：X/22 通过
- 页面内容质量：X项异常
- API端点：X/25 通过
- E2E链路：学生X/15 | 老师X/9 | 公益X/5 | 创业X/4
- 前后端一致性：X/10 通过
- **总Bug数：N个**

## Bug清单
| # | 类型 | 位置 | 问题描述 | 严重程度 | 完整错误信息 |
|---|------|------|---------|---------|------------|
| 1 | API | content-submit | validate_content_submission RPC不存在 | P0 | {...} |
| 2 | ... | ... | ... | ... | ... |

## 严重程度定义
- P0：功能完全不可用（API报错、页面白屏）
- P1：功能异常但有workaround（参数不匹配但前端已绕过）
- P2：体验问题（假数据、undefined显示、样式错乱）
- P3：优化项（性能、SEO、无障碍）
```

---

## ⛔ 禁止事项

1. **禁止修任何代码** — 你只测试和报告
2. **禁止跳过任何测试项** — 即使你觉得"应该没问题"
3. **禁止写"大致正常"** — 每一项必须是明确的 Pass 或 Fail
4. **禁止自行判断"这不是bug"** — 与预期不符就是Fail，由蜂王判断是否修
5. **禁止只报结论不报数据** — 每个Fail必须附完整的响应内容（至少前200字符）

---

*V2.0 | 2026-02-22 | 设计目标：执行后bug减少95%*
