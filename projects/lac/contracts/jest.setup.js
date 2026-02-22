// Jest 全局设置
require('dotenv').config();

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.SOLANA_NETWORK = 'devnet';

// 全局测试工具
global.console = {
  ...console,
  // 在测试中静默某些日志
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// 测试超时设置
jest.setTimeout(60000);

console.log('🧪 Jest 测试环境已初始化');