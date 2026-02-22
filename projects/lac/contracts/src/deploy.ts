import { Keypair, PublicKey, Connection } from '@solana/web3.js';
import { 
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  createTransferInstruction,
  getAccount,
} from '@solana/spl-token';
import { LACTokenCreator, TokenInfo } from './create-token';
import { LACVesting, createDefaultVestingPlans } from './vesting';
import { LACMiningPool, createDefaultMiningPool } from './mining-pool';
import { config, displayConfig, calculateTokenDistribution } from './config';
import BN from 'bn.js';
import * as fs from 'fs';
import * as path from 'path';

export interface DeploymentResult {
  tokenInfo: TokenInfo;
  vestingSchedules: any[];
  miningPoolConfig: any;
  distributionTransactions: string[];
  deploymentSummary: {
    network: string;
    timestamp: string;
    totalSupply: string;
    distributions: {
      communityMining: string;
      publicGood: string;
      team: string;
      investor: string;
      treasury: string;
    };
  };
}

/**
 * LAC Token 完整部署脚本
 * 
 * 执行步骤：
 * 1. 创建 LAC SPL Token
 * 2. 铸造总供应量到部署者钱包
 * 3. 设置锁仓计划
 * 4. 分配代币到各个池子
 * 5. 初始化挖矿池
 * 6. 生成部署报告
 */
export class LACDeployer {
  private connection: Connection;
  private deployer: Keypair;
  private network: string;

  constructor(deployerKeypair: Keypair, network: string = config.SOLANA_NETWORK) {
    this.deployer = deployerKeypair;
    this.network = network;
    this.connection = new Connection(config.SOLANA_RPC_URL, 'confirmed');
  }

  /**
   * 执行完整部署流程
   */
  async deploy(options: {
    createToken?: boolean;
    setupVesting?: boolean;
    distributeTokens?: boolean;
    initMiningPool?: boolean;
    saveDeployment?: boolean;
  } = {}): Promise<DeploymentResult> {
    
    const {
      createToken = true,
      setupVesting = true,
      distributeTokens = true,
      initMiningPool = true,
      saveDeployment = true,
    } = options;

    console.log('🚀 开始 LAC Token 完整部署流程');
    console.log('=========================================');
    
    // 显示配置信息
    displayConfig();

    // 检查部署者余额
    await this.checkDeployerBalance();

    let tokenInfo: TokenInfo;
    let vestingSchedules: any[] = [];
    let miningPoolConfig: any = {};
    let distributionTransactions: string[] = [];

    try {
      // 1. 创建 Token
      if (createToken) {
        console.log('\n📍 步骤 1: 创建 LAC Token...');
        tokenInfo = await this.createLACToken();
        console.log('✅ Token 创建成功！\n');
      } else {
        // 从文件加载已存在的 Token 信息
        tokenInfo = await this.loadExistingToken();
      }

      // 2. 设置锁仓计划
      if (setupVesting) {
        console.log('📍 步骤 2: 设置锁仓计划...');
        vestingSchedules = await this.setupVestingSchedules(new PublicKey(tokenInfo.mintAddress));
        console.log('✅ 锁仓计划设置完成！\n');
      }

      // 3. 分配代币到各个池子
      if (distributeTokens) {
        console.log('📍 步骤 3: 分配代币到各个池子...');
        distributionTransactions = await this.distributeTokens(new PublicKey(tokenInfo.mintAddress));
        console.log('✅ 代币分配完成！\n');
      }

      // 4. 初始化挖矿池
      if (initMiningPool) {
        console.log('📍 步骤 4: 初始化挖矿池...');
        miningPoolConfig = await this.initializeMiningPool(new PublicKey(tokenInfo.mintAddress));
        console.log('✅ 挖矿池初始化完成！\n');
      }

      // 5. 生成部署结果
      const deploymentResult: DeploymentResult = {
        tokenInfo,
        vestingSchedules,
        miningPoolConfig,
        distributionTransactions,
        deploymentSummary: this.generateDeploymentSummary(tokenInfo, distributionTransactions),
      };

      // 6. 保存部署信息
      if (saveDeployment) {
        await this.saveDeploymentResult(deploymentResult);
      }

      console.log('🎉 LAC Token 部署完成！');
      this.printDeploymentSummary(deploymentResult);

      return deploymentResult;

    } catch (error) {
      console.error('❌ 部署失败:', error);
      throw error;
    }
  }

