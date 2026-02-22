import dotenv from 'dotenv';
import { PublicKey } from '@solana/web3.js';

// 加载环境变量
dotenv.config();

export interface Config {
  // Solana 网络配置
  SOLANA_NETWORK: 'devnet' | 'testnet' | 'mainnet-beta';
  SOLANA_RPC_URL: string;

  // Token 基本信息
  TOKEN_NAME: string;
  TOKEN_SYMBOL: string;
  TOKEN_DECIMALS: number;
  TOTAL_SUPPLY: number;

  // 钱包地址
  MULTISIG_WALLET: string;
  COMMUNITY_MINING_WALLET: string;
  PUBLIC_GOOD_WALLET: string;
  TEAM_WALLET: string;
  INVESTOR_WALLET: string;
  TREASURY_WALLET: string;

  // 锁仓配置
  TEAM_CLIFF_MONTHS: number;
  TEAM_VESTING_MONTHS: number;
  INVESTOR_CLIFF_MONTHS: number;
  INVESTOR_VESTING_MONTHS: number;
  PUBLIC_GOOD_CLIFF_MONTHS: number;
  PUBLIC_GOOD_VESTING_MONTHS: number;
}

// 代币分配比例（基于代币经济学V2）
export const TOKEN_ALLOCATION = {
  COMMUNITY_MINING: 0.45,        // 45% - 社区挖矿
  PUBLIC_GOOD: 0.15,            // 15% - 公益孵化
  TEAM: 0.15,                   // 15% - 团队
  INVESTOR: 0.10,               // 10% - 投资人
  TREASURY: 0.15,               // 15% - 金库
} as const;

// 验证分配比例总和为100%
const totalAllocation = Object.values(TOKEN_ALLOCATION).reduce((sum, ratio) => sum + ratio, 0);
if (Math.abs(totalAllocation - 1.0) > 0.001) {
  throw new Error(`Token allocation ratios must sum to 1.0, got ${totalAllocation}`);
}

// 默认配置
const defaultConfig: Config = {
  SOLANA_NETWORK: (process.env['SOLANA_NETWORK'] as any) || 'devnet',
  SOLANA_RPC_URL: process.env['SOLANA_RPC_URL'] || 'https://api.devnet.solana.com',

  TOKEN_NAME: process.env['TOKEN_NAME'] || 'Love AI Coin',
  TOKEN_SYMBOL: process.env['TOKEN_SYMBOL'] || 'LAC',
  TOKEN_DECIMALS: parseInt(process.env['TOKEN_DECIMALS'] || '9'),
  TOTAL_SUPPLY: parseInt(process.env['TOTAL_SUPPLY'] || '10000000000'), // 100亿

  // 钱包地址 - 默认使用占位符，实际部署时需要更新
  MULTISIG_WALLET: process.env['MULTISIG_WALLET'] || '11111111111111111111111111111112',
  COMMUNITY_MINING_WALLET: process.env['COMMUNITY_MINING_WALLET'] || '11111111111111111111111111111112',
  PUBLIC_GOOD_WALLET: process.env['PUBLIC_GOOD_WALLET'] || '11111111111111111111111111111112',
  TEAM_WALLET: process.env['TEAM_WALLET'] || '11111111111111111111111111111112',
  INVESTOR_WALLET: process.env['INVESTOR_WALLET'] || '11111111111111111111111111111112',
  TREASURY_WALLET: process.env['TREASURY_WALLET'] || '11111111111111111111111111111112',

  // 锁仓配置（月数）
  TEAM_CLIFF_MONTHS: parseInt(process.env['TEAM_CLIFF_MONTHS'] || '12'),
  TEAM_VESTING_MONTHS: parseInt(process.env['TEAM_VESTING_MONTHS'] || '36'),
  INVESTOR_CLIFF_MONTHS: parseInt(process.env['INVESTOR_CLIFF_MONTHS'] || '6'),
  INVESTOR_VESTING_MONTHS: parseInt(process.env['INVESTOR_VESTING_MONTHS'] || '18'),
  PUBLIC_GOOD_CLIFF_MONTHS: parseInt(process.env['PUBLIC_GOOD_CLIFF_MONTHS'] || '6'),
  PUBLIC_GOOD_VESTING_MONTHS: parseInt(process.env['PUBLIC_GOOD_VESTING_MONTHS'] || '24'),
};

