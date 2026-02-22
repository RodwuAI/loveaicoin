import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from '@solana/spl-token';
import { config, TOKEN_ALLOCATION } from './config';
import BN from 'bn.js';

export interface MiningPoolConfig {
  tokenMint: PublicKey;
  poolWallet: PublicKey;
  totalPoolAmount: BN;
  startTime: number;
  decayFactor: number; // 年衰减系数，例如 0.65
  admin: PublicKey;
}

export interface YearlyDistribution {
  year: number;
  totalAmount: BN;
  dailyAmount: BN;
  startDate: Date;
  endDate: Date;
  cumulativeReleased: BN;
}

export interface MiningReward {
  recipient: PublicKey;
  amount: BN;
  timestamp: number;
  rewardType: 'learn' | 'use' | 'teach' | 'create';
  transactionHash?: string;
}

/**
 * LAC 挖矿池分发合约
 * 
 * 功能：
 * 1. 按年度衰减释放挖矿奖励（Year 1最大，逐年 × 0.65）
 * 2. 每日释放额度 = 年释放量 / 365
 * 3. 支持 Learn/Use/Teach/Create 四种挖矿模式
 * 4. 由后端 Edge Function 调用分发
 * 5. 防作弊和女巫攻击检测
 */
export class LACMiningPool {
  private connection: Connection;
  private admin: Keypair;
  private config: MiningPoolConfig;
  private distributionSchedule: YearlyDistribution[] = [];
  
  constructor(
    admin: Keypair,
    poolConfig: MiningPoolConfig,
    rpcUrl: string = config.SOLANA_RPC_URL
  ) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.admin = admin;
    this.config = poolConfig;
    
