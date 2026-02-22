import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  AccountInfo,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from '@solana/spl-token';
import { config, calculateTokenDistribution } from './config';
import BN from 'bn.js';

export interface VestingSchedule {
  beneficiary: PublicKey;
  tokenMint: PublicKey;
  totalAmount: BN;
  startTime: number;
  cliffDuration: number; // 秒
  vestingDuration: number; // 秒
  releasedAmount: BN;
  revoked: boolean;
  admin: PublicKey;
}

export interface VestingInfo {
  schedule: VestingSchedule;
  releasableAmount: BN;
  vestedAmount: BN;
  nextUnlockTime: number;
}

/**
 * LAC Token 锁仓释放合约
 * 
 * 功能：
 * 1. 支持悬崖期（cliff）+ 线性释放
 * 2. 支持多个受益人
 * 3. 管理员可修改受益人（用于 DAO 治理）
 * 4. 查询功能：已释放量、待释放量、下次释放时间
 */
export class LACVesting {
  private connection: Connection;
  private admin: Keypair;
  
  constructor(admin: Keypair, rpcUrl: string = config.SOLANA_RPC_URL) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.admin = admin;
  }

  /**
   * 创建锁仓计划
   */
  async createVestingSchedule(
    beneficiary: PublicKey,
    tokenMint: PublicKey,
    totalAmount: BN,
    cliffMonths: number,
    vestingMonths: number
  ): Promise<VestingSchedule> {
    const now = Math.floor(Date.now() / 1000);
    const cliffDuration = cliffMonths * 30 * 24 * 60 * 60; // 转换为秒
    const vestingDuration = vestingMonths * 30 * 24 * 60 * 60;

    const schedule: VestingSchedule = {
      beneficiary,
      tokenMint,
      totalAmount,
      startTime: now,
      cliffDuration,
      vestingDuration,
      releasedAmount: new BN(0),
      revoked: false,
      admin: this.admin.publicKey,
    };

    console.log(`📅 锁仓计划创建:`);
    console.log(`  受益人: ${beneficiary.toString()}`);
    console.log(`  总金额: ${totalAmount.toString()}`);
    console.log(`  悬崖期: ${cliffMonths} 个月`);
    console.log(`  释放期: ${vestingMonths} 个月`);
    console.log(`  开始时间: ${new Date(now * 1000).toISOString()}`);

    return schedule;
  }

  /**
   * 计算已释放的代币数量（基于时间）
   */
  calculateVestedAmount(schedule: VestingSchedule, currentTime?: number): BN {
    const now = currentTime || Math.floor(Date.now() / 1000);
    
    // 如果还在悬崖期内，返回 0
    if (now < schedule.startTime + schedule.cliffDuration) {
      return new BN(0);
    }

    // 如果超过总释放期，返回全部金额
    if (now >= schedule.startTime + schedule.cliffDuration + schedule.vestingDuration) {
      return schedule.totalAmount;
    }

    // 线性释放计算
    const timeFromCliff = now - (schedule.startTime + schedule.cliffDuration);
    const vestedAmount = schedule.totalAmount
      .mul(new BN(timeFromCliff))
      .div(new BN(schedule.vestingDuration));

    return vestedAmount;
  }

  /**
   * 计算可释放的代币数量（已释放 - 已提取）
   */
  calculateReleasableAmount(schedule: VestingSchedule, currentTime?: number): BN {
    const vestedAmount = this.calculateVestedAmount(schedule, currentTime);
    return vestedAmount.sub(schedule.releasedAmount);
  }

  /**
   * 计算下次解锁时间
   */
  calculateNextUnlockTime(schedule: VestingSchedule, currentTime?: number): number {
    const now = currentTime || Math.floor(Date.now() / 1000);
    
    // 如果还在悬崖期
    if (now < schedule.startTime + schedule.cliffDuration) {
      return schedule.startTime + schedule.cliffDuration;
    }

    // 如果已经完全释放
    if (now >= schedule.startTime + schedule.cliffDuration + schedule.vestingDuration) {
      return 0; // 表示没有下次解锁
    }

    // 线性释放期间，每秒都在解锁
    return now + 1;
  }

  /**
   * 获取锁仓信息
   */
  getVestingInfo(schedule: VestingSchedule, currentTime?: number): VestingInfo {
    const vestedAmount = this.calculateVestedAmount(schedule, currentTime);
    const releasableAmount = this.calculateReleasableAmount(schedule, currentTime);
    const nextUnlockTime = this.calculateNextUnlockTime(schedule, currentTime);

    return {
      schedule,
      vestedAmount,
      releasableAmount,
      nextUnlockTime,
    };
  }

  /**
   * 释放代币给受益人
   */
  async releaseTokens(
    schedule: VestingSchedule,
    sourceTokenAccount: PublicKey,
    amount?: BN
  ): Promise<string> {
    const releasableAmount = this.calculateReleasableAmount(schedule);
    
    if (releasableAmount.isZero()) {
      throw new Error('当前没有可释放的代币');
    }

    const releaseAmount = amount && amount.lte(releasableAmount) ? amount : releasableAmount;

    console.log(`🔓 释放代币:`);
    console.log(`  受益人: ${schedule.beneficiary.toString()}`);
    console.log(`  释放数量: ${releaseAmount.toString()}`);

    // 获取受益人的关联代币账户
    const beneficiaryTokenAccount = getAssociatedTokenAddressSync(
      schedule.tokenMint,
      schedule.beneficiary
    );

    const transaction = new Transaction();

    // 检查受益人的代币账户是否存在，不存在则创建
    try {
      await getAccount(this.connection, beneficiaryTokenAccount);
    } catch (error) {
      console.log('🏗️ 创建受益人代币账户...');
      transaction.add(
        createAssociatedTokenAccountInstruction(
          this.admin.publicKey,
          beneficiaryTokenAccount,
          schedule.beneficiary,
          schedule.tokenMint
        )
      );
    }

    // 转移代币
    transaction.add(
      createTransferInstruction(
        sourceTokenAccount,
        beneficiaryTokenAccount,
        this.admin.publicKey,
        BigInt(releaseAmount.toString()),
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.admin]
    );

    // 更新释放记录
    schedule.releasedAmount = schedule.releasedAmount.add(releaseAmount);

    console.log(`✅ 代币释放成功！`);
    console.log(`🔗 交易签名: ${signature}`);
    console.log(`📊 已释放总计: ${schedule.releasedAmount.toString()}`);

    return signature;
  }

  /**
   * 修改受益人（仅管理员可用）
   */
  changeBeneficiary(
    schedule: VestingSchedule,
    newBeneficiary: PublicKey
  ): VestingSchedule {
    console.log(`👤 修改受益人:`);
    console.log(`  原受益人: ${schedule.beneficiary.toString()}`);
    console.log(`  新受益人: ${newBeneficiary.toString()}`);

    const newSchedule = { ...schedule };
    newSchedule.beneficiary = newBeneficiary;

    return newSchedule;
  }

  /**
   * 撤销锁仓计划（仅管理员可用，紧急情况）
   */
  revokeVesting(schedule: VestingSchedule): VestingSchedule {
    console.log(`⚠️ 撤销锁仓计划: ${schedule.beneficiary.toString()}`);
    
    const newSchedule = { ...schedule };
    newSchedule.revoked = true;

    return newSchedule;
  }

  /**
   * 批量创建锁仓计划（用于初始分配）
   */
  async createMultipleVestingSchedules(
    tokenMint: PublicKey,
    vestingPlans: Array<{
      beneficiary: PublicKey;
      amount: BN;
      cliffMonths: number;
      vestingMonths: number;
      name: string;
    }>
  ): Promise<VestingSchedule[]> {
    console.log(`📋 批量创建锁仓计划，共 ${vestingPlans.length} 个:`);

    const schedules: VestingSchedule[] = [];

    for (const plan of vestingPlans) {
      console.log(`\n🔒 创建 ${plan.name} 锁仓:`);
      
      const schedule = await this.createVestingSchedule(
        plan.beneficiary,
        tokenMint,
        plan.amount,
        plan.cliffMonths,
        plan.vestingMonths
      );

      schedules.push(schedule);
    }

    return schedules;
  }

  /**
   * 显示锁仓状态摘要
   */
  displayVestingStatus(vestingInfos: VestingInfo[]): void {
    console.log('\n📊 锁仓状态摘要:');
    console.log('====================================================');

    let totalLocked = new BN(0);
    let totalVested = new BN(0);
    let totalReleasable = new BN(0);

    vestingInfos.forEach((info, index) => {
      const { schedule, vestedAmount, releasableAmount } = info;
      
      totalLocked = totalLocked.add(schedule.totalAmount);
      totalVested = totalVested.add(vestedAmount);
      totalReleasable = totalReleasable.add(releasableAmount);

      const progressPercent = schedule.totalAmount.isZero() 
        ? 0 
        : vestedAmount.mul(new BN(100)).div(schedule.totalAmount).toNumber();

      console.log(`\n${index + 1}. 受益人: ${schedule.beneficiary.toString().slice(0, 8)}...`);
      console.log(`   总锁仓: ${schedule.totalAmount.toString()}`);
      console.log(`   已释放: ${vestedAmount.toString()} (${progressPercent.toFixed(1)}%)`);
      console.log(`   可提取: ${releasableAmount.toString()}`);
      console.log(`   状态: ${schedule.revoked ? '已撤销' : '正常'}`);

      if (info.nextUnlockTime > 0) {
        const nextUnlock = new Date(info.nextUnlockTime * 1000);
        console.log(`   下次解锁: ${nextUnlock.toLocaleString()}`);
      } else if (info.nextUnlockTime === 0) {
        console.log(`   下次解锁: 已完全解锁`);
      }
    });

    console.log(`\n📈 总计统计:`);
    console.log(`   总锁仓金额: ${totalLocked.toString()}`);
    console.log(`   已释放金额: ${totalVested.toString()}`);
    console.log(`   可提取金额: ${totalReleasable.toString()}`);
    console.log(`   释放进度: ${totalLocked.isZero() ? 0 : totalVested.mul(new BN(100)).div(totalLocked).toNumber().toFixed(1)}%`);
    console.log('====================================================\n');
  }
}

