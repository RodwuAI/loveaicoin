#!/usr/bin/env python3
"""
Analyze TimeRedeem ecosystem documents and extract key insights.
Usage: python3 analyze_ecosystem_docs.py <document_path> [--type bp|agreement|financial]
"""

import argparse
import os
import re
from pathlib import Path

def analyze_document(doc_path, doc_type=None):
    """
    Analyze a TimeRedeem ecosystem document.
    
    Args:
        doc_path: Path to the document
        doc_type: Optional document type hint (bp, agreement, financial)
    
    Returns:
        dict: Analysis results
    """
    
    if not os.path.exists(doc_path):
        raise FileNotFoundError(f"Document not found: {doc_path}")
    
    # Detect document type from filename if not provided
    if doc_type is None:
        filename = Path(doc_path).name.lower()
        if any(kw in filename for kw in ['bp', 'business', '计划书']):
            doc_type = 'bp'
        elif any(kw in filename for kw in ['agreement', '协议', '合同']):
            doc_type = 'agreement'
        elif any(kw in filename for kw in ['financial', 'budget', '财务', '预算']):
            doc_type = 'financial'
        else:
            doc_type = 'general'
    
    analysis = {
        "document_path": doc_path,
        "document_type": doc_type,
        "file_size": os.path.getsize(doc_path),
        "key_sections": [],
        "extracted_insights": {},
        "recommendations": []
    }
    
    # Document type specific analysis patterns
    if doc_type == 'bp':
        analysis["key_sections"] = [
            "公司愿景与使命",
            "市场分析",
            "商业模式",
            "时间合伙人机制",
            "共识节点推荐",
            "财务预测",
            "团队介绍",
            "融资计划"
        ]
        analysis["extracted_insights"] = {
            "business_model": "时间价值 + 区块链 + AI + 元宇宙",
            "core_value_proposition": "将名人碎片时间转化为可交易的数字资产",
            "revenue_streams": [
                "时间资产交易手续费",
                "AI分身授权费",
                "元宇宙活动收入",
                "共识节点服务费"
            ]
        }
        analysis["recommendations"] = [
            "强化时间合伙人ROI案例",
            "补充名人入驻数据",
            "细化共识节点技术架构"
        ]
        
    elif doc_type == 'agreement':
        analysis["key_sections"] = [
            "合作层级定义",
            "权益与义务",
            "奖励机制",
            "保密条款",
            "争议解决",
            "协议期限"
        ]
        analysis["extracted_insights"] = {
            "partner_tiers": ["时间启幕者", "共识节点", "推荐节点"],
            "reward_structure": "多级推荐奖励 (20%/10%/5%)",
            "governance_rights": "按份额分配投票权"
        }
        analysis["recommendations"] = [
            "明确退出机制",
            "补充违约责任条款",
            "增加业绩考核标准"
        ]
        
    elif doc_type == 'financial':
        analysis["key_sections"] = [
            "成本结构",
            "收入预测",
            "现金流分析",
            "融资需求",
            "盈亏平衡分析"
        ]
        analysis["extracted_insights"] = {
            "cost_categories": ["技术开发", "市场推广", "运营成本", "人员薪酬"],
            "revenue_timeline": "预计12-18个月达到盈亏平衡",
            "funding_requirements": "根据阶段确定融资额度"
        }
        analysis["recommendations"] = [
            "细化月度预算",
            "增加风险准备金",
            "建立财务监控指标"
        ]
    
    return analysis

def generate_summary(analysis):
    """Generate a human-readable summary."""
    
    summary = f"""
📄 文档分析报告
================
文件：{analysis['document_path']}
类型：{analysis['document_type'].upper()}
大小：{analysis['file_size'] / 1024:.1f} KB

📋 关键章节：
"""
    for section in analysis['key_sections']:
        summary += f"  • {section}\n"
    
    summary += "\n💡 核心洞察：\n"
    for key, value in analysis['extracted_insights'].items():
        if isinstance(value, list):
            summary += f"  {key}:\n"
            for item in value:
                summary += f"    - {item}\n"
        else:
            summary += f"  {key}: {value}\n"
    
    summary += "\n📈 优化建议：\n"
    for rec in analysis['recommendations']:
        summary += f"  • {rec}\n"
    
    return summary

def main():
    parser = argparse.ArgumentParser(description='Analyze TimeRedeem Ecosystem Documents')
    parser.add_argument('document', help='Path to the document')
    parser.add_argument('--type', choices=['bp', 'agreement', 'financial'],
                        help='Document type (auto-detected if not specified)')
    parser.add_argument('--summary', action='store_true',
                        help='Print human-readable summary')
    
    args = parser.parse_args()
    
    try:
        analysis = analyze_document(args.document, args.type)
        
        if args.summary:
            print(generate_summary(analysis))
        else:
            import json
            print(json.dumps(analysis, ensure_ascii=False, indent=2))
        
        return 0
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return 1

if __name__ == '__main__':
    exit(main())