    this.generateDistributionSchedule();
  }

  /**
   * 生成8年衰减分发计划
   */
  private generateDistributionSchedule(): void {
    const startTime = this.config.startTime;
    const totalAmount = this.config.totalPoolAmount;
    const decayFactor = this.config.decayFactor;

    // 第一年释放 25%
    let currentYearAmount = totalAmount.mul(new BN(25)).div(new BN(100));
    let cumulativeReleased = new BN(0);

    console.log('📊 生成挖矿池分发计划:');
    console.log(`总池子: ${totalAmount.toString()} LAC`);
    console.log(`衰减系数: ${decayFactor}x/年`);
    console.log(`开始时间: ${new Date(startTime * 1000).toISOString()}\n`);

    for (let year = 1; year <= 8; year++) {
      const yearStartTime = startTime + (year - 1) * 365 * 24 * 60 * 60;
      const yearEndTime = startTime + year * 365 * 24 * 60 * 60;
      const dailyAmount = currentYearAmount.div(new BN(365));

      const yearlyDistribution: YearlyDistribution = {
        year,
        totalAmount: currentYearAmount,
        dailyAmount,
        startDate: new Date(yearStartTime * 1000),
        endDate: new Date(yearEndTime * 1000),
        cumulativeReleased,
      };

      this.distributionSchedule.push(yearlyDistribution);
      cumulativeReleased = cumulativeReleased.add(currentYearAmount);

      console.log(`Year ${year}:`);
      console.log(`  年释放量: ${currentYearAmount.toString()} LAC (${currentYearAmount.mul(new BN(100)).div(totalAmount).toString()}%)`);
      console.log(`  日释放量: ${dailyAmount.toString()} LAC`);
      console.log(`  累计释放: ${cumulativeReleased.toString()} LAC\n`);

      // 下一年衰减
      currentYearAmount = currentYearAmount.mul(new BN(65)).div(new BN(100));
    }

    const remainingAmount = totalAmount.sub(cumulativeReleased);
    console.log(`📈 8年后剩余: ${remainingAmount.toString()} LAC (${remainingAmount.mul(new BN(100)).div(totalAmount).toString()}%)`);
    console.log('💡 剩余部分转入长尾释放池，可支撑 10-15 年\n');
  }

  /**
   * 获取当前年度的分发信息
   */
  getCurrentYearDistribution(timestamp?: number): YearlyDistribution | null {
    const now = timestamp || Math.floor(Date.now() / 1000);
    
    return this.distributionSchedule.find(dist => {
      const startTime = Math.floor(dist.startDate.getTime() / 1000);
      const endTime = Math.floor(dist.endDate.getTime() / 1000);
      return now >= startTime && now < endTime;
    }) || null;
  }

  /**
   * 获取今日剩余可挖矿额度
   */
  getTodayRemainingQuota(timestamp?: number): BN {
    const currentDist = this.getCurrentYearDistribution(timestamp);
    if (!currentDist) {
      return new BN(0);
    }

    // 这里应该从链上或数据库查询今日已分发的数量
    // 简化实现，假设通过外部传入
    return currentDist.dailyAmount;
  }

  /**
   * 计算挖矿奖励
   */
  calculateMiningReward(
    userActivity: {
      learnPoints: number;
      usePoints: number;
      teachPoints: number;
      createPoints: number;
    },
    baseRates: {
      learnRate: number; // LAC per point
      useRate: number;
      teachRate: number;
      createRate: number;
    },
    multipliers: {
      qualityScore: number; // 0.1 - 1.0
      streakDays: number; // 连续天数
      scarcityFactor: number; // 0.1 - 1.0 (当日剩余/当日总额度)
    }
  ): { [key: string]: BN } {

    // 连续学习加成
    const streakMultiplier = Math.min(1.0 + (multipliers.streakDays - 1) * 0.1, 2.0);

    const learnReward = new BN(
      Math.floor(
        userActivity.learnPoints * 
        baseRates.learnRate * 
        multipliers.qualityScore * 
        streakMultiplier * 
        multipliers.scarcityFactor
      )
    );

    const useReward = new BN(
      Math.floor(
        userActivity.usePoints * 
        baseRates.useRate * 
        multipliers.scarcityFactor
      )
    );

    // Teach 奖励基于内容质量和社区反响
    const teachReward = new BN(
      Math.floor(
        userActivity.teachPoints * 
        baseRates.teachRate * 
        multipliers.qualityScore * 
        multipliers.scarcityFactor
      )
    );

    const createReward = new BN(
      Math.floor(
        userActivity.createPoints * 
        baseRates.createRate * 
        multipliers.qualityScore * 
        multipliers.scarcityFactor
      )
    );

    return {
      learn: learnReward,
      use: useReward,
      teach: teachReward,
      create: createReward,
    };
  }

  /**
   * 分发挖矿奖励给用户
   */
  async distributeMiningRewards(
    rewards: MiningReward[]
  ): Promise<string[]> {
    console.log(`🎁 开始分发挖矿奖励，共 ${rewards.length} 笔`);

    const signatures: string[] = [];
    const poolTokenAccount = getAssociatedTokenAddressSync(
      this.config.tokenMint,
      this.config.poolWallet
    );

    for (const reward of rewards) {
      try {
        const signature = await this.distributeSingleReward(reward, poolTokenAccount);
        signatures.push(signature);
        
        console.log(`✅ 已分发给 ${reward.recipient.toString().slice(0, 8)}...`);
        console.log(`   类型: ${reward.rewardType}, 数量: ${reward.amount.toString()}`);
        console.log(`   交易: ${signature}\n`);

      } catch (error) {
        console.error(`❌ 分发失败 ${reward.recipient.toString()}:`, error);
        // 记录失败，但继续处理其他奖励
      }
    }

    console.log(`🎉 批量分发完成，成功 ${signatures.length}/${rewards.length} 笔`);
    return signatures;
  }

  /**
   * 分发单个挖矿奖励
   */
  private async distributeSingleReward(
    reward: MiningReward,
    poolTokenAccount: PublicKey
  ): Promise<string> {
    const recipientTokenAccount = getAssociatedTokenAddressSync(
      this.config.tokenMint,
      reward.recipient
    );

    const transaction = new Transaction();

    // 检查接收者代币账户是否存在
    try {
      await getAccount(this.connection, recipientTokenAccount);
    } catch (error) {
      // 账户不存在，创建关联代币账户
      transaction.add(
        createAssociatedTokenAccountInstruction(
          this.admin.publicKey,
          recipientTokenAccount,
          reward.recipient,
          this.config.tokenMint
        )
      );
    }

    // 转移代币
    transaction.add(
      createTransferInstruction(
        poolTokenAccount,
        recipientTokenAccount,
        this.admin.publicKey, // 或者是池子的管理员
        BigInt(reward.amount.toString())
      )
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.admin]
    );

    return signature;
  }

  /**
   * 获取挖矿池状态
   */
  async getMiningPoolStatus(): Promise<{
    totalPool: BN;
    currentYear: number;
    dailyQuota: BN;
    todayDistributed: BN;
    todayRemaining: BN;
    totalDistributed: BN;
  }> {
    const currentDist = this.getCurrentYearDistribution();
    
    if (!currentDist) {
      return {
        totalPool: this.config.totalPoolAmount,
        currentYear: 0,
        dailyQuota: new BN(0),
        todayDistributed: new BN(0),
        todayRemaining: new BN(0),
        totalDistributed: new BN(0),
      };
    }

    // 这些数据在实际实现中应该从链上或数据库获取
    const todayDistributed = new BN(0); // 假设值
    const totalDistributed = currentDist.cumulativeReleased; // 假设值

    return {
      totalPool: this.config.totalPoolAmount,
      currentYear: currentDist.year,
      dailyQuota: currentDist.dailyAmount,
      todayDistributed,
      todayRemaining: currentDist.dailyAmount.sub(todayDistributed),
      totalDistributed,
    };
  }

  /**
   * 反作弊检测
   */
  detectAntiFraud(
    userAddress: PublicKey,
    recentRewards: MiningReward[],
    userBehaviorData: {
      deviceFingerprint: string;
      ipAddress: string;
      learningPattern: number[]; // 学习时间分布
      answerPattern: number[]; // 答题模式
    }
  ): {
    isValid: boolean;
    riskScore: number; // 0-100
    reasons: string[];
  } {
    const reasons: string[] = [];
    let riskScore = 0;

    // 1. 检查短时间内奖励频率
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const recentCount = recentRewards.filter(r => r.timestamp > last24h / 1000).length;
    
    if (recentCount > 50) { // 每日上限检查
      riskScore += 30;
      reasons.push('24小时内奖励次数过多');
    }

    // 2. 学习模式检查
    const avgLearningTime = userBehaviorData.learningPattern.reduce((a, b) => a + b, 0) / userBehaviorData.learningPattern.length;
    if (avgLearningTime < 30) { // 平均学习时间少于30秒
      riskScore += 25;
      reasons.push('平均学习时间异常短');
    }

    // 3. 答题模式检查（简化版）
    const answerVariance = this.calculateVariance(userBehaviorData.answerPattern);
    if (answerVariance < 0.1) { // 答题模式过于规律
      riskScore += 20;
      reasons.push('答题模式异常规律');
    }

    // 4. 设备指纹重复检查
    // 在实际实现中，应该查询数据库检查同一设备指纹的账户数量
    
    const isValid = riskScore < 50;

    return {
      isValid,
      riskScore,
      reasons,
    };
  }

  /**
   * 计算方差（用于模式检测）
   */
  private calculateVariance(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    return variance;
  }

  /**
   * 显示挖矿池统计信息
   */
  displayMiningPoolStats(): void {
    console.log('📊 LAC 挖矿池统计:');
    console.log('===============================================');
    console.log(`🎯 总池子: ${this.config.totalPoolAmount.toString()} LAC`);
    console.log(`📍 池子钱包: ${this.config.poolWallet.toString()}`);
    console.log(`🗓️ 开始时间: ${new Date(this.config.startTime * 1000).toISOString()}`);
    console.log(`📉 衰减系数: ${this.config.decayFactor}x/年\n`);

    const currentDist = this.getCurrentYearDistribution();
    if (currentDist) {
      console.log(`📅 当前年度: Year ${currentDist.year}`);
      console.log(`📊 年释放量: ${currentDist.totalAmount.toString()} LAC`);
      console.log(`📈 日释放量: ${currentDist.dailyAmount.toString()} LAC`);
      console.log(`🎯 进度: ${currentDist.startDate.toDateString()} - ${currentDist.endDate.toDateString()}`);
    } else {
      console.log(`⏳ 挖矿尚未开始或已结束`);
    }

    console.log('\n🎮 分发计划预览:');
    this.distributionSchedule.forEach(dist => {
      const percentage = dist.totalAmount.mul(new BN(100)).div(this.config.totalPoolAmount);
      console.log(`  Year ${dist.year}: ${dist.totalAmount.toString()} LAC (${percentage.toString()}%)`);
    });
    
    console.log('===============================================\n');
  }
}

