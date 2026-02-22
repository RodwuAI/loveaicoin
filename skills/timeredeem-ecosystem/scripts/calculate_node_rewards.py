#!/usr/bin/env python3
"""
Calculate consensus node reward distributions.
Usage: python3 calculate_node_rewards.py --node-id <id> --referrals <count> [--transactions <amount>]
"""

import argparse
import json

def calculate_rewards(node_tier, direct_referrals, indirect_referrals=None, 
                     transaction_volume=0, ai_twin_performance=0):
    """
    Calculate consensus node rewards.
    
    Args:
        node_tier: Node tier (opener, consensus, referral)
        direct_referrals: Number of direct referrals
        indirect_referrals: Dict with level2 and level3 counts
        transaction_volume: Monthly transaction volume in USD
        ai_twin_performance: AI分身 performance score (0-100)
    
    Returns:
        dict: Reward breakdown
    """
    
    if indirect_referrals is None:
        indirect_referrals = {'level2': 0, 'level3': 0}
    
    # Base reward rates
    rates = {
        'direct_referral': 0.20,      # 20%
        'level2_referral': 0.10,      # 10%
        'level3_referral': 0.05,      # 5%
        'transaction_fee': 0.02,      # 2% of volume
        'ai_twin_bonus': 0.01,        # 1% per 10 performance points
        'base_consensus_reward': 500  # Base monthly reward for consensus nodes
    }
    
    # Tier multipliers
    tier_multipliers = {
        'opener': 1.0,
        'consensus': 2.0,
        'referral': 1.5
    }
    
    multiplier = tier_multipliers.get(node_tier, 1.0)
    
    # Calculate rewards
    rewards = {
        'direct_referral_reward': direct_referrals * 1000 * rates['direct_referral'],
        'level2_referral_reward': indirect_referrals.get('level2', 0) * 1000 * rates['level2_referral'],
        'level3_referral_reward': indirect_referrals.get('level3', 0) * 1000 * rates['level3_referral'],
        'transaction_fee_reward': transaction_volume * rates['transaction_fee'],
        'ai_twin_bonus': (ai_twin_performance / 10) * transaction_volume * rates['ai_twin_bonus']
    }
    
    # Add base reward for consensus nodes
    if node_tier == 'consensus':
        rewards['base_consensus_reward'] = rates['base_consensus_reward']
    
    # Apply tier multiplier
    total_before_multiplier = sum(rewards.values())
    rewards['tier_multiplier'] = multiplier
    rewards['total_reward'] = total_before_multiplier * multiplier
    
    return rewards

def generate_reward_report(node_id, node_tier, rewards):
    """Generate a reward report."""
    
    report = f"""
📊 TimeRedeem 共识节点奖励报告
============================
节点ID: {node_id}
节点层级: {node_tier.upper()}
报告日期: 2024年12月

💰 奖励明细：
"""
    
    for key, value in rewards.items():
        if key not in ['tier_multiplier', 'total_reward']:
            label = key.replace('_', ' ').title()
            report += f"  {label}: ${value:,.2f}\n"
    
    report += f"""
📈 层级乘数: {rewards['tier_multiplier']}x
💵 总奖励: ${rewards['total_reward']:,.2f}

🎯 优化建议：
"""
    
    # Add optimization suggestions
    if rewards.get('direct_referral_reward', 0) < 1000:
        report += "  • 增加直接推荐数量可显著提升收益\n"
    if rewards.get('ai_twin_bonus', 0) < 100:
        report += "  • 优化AI分身性能可获得额外奖励\n"
    if rewards.get('transaction_fee_reward', 0) < 500:
        report += "  • 提升网络交易量可增加手续费分成\n"
    
    return report

def main():
    parser = argparse.ArgumentParser(description='Calculate TimeRedeem Node Rewards')
    parser.add_argument('--node-id', required=True, help='Node identifier')
    parser.add_argument('--tier', default='consensus', 
                        choices=['opener', 'consensus', 'referral'],
                        help='Node tier')
    parser.add_argument('--direct-referrals', type=int, default=0,
                        help='Number of direct referrals')
    parser.add_argument('--level2-referrals', type=int, default=0,
                        help='Number of level 2 referrals')
    parser.add_argument('--level3-referrals', type=int, default=0,
                        help='Number of level 3 referrals')
    parser.add_argument('--transaction-volume', type=float, default=0,
                        help='Monthly transaction volume (USD)')
    parser.add_argument('--ai-twin-score', type=int, default=0,
                        help='AI twin performance score (0-100)')
    parser.add_argument('--report', action='store_true',
                        help='Generate human-readable report')
    
    args = parser.parse_args()
    
    indirect = {
        'level2': args.level2_referrals,
        'level3': args.level3_referrals
    }
    
    try:
        rewards = calculate_rewards(
            args.tier,
            args.direct_referrals,
            indirect,
            args.transaction_volume,
            args.ai_twin_score
        )
        
        if args.report:
            print(generate_reward_report(args.node_id, args.tier, rewards))
        else:
            print(json.dumps(rewards, indent=2))
        
        return 0
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return 1

if __name__ == '__main__':
    exit(main())