  /**
   * 检查部署者 SOL 余额
   */
  private async checkDeployerBalance(): Promise<void> {
    const balance = await this.connection.getBalance(this.deployer.publicKey);
    const balanceSOL = balance / 1e9;

    console.log(`💰 部署者余额: ${balanceSOL.toFixed(4)} SOL`);

    if (balanceSOL < 0.1) {
      throw new Error(`部署者余额不足！需要至少 0.1 SOL，当前只有 ${balanceSOL.toFixed(4)} SOL`);
    }

    if (balanceSOL < 1) {
      console.warn('⚠️ 警告: 部署者余额较低，建议保持 1 SOL 以上');
    }
  }

  /**
   * 创建 LAC Token
   */
  private async createLACToken(): Promise<TokenInfo> {
    const tokenCreator = new LACTokenCreator(this.deployer);
    const tokenInfo = await tokenCreator.createToken();
    
    // 铸造初始供应量
    console.log('🪙 铸造初始供应量...');
    await tokenCreator.mintInitialSupply(tokenInfo.mintAddress);
    
    return tokenInfo;
  }

  /**
   * 加载已存在的 Token 信息
   */
  private async loadExistingToken(): Promise<TokenInfo> {
    const filePath = path.join(__dirname, '../deployments', `${this.network}_token.json`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Token 信息文件不存在: ${filePath}`);
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`📄 从文件加载 Token 信息: ${filePath}`);
    
    return data as TokenInfo;
  }

  /**
   * 设置锁仓计划
   */
  private async setupVestingSchedules(tokenMint: PublicKey): Promise<any[]> {
    const vesting = new LACVesting(this.deployer);
    const vestingPlans = createDefaultVestingPlans(tokenMint);

    console.log(`📋 创建 ${vestingPlans.length} 个锁仓计划:`);
    
    const schedules = await vesting.createMultipleVestingSchedules(tokenMint, vestingPlans);
    
    // 显示锁仓状态
    const vestingInfos = schedules.map(schedule => vesting.getVestingInfo(schedule));
    vesting.displayVestingStatus(vestingInfos);

    return schedules;
  }

  /**
   * 分配代币到各个池子
   */
  private async distributeTokens(tokenMint: PublicKey): Promise<string[]> {
    const distribution = calculateTokenDistribution(config.TOTAL_SUPPLY);
    const decimals = new BN(10).pow(new BN(config.TOKEN_DECIMALS));
    const signatures: string[] = [];

    // 部署者的代币账户（铸造的代币在这里）
    const deployerTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      this.deployer.publicKey
    );

    console.log('💸 开始代币分配:');

    // 分配计划
    const allocations = [
      {
        name: '社区挖矿池',
        wallet: config.COMMUNITY_MINING_WALLET,
        amount: new BN(distribution.communityMining).mul(decimals),
      },
      {
        name: '公益孵化池',
        wallet: config.PUBLIC_GOOD_WALLET,
        amount: new BN(distribution.publicGood).mul(decimals),
      },
      {
        name: '团队池',
        wallet: config.TEAM_WALLET,
        amount: new BN(distribution.team).mul(decimals),
      },
      {
        name: '投资人池',
        wallet: config.INVESTOR_WALLET,
        amount: new BN(distribution.investor).mul(decimals),
      },
      {
        name: '金库池',
        wallet: config.TREASURY_WALLET,
        amount: new BN(distribution.treasury).mul(decimals),
      },
    ];

    for (const allocation of allocations) {
      try {
        console.log(`\n📤 分配到 ${allocation.name}:`);
        console.log(`  钱包: ${allocation.wallet}`);
        console.log(`  数量: ${allocation.amount.toString()}`);

        const signature = await this.transferTokens(
          tokenMint,
          deployerTokenAccount,
          new PublicKey(allocation.wallet),
          allocation.amount
        );

        signatures.push(signature);
        console.log(`  ✅ 成功! 交易: ${signature}`);

      } catch (error) {
        console.error(`  ❌ ${allocation.name} 分配失败:`, error);
        // 继续处理其他分配
      }
    }

    return signatures;
  }

  /**
   * 转移代币到指定钱包
   */
  private async transferTokens(
    tokenMint: PublicKey,
    fromAccount: PublicKey,
    toWallet: PublicKey,
    amount: BN
  ): Promise<string> {
    const toTokenAccount = getAssociatedTokenAddressSync(tokenMint, toWallet);

    const transaction = new (await import('@solana/web3.js')).Transaction();

    // 检查目标代币账户是否存在
    try {
      await getAccount(this.connection, toTokenAccount);
    } catch (error) {
      // 创建关联代币账户
      transaction.add(
        createAssociatedTokenAccountInstruction(
          this.deployer.publicKey,
          toTokenAccount,
          toWallet,
          tokenMint
        )
      );
    }

    // 转移代币
    transaction.add(
      createTransferInstruction(
        fromAccount,
        toTokenAccount,
        this.deployer.publicKey,
        BigInt(amount.toString())
      )
    );

    const signature = await (await import('@solana/web3.js')).sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.deployer]
    );

    return signature;
  }

  /**
   * 初始化挖矿池
   */
  private async initializeMiningPool(tokenMint: PublicKey): Promise<any> {
    const { config: poolConfig, pool } = createDefaultMiningPool(tokenMint, this.deployer);
    
    // 显示挖矿池信息
    pool.displayMiningPoolStats();
    
    return {
      tokenMint: poolConfig.tokenMint.toString(),
      poolWallet: poolConfig.poolWallet.toString(),
      totalPoolAmount: poolConfig.totalPoolAmount.toString(),
      startTime: poolConfig.startTime,
      decayFactor: poolConfig.decayFactor,
    };
  }

  /**
   * 生成部署摘要
   */
  private generateDeploymentSummary(tokenInfo: TokenInfo, transactions: string[]): any {
    const distribution = calculateTokenDistribution(config.TOTAL_SUPPLY);
    
    return {
      network: this.network,
      timestamp: new Date().toISOString(),
      totalSupply: tokenInfo.totalSupply,
      distributions: {
        communityMining: distribution.communityMining.toString(),
        publicGood: distribution.publicGood.toString(),
        team: distribution.team.toString(),
        investor: distribution.investor.toString(),
        treasury: distribution.treasury.toString(),
      },
    };
  }

  /**
   * 保存部署结果
   */
  private async saveDeploymentResult(result: DeploymentResult): Promise<void> {
    const deploymentDir = path.join(__dirname, '../deployments');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${this.network}_deployment_${timestamp}.json`;
    const filePath = path.join(deploymentDir, fileName);

    // 确保目录存在
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
    console.log(`💾 部署结果已保存到: ${filePath}`);

    // 同时保存一份最新的部署信息（覆盖）
    const latestPath = path.join(deploymentDir, `${this.network}_latest.json`);
    fs.writeFileSync(latestPath, JSON.stringify(result, null, 2));
  }

  /**
   * 打印部署摘要
   */
  private printDeploymentSummary(result: DeploymentResult): void {
    console.log('\n🎯 部署摘要:');
    console.log('=====================================');
    console.log(`🌐 网络: ${result.deploymentSummary.network}`);
    console.log(`⏰ 时间: ${result.deploymentSummary.timestamp}`);
    console.log(`🪙 Token: ${result.tokenInfo.mintAddress}`);
    console.log(`📊 总供应量: ${parseInt(result.deploymentSummary.totalSupply).toLocaleString()} LAC`);
    
    console.log('\n💰 代币分配:');
    Object.entries(result.deploymentSummary.distributions).forEach(([key, value]) => {
      const name = {
        communityMining: '社区挖矿',
        publicGood: '公益孵化',
        team: '团队',
        investor: '投资人',
        treasury: '金库',
      }[key] || key;
      
      console.log(`  ${name}: ${parseInt(value).toLocaleString()} LAC`);
    });

    console.log('\n📋 交易记录:');
    result.distributionTransactions.forEach((tx, index) => {
      console.log(`  ${index + 1}. ${tx}`);
    });

    console.log('\n🔗 查看链上信息:');
    const explorerUrl = this.network === 'mainnet-beta' 
      ? 'https://explorer.solana.com' 
      : `https://explorer.solana.com?cluster=${this.network}`;
    
    console.log(`  Token: ${explorerUrl}/address/${result.tokenInfo.mintAddress}`);
    console.log('=====================================\n');
  }
}

/**
 * 主部署函数
 */
async function main() {
  try {
    // 检查环境变量
    if (!process.env['DEPLOYER_PRIVATE_KEY']) {
      throw new Error('请在 .env 文件中设置 DEPLOYER_PRIVATE_KEY');
    }

    // 加载部署者私钥
    const deployerKeypair = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(process.env['DEPLOYER_PRIVATE_KEY']))
    );