/**
 * 工厂函数：根据代币经济学创建默认锁仓计划
 */
export function createDefaultVestingPlans(tokenMint: PublicKey): Array<{
  beneficiary: PublicKey;
  amount: BN;
  cliffMonths: number;
  vestingMonths: number;
  name: string;
}> {
  const distribution = calculateTokenDistribution(config.TOTAL_SUPPLY);
  const decimals = new BN(10).pow(new BN(config.TOKEN_DECIMALS));

  return [
    {
      beneficiary: new PublicKey(config.TEAM_WALLET),
      amount: new BN(distribution.team).mul(decimals),
      cliffMonths: config.TEAM_CLIFF_MONTHS,
      vestingMonths: config.TEAM_VESTING_MONTHS,
      name: '团队锁仓',
    },
    {
      beneficiary: new PublicKey(config.INVESTOR_WALLET),
      amount: new BN(distribution.investor).mul(decimals),
      cliffMonths: config.INVESTOR_CLIFF_MONTHS,
      vestingMonths: config.INVESTOR_VESTING_MONTHS,
      name: '投资人锁仓',
    },
    {
      beneficiary: new PublicKey(config.PUBLIC_GOOD_WALLET),
      amount: new BN(distribution.publicGood).mul(decimals),
      cliffMonths: config.PUBLIC_GOOD_CLIFF_MONTHS,
      vestingMonths: config.PUBLIC_GOOD_VESTING_MONTHS,
      name: '公益孵化锁仓',
    },
  ];
}

