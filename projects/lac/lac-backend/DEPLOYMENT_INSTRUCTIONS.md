# LAC Edge Functions 部署说明

## 已完成的工作

### 1. Edge Functions 已部署
以下三个Edge Functions已成功部署到Supabase项目 `ygfprjmevukjzwaqlblf`：

1. **mining-use** - AI工具使用记录+挖矿
   - 端点: `https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/mining-use`
   - 功能: 记录AI工具使用、计算LAC奖励、检查每日限制

2. **tool-review** - 工具评测提交
   - 端点: `https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/tool-review`
   - 功能: 提交工具评测、验证使用记录、每人每工具1次评测

3. **content-submit** - 内容创作提交+审核
   - 端点: `https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/content-submit`
   - 功能: 内容提交、审核、列表查询

### 2. 代码文件位置
所有Edge Functions代码位于：
- `/supabase/functions/mining-use/`
- `/supabase/functions/tool-review/`
- `/supabase/functions/content-submit/`

## 需要手动执行的步骤

### 1. 数据库迁移
由于Supabase CLI连接问题，需要手动在Supabase Dashboard中执行SQL迁移：

1. 登录 Supabase Dashboard: https://supabase.com/dashboard/project/ygfprjmevukjzwaqlblf
2. 进入 SQL Editor
3. 复制并执行 `supabase/migrations/edge_functions_setup.sql` 文件中的SQL语句

### 2. 环境变量配置
确保Edge Functions有以下环境变量：
- `SUPABASE_URL`: Supabase项目URL
- `SUPABASE_SERVICE_ROLE_KEY`: 服务角色密钥

## 测试端点

### mining-use 端点
```bash
# 记录使用
curl -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/mining-use" \
  -H "Authorization: Bearer sbp_8d8ca4334c042df975a4485c6d625c0a20843bdb" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "record",
    "user_id": "user-uuid-here",
    "tool_name": "test-tool",
    "input_text": "输入文本至少20字...",
    "output_text": "输出文本至少50字..."
  }'

# 获取历史
curl -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/mining-use" \
  -H "Authorization: Bearer sbp_8d8ca4334c042df975a4485c6d625c0a20843bdb" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "history",
    "user_id": "user-uuid-here",
    "limit": 10,
    "page": 1
  }'
```

### tool-review 端点
```bash
# 提交评测
curl -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/tool-review" \
  -H "Authorization: Bearer sbp_8d8ca4334c042df975a4485c6d625c0a20843bdb" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "submit",
    "user_id": "user-uuid-here",
    "tool_name": "test-tool",
    "rating": 5,
    "review_text": "评测内容至少100字..."
  }'

# 获取评测列表
curl -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/tool-review" \
  -H "Authorization: Bearer sbp_8d8ca4334c042df975a4485c6d625c0a20843bdb" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "list",
    "tool_name": "test-tool",
    "limit": 10
  }'
```

### content-submit 端点
```bash
# 提交内容
curl -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/content-submit" \
  -H "Authorization: Bearer sbp_8d8ca4334c042df975a4485c6d625c0a20843bdb" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "submit",
    "user_id": "user-uuid-here",
    "title": "测试文章",
    "content": "文章内容至少800字...",
    "content_type": "article"
  }'

# 获取内容列表
curl -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/content-submit" \
  -H "Authorization: Bearer sbp_8d8ca4334c042df975a4485c6d625c0a20843bdb" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "list",
    "limit": 10,
    "page": 1
  }'
```

## 验收标准

### 已完成
- [x] 3个Edge Functions全部部署成功
- [x] 所有端点代码编写完成
- [x] 函数逻辑实现完成

### 待完成（需要手动执行）
- [ ] SQL迁移推送（新表+RLS）
- [ ] 所有端点curl测试通过
- [ ] 限制规则生效

## 注意事项

1. **数据库迁移**: 必须先执行SQL迁移，Edge Functions才能正常工作
2. **测试用户**: 测试时需要有效的用户UUID
3. **限制规则**: 每日单工具上限5次，每日总上限20次
4. **内容要求**: 文章≥800字，视频说明≥150字
5. **评测要求**: 评测内容≥100字，每人每工具1次评测