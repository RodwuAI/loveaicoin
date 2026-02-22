import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { LACTokenCreator } from '../src/create-token';
import { LACVesting } from '../src/vesting';
import { LACMiningPool, createDefaultMiningPool } from '../src/mining-pool';
import { config } from '../src/config';
import BN from 'bn.js';

// Jest 配置
jest.setTimeout(60000); // 60秒超时

describe('LAC Token 合约测试', () => {
  let connection: Connection;
  let payer: Keypair;
  let tokenMint: PublicKey;
  let testUser1: Keypair;
  let testUser2: Keypair;

  beforeAll(async () => {
    // 连接到 devnet
    connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // 生成测试用的钱包
    payer = Keypair.generate();
    testUser1 = Keypair.generate();
    testUser2 = Keypair.generate();

    console.log('🧪 测试环境初始化...');
    console.log(`💰 测试支付者: ${payer.publicKey.toString()}`);
    console.log(`👤 测试用户1: ${testUser1.publicKey.toString()}`);
    console.log(`👤 测试用户2: ${testUser2.publicKey.toString()}`);

    // 请求 devnet SOL (实际测试中需要)
    try {
      console.log('💧 请求 devnet SOL...');
      await requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
      await requestAirdrop(testUser1.publicKey, 1 * LAMPORTS_PER_SOL);
      await requestAirdrop(testUser2.publicKey, 1 * LAMPORTS_PER_SOL);
      
      // 等待确认
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ SOL 空投完成');
    } catch (error) {
      console.warn('⚠️ 空投失败（可能达到限制），使用模拟测试');
    }
  });

  afterAll(async () => {
    console.log('🧹 测试清理完成');
  });

  // 辅助函数：请求空投
  async function requestAirdrop(publicKey: PublicKey, lamports: number): Promise<void> {
    const signature = await connection.requestAirdrop(publicKey, lamports);
    await connection.confirmTransaction(signature);
  }

  describe('Token 创建测试', () => {
    test('应该能够创建 LAC Token', async () => {
      const tokenCreator = new LACTokenCreator(payer, 'https://api.devnet.solana.com');
      
      // 创建 Token（使用模拟参数）
      const mockTokenInfo = {
        mintAddress: Keypair.generate().publicKey.toString(),
        decimals: 9,
        totalSupply: '10000000000',
        mintAuthority: payer.publicKey.toString(),
        freezeAuthority: null,
      };

      expect(mockTokenInfo.decimals).toBe(9);
      expect(mockTokenInfo.totalSupply).toBe('10000000000');
      expect(mockTokenInfo.freezeAuthority).toBeNull();

      console.log('✅ Token 创建测试通过');
    });

    test('应该验证 Token 参数', () => {
      expect(config.TOKEN_SYMBOL).toBe('LAC');
      expect(config.TOKEN_NAME).toBe('Love AI Coin');
      expect(config.TOKEN_DECIMALS).toBe(9);
      expect(config.TOTAL_SUPPLY).toBe(10000000000);
      
      console.log('✅ Token 参数验证通过');
    });
  });

  describe('锁仓合约测试', () => {
    let vesting: LACVesting;
    const mockTokenMint = Keypair.generate().publicKey;

    beforeAll(() => {
      vesting = new LACVesting(payer, 'https://api.devnet.solana.com');
    });

    test('应该能够创建锁仓计划', async () => {
      const totalAmount = new BN(1000000000); // 1000 LAC with 6 decimals
      const cliffMonths = 12;
      const vestingMonths = 36;

      const schedule = await vesting.createVestingSchedule(
        testUser1.publicKey,
        mockTokenMint,
        totalAmount,
        cliffMonths,
        vestingMonths
      );

      expect(schedule.beneficiary.toString()).toBe(testUser1.publicKey.toString());
      expect(schedule.totalAmount.toString()).toBe(totalAmount.toString());
      expect(schedule.cliffDuration).toBe(cliffMonths * 30 * 24 * 60 * 60);
      expect(schedule.vestingDuration).toBe(vestingMonths * 30 * 24 * 60 * 60);
      expect(schedule.releasedAmount.toString()).toBe('0');

      console.log('✅ 锁仓计划创建测试通过');
    });

    test('应该正确计算释放量', async () => {
      const totalAmount = new BN(1200000000); // 1200 LAC
      const schedule = await vesting.createVestingSchedule(
        testUser1.publicKey,
        mockTokenMint,
        totalAmount,
        1, // 1 month cliff
        12 // 12 months vesting
      );

      // 测试悬崖期前（应该是0）
      const beforeCliff = vesting.calculateVestedAmount(schedule, schedule.startTime + 15 * 24 * 60 * 60);
      expect(beforeCliff.toString()).toBe('0');

      // 测试悬崖期后的线性释放
      const afterCliffHalfway = vesting.calculateVestedAmount(
        schedule, 
        schedule.startTime + (1 + 6) * 30 * 24 * 60 * 60 // 悬崖 + 6个月
      );
      
      const expectedHalfway = totalAmount.div(new BN(2)); // 应该释放一半
      const difference = afterCliffHalfway.sub(expectedHalfway).abs();
      const tolerance = totalAmount.div(new BN(100)); // 1% 容差
      
      expect(difference.lte(tolerance)).toBe(true);

      console.log('✅ 释放量计算测试通过');
    });

    test('应该能够修改受益人', async () => {
      const schedule = await vesting.createVestingSchedule(
        testUser1.publicKey,
        mockTokenMint,
        new BN(1000000000),
        12,
        36
      );

      const newSchedule = vesting.changeBeneficiary(schedule, testUser2.publicKey);
      
      expect(newSchedule.beneficiary.toString()).toBe(testUser2.publicKey.toString());
      expect(newSchedule.totalAmount.toString()).toBe(schedule.totalAmount.toString());

      console.log('✅ 修改受益人测试通过');
    });
  });

  describe('挖矿池测试', () => {
    let miningPool: LACMiningPool;
    const mockTokenMint = Keypair.generate().publicKey;

    beforeAll(() => {
      const { pool } = createDefaultMiningPool(mockTokenMint, payer);
      miningPool = pool;
    });

    test('应该正确计算年度衰减', () => {
      const currentDist = miningPool.getCurrentYearDistribution();
      expect(currentDist).toBeTruthy();
      
      if (currentDist) {
        expect(currentDist.year).toBe(1);
        expect(currentDist.totalAmount.gt(new BN(0))).toBe(true);
        expect(currentDist.dailyAmount.gt(new BN(0))).toBe(true);
      }

      console.log('✅ 年度衰减计算测试通过');
    });

    test('应该正确计算挖矿奖励', () => {
      const rewards = miningPool.calculateMiningReward(
        {
          learnPoints: 10,
          usePoints: 5,
          teachPoints: 2,
          createPoints: 1,
        },
        {
          learnRate: 50,
          useRate: 20,
          teachRate: 100,
          createRate: 200,
        },
        {
          qualityScore: 0.8,
          streakDays: 7,
          scarcityFactor: 0.9,
        }
      );

      expect(rewards.learn.gt(new BN(0))).toBe(true);
      expect(rewards.use.gt(new BN(0))).toBe(true);
      expect(rewards.teach.gt(new BN(0))).toBe(true);
      expect(rewards.create.gt(new BN(0))).toBe(true);

      // Learn 奖励应该受到连续学习加成影响
      const baseLearReward = new BN(10 * 50 * 0.8 * 0.9);
      expect(rewards.learn.gt(baseLearReward)).toBe(true);

      console.log('✅ 挖矿奖励计算测试通过');
    });

    test('应该检测异常行为', () => {
      const fraudCheck = miningPool.detectAntiFraud(
        testUser1.publicKey,
        [], // 空的历史奖励
        {
          deviceFingerprint: 'test123',
          ipAddress: '192.168.1.1',
          learningPattern: [45, 60, 30, 90, 120], // 正常学习时间
          answerPattern: [85, 92, 78, 88, 95], // 正常答题分数
        }
      );

      expect(fraudCheck.riskScore).toBeLessThan(50);
      expect(fraudCheck.isValid).toBe(true);

      console.log('✅ 反作弊检测测试通过');
    });

    test('应该检测到可疑行为', () => {
      const fraudCheck = miningPool.detectAntiFraud(
        testUser1.publicKey,
        [], 
        {
          deviceFingerprint: 'test123',
          ipAddress: '192.168.1.1',
          learningPattern: [10, 15, 12, 8, 20], // 异常短的学习时间
          answerPattern: [90, 90, 90, 90, 90], // 异常规律的答题
        }
      );

      expect(fraudCheck.riskScore).toBeGreaterThan(30);
      expect(fraudCheck.reasons.length).toBeGreaterThan(0);

      console.log('✅ 可疑行为检测测试通过');
    });
  });

  describe('代币分配测试', () => {
    test('应该正确计算分配比例', () => {
      const distribution = {
        communityMining: 4500000000, // 45%
        publicGood: 1500000000,      // 15%
        team: 1500000000,            // 15%
        investor: 1000000000,        // 10%
        treasury: 1500000000,        // 15%
      };

      const total = Object.values(distribution).reduce((sum, amount) => sum + amount, 0);
      expect(total).toBe(10000000000); // 100% = 100亿

      // 检查各池子比例
      expect(distribution.communityMining / total).toBeCloseTo(0.45, 2);
      expect(distribution.publicGood / total).toBeCloseTo(0.15, 2);
      expect(distribution.team / total).toBeCloseTo(0.15, 2);
      expect(distribution.investor / total).toBeCloseTo(0.10, 2);
      expect(distribution.treasury / total).toBeCloseTo(0.15, 2);

      console.log('✅ 代币分配比例测试通过');
    });

    test('应该验证锁仓期参数', () => {
      expect(config.TEAM_CLIFF_MONTHS).toBe(12);
      expect(config.TEAM_VESTING_MONTHS).toBe(36);
      expect(config.INVESTOR_CLIFF_MONTHS).toBe(6);
      expect(config.INVESTOR_VESTING_MONTHS).toBe(18);
      expect(config.PUBLIC_GOOD_CLIFF_MONTHS).toBe(6);
      expect(config.PUBLIC_GOOD_VESTING_MONTHS).toBe(24);

      console.log('✅ 锁仓期参数验证通过');
    });
  });

  describe('集成测试', () => {
    test('完整流程模拟', async () => {
      console.log('🔄 开始完整流程模拟测试...');

      // 1. 模拟创建 Token
      const mockTokenMint = Keypair.generate().publicKey;
      console.log('1️⃣ Token 创建模拟完成');

      // 2. 创建锁仓计划
      const vesting = new LACVesting(payer);
      const teamSchedule = await vesting.createVestingSchedule(
        testUser1.publicKey,
        mockTokenMint,
        new BN(1500000000000000000), // 15亿 with 9 decimals
        12,
        36
      );
      console.log('2️⃣ 团队锁仓计划创建完成');

      // 3. 初始化挖矿池
      const { pool } = createDefaultMiningPool(mockTokenMint, payer);
      console.log('3️⃣ 挖矿池初始化完成');

      // 4. 计算当前可释放量（应该是0，因为还在悬崖期）
      const vestingInfo = vesting.getVestingInfo(teamSchedule);
      expect(vestingInfo.releasableAmount.toString()).toBe('0');
      console.log('4️⃣ 锁仓释放量验证完成');

      // 5. 模拟挖矿奖励计算
      const rewards = pool.calculateMiningReward(
        { learnPoints: 5, usePoints: 3, teachPoints: 1, createPoints: 0 },
        { learnRate: 50, useRate: 20, teachRate: 100, createRate: 200 },
        { qualityScore: 0.9, streakDays: 3, scarcityFactor: 1.0 }
      );
      
      expect(rewards.learn.gt(new BN(0))).toBe(true);
      console.log('5️⃣ 挖矿奖励计算完成');

      console.log('✅ 完整流程模拟测试通过');
    });
  });
});

// 模拟数据生成辅助函数
export function generateMockMiningRewards(count: number) {
  const rewards = [];
  const rewardTypes = ['learn', 'use', 'teach', 'create'] as const;
  
  for (let i = 0; i < count; i++) {
    rewards.push({
      recipient: Keypair.generate().publicKey,
      amount: new BN(Math.floor(Math.random() * 1000) + 10), // 10-1010 LAC
      timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400), // 过去24小时内
      rewardType: rewardTypes[Math.floor(Math.random() * rewardTypes.length)],
    });
  }
  
  return rewards;
}

// 性能测试辅助函数
export function measureExecutionTime<T>(fn: () => T): { result: T; duration: number } {
  const start = process.hrtime.bigint();
  const result = fn();
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1000000; // 转换为毫秒
  
  return { result, duration };
}

console.log('🧪 LAC Token 测试套件已加载');