// 验证配置
function validateConfig(config: Config): void {
  // 验证网络
  if (!['devnet', 'testnet', 'mainnet-beta'].includes(config.SOLANA_NETWORK)) {
    throw new Error(`Invalid Solana network: ${config.SOLANA_NETWORK}`);
  }

  // 验证 Token 参数
  if (config.TOKEN_DECIMALS < 0 || config.TOKEN_DECIMALS > 9) {
    throw new Error(`Token decimals must be between 0 and 9, got ${config.TOKEN_DECIMALS}`);
  }

  if (config.TOTAL_SUPPLY <= 0) {
    throw new Error(`Total supply must be positive, got ${config.TOTAL_SUPPLY}`);
  }

  // 验证钱包地址格式
  const walletFields = [
    'MULTISIG_WALLET',
    'COMMUNITY_MINING_WALLET',
    'PUBLIC_GOOD_WALLET',
    'TEAM_WALLET',
    'INVESTOR_WALLET',
    'TREASURY_WALLET',
  ] as const;

  for (const field of walletFields) {
    try {
      new PublicKey(config[field]);
    } catch (error) {
      throw new Error(`Invalid wallet address for ${field}: ${config[field]}`);
    }
  }

  // 验证锁仓参数
  const vestingFields = [
    'TEAM_CLIFF_MONTHS',
    'TEAM_VESTING_MONTHS',
    'INVESTOR_CLIFF_MONTHS',
    'INVESTOR_VESTING_MONTHS',
    'PUBLIC_GOOD_CLIFF_MONTHS',
    'PUBLIC_GOOD_VESTING_MONTHS',
  ] as const;

  for (const field of vestingFields) {
    if (config[field] < 0) {
      throw new Error(`${field} must be non-negative, got ${config[field]}`);
    }
  }
}

// 计算各池子的代币数量
export function calculateTokenDistribution(totalSupply: number) {
  return {
    communityMining: Math.floor(totalSupply * TOKEN_ALLOCATION.COMMUNITY_MINING),
    publicGood: Math.floor(totalSupply * TOKEN_ALLOCATION.PUBLIC_GOOD),
    team: Math.floor(totalSupply * TOKEN_ALLOCATION.TEAM),
    investor: Math.floor(totalSupply * TOKEN_ALLOCATION.INVESTOR),
    treasury: Math.floor(totalSupply * TOKEN_ALLOCATION.TREASURY),
  };
}

// 获取RPC URL（支持不同网络）
export function getRpcUrl(network: string): string {
  switch (network) {
    case 'devnet':
      return process.env['DEVNET_RPC_URL'] || 'https://api.devnet.solana.com';
    case 'testnet':
      return process.env['TESTNET_RPC_URL'] || 'https://api.testnet.solana.com';
    case 'mainnet-beta':
      return process.env['MAINNET_RPC_URL'] || 'https://api.mainnet-beta.solana.com';
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
}

// 验证并导出配置
validateConfig(defaultConfig);

export const config = defaultConfig;

// 辅助函数：显示配置信息
export function displayConfig(): void {
  console.log('📋 LAC Token 配置信息:');
  console.log('========================');
  console.log(`🌐 网络: ${config.SOLANA_NETWORK}`);
  console.log(`🔗 RPC URL: ${config.SOLANA_RPC_URL}`);
  console.log(`🪙 Token 名称: ${config.TOKEN_NAME} (${config.TOKEN_SYMBOL})`);
  console.log(`🔢 精度: ${config.TOKEN_DECIMALS} 位小数`);
  console.log(`📊 总供应量: ${config.TOTAL_SUPPLY.toLocaleString()}`);
  
  console.log('\n💰 代币分配:');
  const distribution = calculateTokenDistribution(config.TOTAL_SUPPLY);
  console.log(`  社区挖矿: ${distribution.communityMining.toLocaleString()} (${(TOKEN_ALLOCATION.COMMUNITY_MINING * 100).toFixed(1)}%)`);
  console.log(`  公益孵化: ${distribution.publicGood.toLocaleString()} (${(TOKEN_ALLOCATION.PUBLIC_GOOD * 100).toFixed(1)}%)`);
  console.log(`  团队: ${distribution.team.toLocaleString()} (${(TOKEN_ALLOCATION.TEAM * 100).toFixed(1)}%)`);
  console.log(`  投资人: ${distribution.investor.toLocaleString()} (${(TOKEN_ALLOCATION.INVESTOR * 100).toFixed(1)}%)`);
  console.log(`  金库: ${distribution.treasury.toLocaleString()} (${(TOKEN_ALLOCATION.TREASURY * 100).toFixed(1)}%)`);
  
  console.log('\n⏱️ 锁仓配置:');
  console.log(`  团队: ${config.TEAM_CLIFF_MONTHS}个月悬崖 + ${config.TEAM_VESTING_MONTHS}个月线性释放`);
  console.log(`  投资人: ${config.INVESTOR_CLIFF_MONTHS}个月悬崖 + ${config.INVESTOR_VESTING_MONTHS}个月线性释放`);
  console.log(`  公益孵化: ${config.PUBLIC_GOOD_CLIFF_MONTHS}个月悬崖 + ${config.PUBLIC_GOOD_VESTING_MONTHS}个月线性释放`);
  console.log('========================\n');
}