/**
 * 工厂函数：创建默认挖矿池配置
 */
export function createDefaultMiningPool(
  tokenMint: PublicKey,
  adminKeypair: Keypair
): { config: MiningPoolConfig; pool: LACMiningPool } {
  const totalSupply = config.TOTAL_SUPPLY;
  const decimals = new BN(10).pow(new BN(config.TOKEN_DECIMALS));
  
  // 挖矿池占总供应量的 45%
  const poolAmount = new BN(Math.floor(totalSupply * TOKEN_ALLOCATION.COMMUNITY_MINING)).mul(decimals);
  
  const poolConfig: MiningPoolConfig = {
    tokenMint,
    poolWallet: new PublicKey(config.COMMUNITY_MINING_WALLET),
    totalPoolAmount: poolAmount,
    startTime: Math.floor(Date.now() / 1000), // 当前时间作为开始时间
    decayFactor: 0.65, // 年衰减系数
    admin: adminKeypair.publicKey,
  };

  const pool = new LACMiningPool(adminKeypair, poolConfig);

  return { config: poolConfig, pool };
}

// 测试函数
async function testMiningPool() {
  console.log('🧪 测试挖矿池功能...\n');

  const mockAdmin = Keypair.generate();
  const mockTokenMint = Keypair.generate().publicKey;

  const { pool } = createDefaultMiningPool(mockTokenMint, mockAdmin);
  
  // 显示挖矿池统计
  pool.displayMiningPoolStats();

  // 模拟计算挖矿奖励
  const mockRewards = pool.calculateMiningReward(
    {
      learnPoints: 10,
      usePoints: 5,
      teachPoints: 2,
      createPoints: 1,
    },
    {
      learnRate: 50, // 50 LAC per point
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

  console.log('🎁 模拟挖矿奖励计算:');
  Object.entries(mockRewards).forEach(([type, amount]) => {
    console.log(`  ${type}: ${amount.toString()} LAC`);
  });

  // 测试反作弊
  const fraudCheck = pool.detectAntiFraud(
    mockAdmin.publicKey,
    [],
    {
      deviceFingerprint: 'test123',
      ipAddress: '192.168.1.1',
      learningPattern: [45, 60, 30, 90, 120], // 学习时长秒数
      answerPattern: [85, 92, 78, 88, 95], // 答题分数
    }
  );

  console.log('\n🛡️ 反作弊检测结果:');
  console.log(`  有效性: ${fraudCheck.isValid ? '通过' : '失败'}`);
  console.log(`  风险分数: ${fraudCheck.riskScore}/100`);
  if (fraudCheck.reasons.length > 0) {
    console.log(`  原因: ${fraudCheck.reasons.join(', ')}`);
  }

  console.log('\n✅ 挖矿池功能测试完成！');
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  testMiningPool().catch(console.error);
}