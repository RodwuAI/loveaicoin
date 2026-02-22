#!/bin/bash

# LAC P2三合一功能测试脚本
BASE_URL="https://ygfprjmevukjzwaqlblf.supabase.co/functions/v1"
TEST_AI_ID="test-ai-001"
TEST_USER_ID="550e8400-e29b-41d4-a716-446655440000"

echo "=== LAC P2三合一功能测试 ==="
echo

# 1. AI Reward 系统测试
echo "🤖 测试 AI-Reward 系统"
echo "-------------------"

echo "1.1 记录AI贡献："
curl -X POST "$BASE_URL/ai-reward" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "record",
    "ai_id": "'$TEST_AI_ID'",
    "behavior_type": "content_creation",
    "description": "创建了一个高质量的教学内容"
  }' | jq '.'

echo -e "\n1.2 查询AI统计信息："
curl -X POST "$BASE_URL/ai-reward" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "stats",
    "ai_id": "'$TEST_AI_ID'"
  }' | jq '.'

echo -e "\n1.3 获取AI排行榜："
curl -X POST "$BASE_URL/ai-reward" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "leaderboard",
    "limit": 5
  }' | jq '.'

echo -e "\n\n"

# 2. Governance Vote 系统测试
echo "🗳️ 测试 Governance-Vote 系统"
echo "-------------------------"

echo "2.1 创建提案："
PROPOSAL_RESPONSE=$(curl -s -X POST "$BASE_URL/governance-vote" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "user_id": "'$TEST_USER_ID'",
    "title": "改善社区奖励机制",
    "description": "建议调整ACP积分分配规则，增加代码贡献的权重",
    "duration_days": 7
  }')

echo "$PROPOSAL_RESPONSE" | jq '.'

# 提取proposal_id用于后续测试
PROPOSAL_ID=$(echo "$PROPOSAL_RESPONSE" | jq -r '.proposal.id')

echo -e "\n2.2 对提案投票："
curl -X POST "$BASE_URL/governance-vote" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "vote",
    "user_id": "'$TEST_USER_ID'",
    "proposal_id": "'$PROPOSAL_ID'",
    "vote": "yes"
  }' | jq '.'

echo -e "\n2.3 查看提案列表："
curl -X POST "$BASE_URL/governance-vote" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "list",
    "limit": 5
  }' | jq '.'

echo -e "\n2.4 查看提案详情："
curl -X POST "$BASE_URL/governance-vote" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "detail",
    "proposal_id": "'$PROPOSAL_ID'"
  }' | jq '.'

echo -e "\n\n"

# 3. Achievement Unlock 系统测试
echo "🏆 测试 Achievement-Unlock 系统"
echo "----------------------------"

echo "3.1 检查用户成就解锁："
curl -X POST "$BASE_URL/achievement-unlock" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "check",
    "user_id": "'$TEST_USER_ID'"
  }' | jq '.'

echo -e "\n3.2 获取用户已解锁成就："
curl -X POST "$BASE_URL/achievement-unlock" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "list",
    "user_id": "'$TEST_USER_ID'"
  }' | jq '.'

echo -e "\n3.3 获取所有可用成就："
curl -X POST "$BASE_URL/achievement-unlock" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "all"
  }' | jq '.'

echo -e "\n"
echo "✅ 所有测试完成！"