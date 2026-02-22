import { Keypair, PublicKey } from '@solana/web3.js';
import { LACVesting } from './vesting';
import { createDefaultMiningPool } from './mining-pool';
import { config, displayConfig } from './config';
import BN from 'bn.js';

/**
 * LAC 合约功能演示
 */
async function demo() {
  console.log('🎯 LAC (Love AI Coin) 智能合约演示');
  console.log('=====================================\n');

  // 显示配置
  displayConfig();

  // 生成演示用的模拟数据
  const mockAdmin = Keypair.generate();
  const mockUser1 = Keypair.generate();
  const mockUser2 = Keypair.generate();
  const mockTokenMint = Keypair.generate().publicKey;

  console.log('🔑 演示用地址:');
  console.log(`管理员: ${mockAdmin.publicKey.toString()}`);
  console.log(`用户1: ${mockUser1.publicKey.toString()}`);
  console.log(`用户2: ${mockUser2.publicKey.toString()}`);
  console.log(`Token Mint: ${mockTokenMint.toString()}\n`);

  // 1. 演示锁仓功能
  console.log('🔒 1. 锁仓合约演示');
  console.log('========================');
  
  const vesting = new LACVesting(mockAdmin);
  
  // 创建团队锁仓计划
  const teamSchedule = await vesting.createVestingSchedule(
    mockUser1.publicKey,
    mockTokenMint,
    new BN('1500000000000000000'), // 15亿 LAC (9位精度)
    12, // 12个月悬崖
    36  // 36个月线性释放
  );

  // 创建投资人锁仓计划  
  const investorSchedule = await vesting.createVestingSchedule(
    mockUser2.publicKey,
    mockTokenMint,
    new BN('1000000000000000000'), // 10亿 LAC
    6,  // 6个月悬崖
    18  // 18个月线性释放
  );

  // 显示锁仓状态
  const vestingInfos = [
    vesting.getVestingInfo(teamSchedule),
    vesting.getVestingInfo(investorSchedule)
  ];
  
  vesting.displayVestingStatus(vestingInfos);

  // 2. 演示挖矿池功能
  console.log('⛏️ 2. 挖矿池演示');
  console.log('========================');
  
  const { pool } = createDefaultMiningPool(mockTokenMint, mockAdmin);
  pool.displayMiningPoolStats();

  // 演示挖矿奖励计算
  console.log('🎁 挖矿奖励计算示例:');
  const rewards = pool.calculateMiningReward(
    {
      learnPoints: 15,  // 完成15个学习单元
      usePoints: 8,     // 使用AI工具8次
      teachPoints: 3,   // 发布3篇教学内容
      createPoints: 1,  // 创建1个AI工具
    },
    {
      learnRate: 50,    // 每积分50 LAC
      useRate: 20,      // 每积分20 LAC
      teachRate: 100,   // 每积分100 LAC
      createRate: 200,  // 每积分200 LAC
    },
    {
      qualityScore: 0.85,     // 质量评分85%
      streakDays: 10,         // 连续学习10天
      scarcityFactor: 0.95,   // 当日剩余95%（高供应）
    }
  );

  console.log('📊 计算结果:');
  Object.entries(rewards).forEach(([type, amount]) => {
    const displayType = {
      learn: '学习奖励',
      use: '使用奖励',
      teach: '教学奖励',
      create: '创作奖励'
    }[type] || type;
    
    console.log(`  ${displayType}: ${amount.toString()} LAC`);
  });

  const totalReward = Object.values(rewards).reduce((sum, amount) => sum.add(amount), new BN(0));
  console.log(`  总计: ${totalReward.toString()} LAC (~$${totalReward.mul(new BN(5)).div(new BN(10000)).toString()})\n`);

  // 3. 演示反作弊检测
  console.log('🛡️ 3. 反作弊检测演示');
  console.log('========================');

  // 正常用户行为
  const normalUser = pool.detectAntiFraud(
    mockUser1.publicKey,
    [],
    {
      deviceFingerprint: 'device_123',
      ipAddress: '192.168.1.100',
      learningPattern: [60, 45, 90, 120, 75, 80, 95], // 正常学习时长
      answerPattern: [78, 85, 92, 88, 91, 76, 89],    // 正常答题分数
    }
  );

  console.log('✅ 正常用户检测结果:');
  console.log(`  有效性: ${normalUser.isValid ? '通过' : '失败'}`);
  console.log(`  风险分数: ${normalUser.riskScore}/100`);
  if (normalUser.reasons.length > 0) {
    console.log(`  标记原因: ${normalUser.reasons.join(', ')}`);
  }

  // 可疑用户行为
  const suspiciousUser = pool.detectAntiFraud(
    mockUser2.publicKey,
    [],
    {
      deviceFingerprint: 'bot_device',
      ipAddress: '1.1.1.1',
      learningPattern: [10, 12, 8, 15, 9, 11, 13],    // 异常短的学习时长
      answerPattern: [95, 95, 95, 95, 95, 95, 95],    // 异常规律的答题
    }
  );

  console.log('\n⚠️ 可疑用户检测结果:');
  console.log(`  有效性: ${suspiciousUser.isValid ? '通过' : '失败'}`);
  console.log(`  风险分数: ${suspiciousUser.riskScore}/100`);
  if (suspiciousUser.reasons.length > 0) {
    console.log(`  标记原因: ${suspiciousUser.reasons.join(', ')}`);
  }

  // 4. 演示挖矿池状态查询
  console.log('\n📈 4. 挖矿池状态查询');
  console.log('========================');

  const poolStatus = await pool.getMiningPoolStatus();
  console.log(`总池子: ${poolStatus.totalPool.toString()} LAC`);
  console.log(`当前年度: Year ${poolStatus.currentYear}`);
  console.log(`日释放额度: ${poolStatus.dailyQuota.toString()} LAC`);
  console.log(`今日已分发: ${poolStatus.todayDistributed.toString()} LAC`);
  console.log(`今日剩余: ${poolStatus.todayRemaining.toString()} LAC`);

  // 5. 演示时间推进后的锁仓释放
  console.log('\n⏰ 5. 时间推进锁仓释放演示');
  console.log('========================');

  // 模拟18个月后的状态
  const futureTime = teamSchedule.startTime + (18 * 30 * 24 * 60 * 60); // 18个月后
  const futureInfo = vesting.getVestingInfo(teamSchedule, futureTime);
  
  console.log(`📅 时间: ${new Date(futureTime * 1000).toISOString()}`);
  console.log(`团队锁仓状态 (18个月后):`);
  console.log(`  总锁仓: ${teamSchedule.totalAmount.toString()} LAC`);
  console.log(`  已释放: ${futureInfo.vestedAmount.toString()} LAC`);
  console.log(`  可提取: ${futureInfo.releasableAmount.toString()} LAC`);
  
  const releasePercent = futureInfo.vestedAmount.mul(new BN(100)).div(teamSchedule.totalAmount).toNumber();
  console.log(`  释放进度: ${releasePercent.toFixed(1)}%`);

  console.log('\n🎉 演示完成！');
  console.log('=====================================');
  console.log('✨ LAC 智能合约具备以下核心功能:');
  console.log('  🪙 SPL Token 创建与铸造');
  console.log('  🔒 多种锁仓释放机制');
  console.log('  ⛏️ 四维挖矿奖励系统');
  console.log('  🛡️ 反作弊与风控机制');
  console.log('  📊 实时状态查询');
  console.log('  🏛️ 去中心化治理支持');
  console.log('\n📋 下一步: 运行 npm run deploy:devnet -- --yes 进行实际部署');
}

// 如果直接运行此文件
if (require.main === module) {
  demo().catch(console.error);
}

export { demo };