// 测试函数
export async function testVesting() {
  console.log('🧪 测试锁仓功能...\n');

  const mockAdmin = Keypair.generate();
  const mockBeneficiary = Keypair.generate();
  const mockTokenMint = Keypair.generate().publicKey;

  const vesting = new LACVesting(mockAdmin);

  // 创建测试锁仓计划：1000个代币，1个月悬崖，12个月线性释放
  const schedule = await vesting.createVestingSchedule(
    mockBeneficiary.publicKey,
    mockTokenMint,
    new BN(1000000000), // 1000 tokens with 6 decimals
    1, // 1 month cliff
    12 // 12 months vesting
  );

  // 测试不同时间点的释放量
  const testTimes = [
    0, // 开始时
    15 * 24 * 60 * 60, // 15天后（悬崖期内）
    35 * 24 * 60 * 60, // 35天后（悬崖期结束，开始释放）
    6 * 30 * 24 * 60 * 60, // 6个月后
    13 * 30 * 24 * 60 * 60, // 13个月后（完全释放）
  ];

  testTimes.forEach((timeOffset, index) => {
    const testTime = schedule.startTime + timeOffset;
    const info = vesting.getVestingInfo(schedule, testTime);
    
    console.log(`\n⏰ 时间点 ${index + 1}: ${new Date(testTime * 1000).toISOString()}`);
    console.log(`   已释放: ${info.vestedAmount.toString()}`);
    console.log(`   可提取: ${info.releasableAmount.toString()}`);
    if (info.nextUnlockTime > 0) {
      console.log(`   下次解锁: ${new Date(info.nextUnlockTime * 1000).toISOString()}`);
    } else {
      console.log(`   下次解锁: 已完全解锁`);
    }
  });

  console.log('\n✅ 锁仓功能测试完成！');
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  testVesting().catch(console.error);
}