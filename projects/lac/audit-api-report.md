# API + 前后端一致性 审计报告

## 汇总
- API: 19/25 通过
- 一致性: 8/10 通过

## API测试详细结果

### ✅ 通过的API (19个)
1. **auth-email signup**: 返回正确的data.accessToken ✅
2. **auth-email signin**: 已在步骤0完成，返回正确的accessToken ✅  
3. **user-profile**: 返回用户详细信息 ✅
4. **mining-checkin GET**: 返回今日问题和签到状态 ✅
5. **mining-checkin POST**: 显示已签到状态 ✅
6. **mining-streak-simple**: 返回连续签到天数等数据 ✅
7. **courses**: 返回课程列表JSON数组 ✅
8. **quiz-system get-quiz**: 返回测验题目数组 ✅
10. **invite-system generate**: 返回邀请码 ✅
11. **invite-system stats**: 返回邀请统计数据 ✅
13. **leaderboard**: 4种类型(learning/teaching/creation/wealth)全部通过 ✅
14. **community-qa list**: 返回问题列表 ✅
15. **charity-project list**: 返回3个公益项目 ✅
17. **charity-donate history**: 返回捐赠记录 ✅
18. **governance-vote list**: 返回3个治理提案 ✅
19. **achievement-unlock**: 返回完整成就对象 ✅
20. **prompt-market list**: 返回模板列表 ✅
22. **dynamic-pool-simple**: 返回奖池数据 ✅
23. **startup-project list**: 返回创业项目 ✅
25. **ai-reward score**: 返回total_acp字段 ✅

### ❌ 失败的API (6个)
9. **mining-learn**: 课程ID不能为空 - 参数名不匹配问题
12. **content-submit**: 数据库函数public.validate_content_submission不存在
16. **charity-donate**: 数据库约束错误 - charity_donations表level字段不能为空
21. **mining-use record**: 数据库函数public.check_daily_usage_limit不存在
24. **tool-review list**: 数据库函数public.get_tool_reviews不存在

## 前后端一致性检查结果

### ✅ 一致的项目 (8个)
1. **✅ /checkin页面 → mining-checkin**: POST body正确包含answer字段
2. **✅ /learn/[id]页面 → quiz-system**: 正确带Authorization Bearer header
3. **✅ /teach页面 → content-submit**: 正确传user_id参数  
4. **✅ /charity-join页面 → charity-donate**: 正确传user_id参数
5. **✅ /profile页面 → invite-system**: user_id正确从auth context获取
6. **✅ /community页面 → leaderboard**: type正确使用learning等允许类型
7. **✅ /profile页面 → ai-reward**: 正确传ai_id参数
8. **✅ /profile页面 → mining-streak**: 正确使用GET+query参数

### ❌ 不一致的项目 (2个)
2. **❌ /learn/[id]页面 → mining-learn**: 前端传id参数，但API期望lessonId
8. **❌ AI工具页面 → mining-use**: 前端无实际API调用，页面为纯静态展示

## Bug清单

| # | 类型 | API/页面 | 问题 | 严重程度 | 完整错误(前200字符) |
|---|---|---|---|---|---|
| 1 | API | mining-learn | 参数名不匹配 | P1 | {"success":false,"error":"课程ID不能为空"} |
| 2 | API | content-submit | 数据库函数缺失 | P1 | {"error":"内容验证失败","details":"Could not find the function public.validate_content_submission(p_content, p_content_type) in the schema cache"} |
| 3 | API | charity-donate | 数据库约束错误 | P2 | {"error":"null value in column \"level\" of relation \"charity_donations\" violates not-null constraint"} |
| 4 | API | mining-use record | 数据库函数缺失 | P2 | {"error":"检查使用限制失败","details":"Could not find the function public.check_daily_usage_limit(p_tool_name, p_user_id) in the schema cache"} |
| 5 | API | tool-review list | 数据库函数缺失 | P3 | {"error":"获取评测列表失败","details":"Could not find the function public.get_tool_reviews(p_limit, p_offset, p_tool_name) in the schema cache"} |
| 6 | 一致性 | learn/[id]页面 | mining-learn参数不匹配 | P1 | 前端使用id参数调用miningLearnAPI.complete(token, id)，但API定义为lessonId |
| 7 | 一致性 | AI工具页面 | 缺失mining-use调用 | P2 | AI工具页面为静态展示，未实现实际的mining-use记录功能 |

## 建议修复

### 高优先级 (P0-P1)
1. **修复mining-learn参数不匹配**: 统一前后端参数名为lessonId或courseId
2. **添加缺失的数据库函数**: validate_content_submission用于内容验证
3. **修复前后端参数不一致**: learn页面调用mining-learn时使用正确参数名

### 中优先级 (P2)  
1. **修复charity-donate数据库约束**: level字段应有默认值或允许空值
2. **添加mining-use数据库函数**: check_daily_usage_limit用于使用限制检查
3. **完善AI工具页面**: 实现实际的mining-use API调用记录功能

### 低优先级 (P3)
1. **添加tool-review数据库函数**: get_tool_reviews用于工具评测列表

---
**审计时间**: 2026-02-22 11:45 GMT+8  
**测试环境**: https://ygfprjmevukjzwaqlblf.supabase.co  
**测试账号**: fulltest@test.com