#!/bin/bash

# 测试LAC Edge Functions
# 需要先设置环境变量：
# export SUPABASE_URL="https://ygfprjmevukjzwaqlblf.supabase.co"
# export SUPABASE_ANON_KEY="your-anon-key"

echo "=== 测试LAC Edge Functions ==="
echo ""

# 测试1: mining-use - record
echo "1. 测试 mining-use (record):"
curl -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/mining-use" \
  -H "Authorization: Bearer sbp_8d8ca4334c042df975a4485c6d625c0a20843bdb" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "record",
    "user_id": "00000000-0000-0000-0000-000000000000",
    "tool_name": "test-tool",
    "input_text": "这是一个测试输入文本，长度超过20字以满足要求。这是一个测试输入文本，长度超过20字以满足要求。",
    "output_text": "这是一个测试输出文本，长度超过50字以满足要求。这是一个测试输出文本，长度超过50字以满足要求。这是一个测试输出文本，长度超过50字以满足要求。这是一个测试输出文本，长度超过50字以满足要求。"
  }'
echo ""
echo ""

# 测试2: mining-use - history
echo "2. 测试 mining-use (history):"
curl -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/mining-use" \
  -H "Authorization: Bearer sbp_8d8ca4334c042df975a4485c6d625c0a20843bdb" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "history",
    "user_id": "00000000-0000-0000-0000-000000000000",
    "limit": 5,
    "page": 1
  }'
echo ""
echo ""

# 测试3: tool-review - list
echo "3. 测试 tool-review (list):"
curl -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/tool-review" \
  -H "Authorization: Bearer sbp_8d8ca4334c042df975a4485c6d625c0a20843bdb" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "list",
    "tool_name": "test-tool",
    "limit": 5
  }'
echo ""
echo ""

# 测试4: content-submit - list
echo "4. 测试 content-submit (list):"
curl -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/content-submit" \
  -H "Authorization: Bearer sbp_8d8ca4334c042df975a4485c6d625c0a20843bdb" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "list",
    "limit": 5,
    "page": 1
  }'
echo ""
echo ""

echo "=== 测试完成 ==="