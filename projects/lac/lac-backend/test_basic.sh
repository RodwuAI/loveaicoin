#!/bin/bash

echo "=== 基本功能测试 ==="
echo ""

# 测试1: 检查函数是否可访问
echo "1. 测试 mining-use 端点可访问性:"
curl -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/mining-use" \
  -H "Authorization: Bearer sbp_8d8ca4334c042df975a4485c6d625c0a20843bdb" \
  -H "Content-Type: application/json" \
  -d '{"action": "test"}' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""

# 测试2: 测试缺少参数的错误处理
echo "2. 测试缺少参数的错误处理:"
curl -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/mining-use" \
  -H "Authorization: Bearer sbp_8d8ca4334c042df975a4485c6d625c0a20843bdb" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""

# 测试3: 测试CORS预检请求
echo "3. 测试CORS预检请求:"
curl -X OPTIONS "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/mining-use" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization, content-type" \
  -w "\nHTTP Status: %{http_code}\n"
echo ""

# 测试4: 测试tool-review端点
echo "4. 测试 tool-review 端点:"
curl -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/tool-review" \
  -H "Authorization: Bearer sbp_8d8ca4334c042df975a4485c6d625c0a20843bdb" \
  -H "Content-Type: application/json" \
  -d '{"action": "list", "limit": 5}' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""

# 测试5: 测试content-submit端点
echo "5. 测试 content-submit 端点:"
curl -X POST "https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1/content-submit" \
  -H "Authorization: Bearer sbp_8d8ca4334c042df975a4485c6d625c0a20843bdb" \
  -H "Content-Type: application/json" \
  -d '{"action": "list", "limit": 5}' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""

echo "=== 测试完成 ==="
echo ""
echo "注意：这些测试只验证端点可访问性和基本错误处理。"
echo "要测试完整功能，需要先执行数据库迁移。"