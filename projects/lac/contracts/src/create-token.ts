import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  createMintToInstruction,
} from '@solana/spl-token';
import { config } from './config';
import * as fs from 'fs';
import * as path from 'path';

export interface TokenInfo {
  mintAddress: string;
  decimals: number;
  totalSupply: string;
  mintAuthority: string;
  freezeAuthority: string | null;
}

export class LACTokenCreator {
  private connection: Connection;
  private payer: Keypair;
  
  constructor(payer: Keypair, rpcUrl: string = config.SOLANA_RPC_URL) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.payer = payer;
  }

  /**
   * 创建 LAC SPL Token
   */
  async createToken(): Promise<TokenInfo> {
    console.log('🚀 开始创建 LAC Token...');
    
    // 生成新的 Mint 账户
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    
    // 设置 Mint Authority（多签钱包）
    const mintAuthority = new PublicKey(config.MULTISIG_WALLET);
    
    // Freeze Authority 设为 null（不需要冻结功能）
    const freezeAuthority = null;
    
    console.log(`📍 Token Mint Address: ${mint.toString()}`);
    console.log(`🔑 Mint Authority: ${mintAuthority.toString()}`);
    console.log(`❄️ Freeze Authority: ${freezeAuthority ? freezeAuthority : 'null (disabled)'}`);

    // 计算创建 Mint 账户所需的 lamports
    const lamports = await getMinimumBalanceForRentExemptMint(this.connection);
    
    const transaction = new Transaction().add(
      // 创建 Mint 账户
      SystemProgram.createAccount({
        fromPubkey: this.payer.publicKey,
        newAccountPubkey: mint,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      // 初始化 Mint
      createInitializeMintInstruction(
        mint,
        config.TOKEN_DECIMALS,
        mintAuthority,
        freezeAuthority,
        TOKEN_PROGRAM_ID
      )
    );

    console.log('📤 发送创建 Token 交易...');
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payer, mintKeypair]
    );

    console.log(`✅ Token 创建成功！`);
    console.log(`🔗 交易签名: ${signature}`);
    console.log(`🪙 Token 名称: ${config.TOKEN_NAME}`);
    console.log(`🏷️ Symbol: ${config.TOKEN_SYMBOL}`);
    console.log(`🔢 Decimals: ${config.TOKEN_DECIMALS}`);
    console.log(`📊 总供应量: ${config.TOTAL_SUPPLY.toLocaleString()} ${config.TOKEN_SYMBOL}`);

    const tokenInfo: TokenInfo = {
      mintAddress: mint.toString(),
      decimals: config.TOKEN_DECIMALS,
      totalSupply: config.TOTAL_SUPPLY.toString(),
      mintAuthority: mintAuthority.toString(),
      freezeAuthority: freezeAuthority ? freezeAuthority : null,
    };

    // 保存 Token 信息到文件
    await this.saveTokenInfo(tokenInfo, signature);

    return tokenInfo;
  }

  /**
   * 铸造初始供应量到多签钱包
   */
  async mintInitialSupply(mintAddress: string): Promise<string> {
    console.log('🪙 开始铸造初始供应量...');
    
    const mint = new PublicKey(mintAddress);
    const mintAuthority = new PublicKey(config.MULTISIG_WALLET);
    
    // 获取或创建多签钱包的关联代币账户
    const associatedTokenAddress = getAssociatedTokenAddressSync(
      mint,
      mintAuthority,
      true // allowOwnerOffCurve
    );

    console.log(`💰 目标钱包: ${mintAuthority.toString()}`);
    console.log(`🏦 关联代币账户: ${associatedTokenAddress.toString()}`);

    // 检查账户是否存在
    const accountInfo = await this.connection.getAccountInfo(associatedTokenAddress);
    
    const transaction = new Transaction();

    // 如果账户不存在，先创建
    if (!accountInfo) {
      console.log('🏗️ 创建关联代币账户...');
      transaction.add(
        createAssociatedTokenAccountInstruction(
          this.payer.publicKey, // payer
          associatedTokenAddress, // ata
          mintAuthority, // owner
          mint // mint
        )
      );
    }

    // 计算铸造数量（考虑精度）
    const totalSupplyWithDecimals = BigInt(config.TOTAL_SUPPLY) * BigInt(10 ** config.TOKEN_DECIMALS);
    
    // 铸造代币到多签钱包
    transaction.add(
      createMintToInstruction(
        mint, // mint
        associatedTokenAddress, // destination
        mintAuthority, // mintAuthority
        totalSupplyWithDecimals, // amount
        [], // multiSigners (空数组表示单签)
        TOKEN_PROGRAM_ID
      )
    );

    // 注意：这里假设当前 payer 就是 mintAuthority 或者有权限
    // 在实际部署中，这个操作应该由多签钱包执行
    console.log('⚠️ 注意: 实际部署时，铸造操作应由多签钱包执行');
    
    try {
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.payer] // 实际应该是多签签名
      );

      console.log(`✅ 初始供应量铸造成功！`);
      console.log(`🔗 交易签名: ${signature}`);
      console.log(`💰 铸造数量: ${config.TOTAL_SUPPLY.toLocaleString()} ${config.TOKEN_SYMBOL}`);
      
      return signature;
    } catch (error) {
      console.error('❌ 铸造失败:', error);
      console.log('💡 提示: 确保当前钱包是 Mint Authority，或使用正确的多签操作');
      throw error;
    }
  }

  /**
   * 保存 Token 信息到文件
   */
  private async saveTokenInfo(tokenInfo: TokenInfo, signature: string): Promise<void> {
    const deploymentInfo = {
      ...tokenInfo,
      createdAt: new Date().toISOString(),
      network: config.SOLANA_NETWORK,
      transactionSignature: signature,
      tokenName: config.TOKEN_NAME,
      tokenSymbol: config.TOKEN_SYMBOL,
    };

    const filePath = path.join(__dirname, '../deployments', `${config.SOLANA_NETWORK}_token.json`);
    
    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Token 信息已保存到: ${filePath}`);
  }

  /**
   * 获取 Token 信息
   */
  async getTokenInfo(mintAddress: string): Promise<any> {
    const mint = new PublicKey(mintAddress);
    const mintInfo = await this.connection.getAccountInfo(mint);
    
    if (!mintInfo) {
      throw new Error(`Token ${mintAddress} not found`);
    }

    // TODO: 解析 mint info 数据
    console.log(`📊 Token Mint Info:`, mintInfo);
    
    return mintInfo;
  }
}

// 主函数：创建并铸造 LAC Token
async function main() {
  try {
    // 从环境变量加载私钥
    if (!process.env['DEPLOYER_PRIVATE_KEY']) {
      throw new Error('请在 .env 文件中设置 DEPLOYER_PRIVATE_KEY');
    }

    const payerKeypair = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(process.env['DEPLOYER_PRIVATE_KEY']))
    );

    console.log(`🚀 LAC Token 创建工具`);
    console.log(`📡 网络: ${config.SOLANA_NETWORK}`);
    console.log(`🔗 RPC: ${config.SOLANA_RPC_URL}`);
    console.log(`👤 部署者: ${payerKeypair.publicKey.toString()}`);
    console.log(`\n=================================\n`);

    const tokenCreator = new LACTokenCreator(payerKeypair);
    
    // 1. 创建 Token
    const tokenInfo = await tokenCreator.createToken();
    
    // 2. 铸造初始供应量（可选，可以单独执行）
    if (process.argv.includes('--mint')) {
      await tokenCreator.mintInitialSupply(tokenInfo.mintAddress);
    }

    console.log(`\n=================================`);
    console.log(`🎉 LAC Token 部署完成！`);
    console.log(`📋 下一步: 运行 'npm run deploy:devnet' 进行完整部署`);
    console.log(`=================================\n`);

  } catch (error) {
    console.error('❌ 创建 Token 失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}