    console.log('🎯 LAC Token 部署工具');
    console.log(`📡 网络: ${config.SOLANA_NETWORK}`);
    console.log(`👤 部署者: ${deployerKeypair.publicKey.toString()}`);

    // 解析命令行参数
    const args = process.argv.slice(2);
    const options = {
      createToken: !args.includes('--skip-token'),
      setupVesting: !args.includes('--skip-vesting'),
      distributeTokens: !args.includes('--skip-distribution'),
      initMiningPool: !args.includes('--skip-mining'),
      saveDeployment: !args.includes('--skip-save'),
    };

    console.log('\n🔧 部署选项:');
    Object.entries(options).forEach(([key, enabled]) => {
      console.log(`  ${key}: ${enabled ? '✅ 启用' : '❌ 跳过'}`);
    });

    if (args.includes('--help')) {
      printHelp();
      return;
    }

    // 确认部署
    if (!args.includes('--yes')) {
      console.log('\n⚠️ 即将开始部署，请确认以上配置无误');
      console.log('如需继续，请添加 --yes 参数\n');
      return;
    }

    // 开始部署
    const deployer = new LACDeployer(deployerKeypair);
    const result = await deployer.deploy(options);

    console.log('🚀 部署成功完成！');
    console.log('📝 请检查生成的部署报告文件');
    console.log('🔒 记得备份私钥和重要地址信息');

  } catch (error) {
    console.error('💥 部署失败:', error);
    process.exit(1);
  }
}

/**
 * 显示帮助信息
 */
function printHelp(): void {
  console.log(`
📖 LAC Token 部署工具使用说明:

基本用法:
  npm run deploy:devnet -- --yes

选项:
  --yes                    确认部署（必需）
  --skip-token            跳过创建 Token
  --skip-vesting          跳过设置锁仓
  --skip-distribution     跳过代币分配
  --skip-mining           跳过挖矿池初始化
  --skip-save             跳过保存部署结果
  --help                  显示此帮助信息

示例:
  # 完整部署
  npm run deploy:devnet -- --yes
  
  # 只分配代币（假设 Token 已创建）
  npm run deploy:devnet -- --skip-token --skip-vesting --skip-mining --yes
  
  # 跳过保存文件（用于测试）
  npm run deploy:devnet -- --skip-save --yes

环境变量:
  请确保 .env 文件中设置了所有必要的环境变量
  参考 .env.example 文件

注意事项:
  - 确保部署者钱包有足够的 SOL (建议 1+ SOL)
  - 确认所有钱包地址配置正确
  - 建议先在 devnet 测试后再部署到 mainnet
`);
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}