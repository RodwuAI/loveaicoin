#!/usr/bin/env python3
"""
Generate customized TimeRedeem partnership agreements.
Usage: python3 generate_partner_agreement.py --tier <tier> --partner-name <name> [--output <path>]
"""

import argparse
import json
from datetime import datetime

def generate_agreement(tier, partner_name, partner_info=None):
    """
    Generate a customized partnership agreement.
    
    Args:
        tier: Partner tier (time-opener, consensus-node, referral-node)
        partner_name: Name of the partner
        partner_info: Optional dict with additional partner details
    
    Returns:
        dict: Agreement content structure
    """
    
    # Base agreement structure
    agreement = {
        "header": {
            "company": "点时成金科技集团 (TimeRedeem Technology Group)",
            "document_title": "时间合伙人战略合作协议",
            "date": datetime.now().strftime("%Y年%m月%d日"),
            "version": "2024.12"
        },
        "parties": {
            "party_a": "点时成金科技集团",
            "party_b": partner_name
        },
        "tier_specific_terms": {}
    }
    
    # Tier-specific configurations
    tiers = {
        "time-opener": {
            "tier_name": "时间启幕者",
            "ecosystem_share": "0.1%",
            "min_commitment": "参与时间生态建设",
            "benefits": [
                "优先获得时间资产发行权",
                "生态治理投票权 (0.1%权重)",
                "早期项目参与资格",
                "元宇宙专属身份标识"
            ],
            "obligations": [
                "积极参与生态推广",
                "维护TimeRedeem品牌形象",
                "参与季度生态会议"
            ]
        },
        "consensus-node": {
            "tier_name": "共识节点合伙人",
            "ecosystem_share": "按节点等级分配",
            "min_commitment": "运行共识节点并维护网络安全",
            "benefits": [
                "共识节点奖励分配",
                "生态治理投票权",
                "交易手续费分成",
                "AI分身技术优先使用权",
                "元宇宙土地优先认购权"
            ],
            "obligations": [
                "维护节点24/7在线",
                "参与网络共识验证",
                "推荐至少3个子节点",
                "季度业绩报告"
            ]
        },
        "referral-node": {
            "tier_name": "推荐节点合伙人",
            "ecosystem_share": "按推荐业绩分配",
            "min_commitment": "拓展时间合伙人网络",
            "benefits": [
                "直接推荐奖励 (20%)",
                "间接推荐奖励 (10%)",
                "团队业绩分成",
                "培训与营销支持"
            ],
            "obligations": [
                "月度推荐目标",
                "协助新人培训",
                "维护合伙人关系"
            ]
        }
    }
    
    if tier not in tiers:
        raise ValueError(f"Unknown tier: {tier}. Available: {list(tiers.keys())}")
    
    tier_config = tiers[tier]
    agreement["tier_specific_terms"] = tier_config
    
    # Generate agreement text
    agreement_text = f"""
《{agreement['header']['document_title']}》

签约日期：{agreement['header']['date']}
版本：{agreement['header']['version']}

甲方：{agreement['parties']['party_a']}
乙方：{agreement['parties']['party_b']}

鉴于：
甲方是专注于时间价值生态建设的科技集团，致力于通过WEB3、AI和元宇宙技术，
将全球名人及大咖的碎片时间转化为标准化、可交易、可传承的数字价值资产。

乙方认同甲方的愿景和商业模式，愿意以{tier_config['tier_name']}身份参与
TimeRedeem时间价值生态建设。

一、合作层级
乙方确认为：{tier_config['tier_name']}
生态份额：{tier_config['ecosystem_share']}

二、乙方权益
{tier_config['benefits']}

三、乙方义务
{tier_config['obligations']}

四、共识节点推荐机制
乙方享有推荐新合伙人加入的权利，推荐奖励按以下比例分配：
- 直接推荐：奖励的 20%
- 二级推荐：奖励的 10% 
- 三级推荐：奖励的 5%

五、保密条款
双方对合作过程中知悉的商业秘密负有保密义务。

六、争议解决
因本协议引起的争议，双方协商解决；协商不成的，提交甲方所在地人民法院诉讼解决。

七、其他
1. 本协议自双方签字盖章之日起生效
2. 本协议一式两份，甲乙双方各执一份
3. 未尽事宜，双方另行协商补充

甲方（盖章）：点时成金科技集团    乙方（签字）：{partner_name}
日期：{agreement['header']['date']}                日期：{agreement['header']['date']}
"""
    
    agreement["full_text"] = agreement_text
    
    return agreement

def main():
    parser = argparse.ArgumentParser(description='Generate TimeRedeem Partnership Agreement')
    parser.add_argument('--tier', required=True, 
                        choices=['time-opener', 'consensus-node', 'referral-node'],
                        help='Partner tier')
    parser.add_argument('--partner-name', required=True,
                        help='Partner name')
    parser.add_argument('--output', default='partnership_agreement.txt',
                        help='Output file path')
    parser.add_argument('--json', action='store_true',
                        help='Output as JSON')
    
    args = parser.parse_args()
    
    try:
        agreement = generate_agreement(args.tier, args.partner_name)
        
        if args.json:
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(agreement, f, ensure_ascii=False, indent=2)
        else:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(agreement['full_text'])
        
        print(f"✓ Agreement generated: {args.output}")
        print(f"  Tier: {agreement['tier_specific_terms']['tier_name']}")
        print(f"  Partner: {args.partner_name}")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())
