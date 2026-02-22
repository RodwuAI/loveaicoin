use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, Burn};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Placeholder ID

#[program]
pub mod lac_staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, _bump: u8) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.total_staked = 0;
        pool.reward_vault = ctx.accounts.reward_vault.key();
        pool.staking_vault = ctx.accounts.staking_vault.key();
        pool.bump = _bump;
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64, duration: i64, stake_id: u64) -> Result<()> {
        require!(
            duration == 30 * 86400 || duration == 90 * 86400 || duration == 180 * 86400 || duration == 365 * 86400,
            ErrorCode::InvalidDuration
        );

        let user_stake = &mut ctx.accounts.user_stake;
        user_stake.user = ctx.accounts.user.key();
        user_stake.amount = amount;
        user_stake.start_time = Clock::get()?.unix_timestamp;
        user_stake.duration = duration;
        user_stake.stake_id = stake_id;
        user_stake.claimed = false;
        user_stake.bump = ctx.bumps.user_stake;

        // Transfer tokens to staking vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.staking_vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        let pool = &mut ctx.accounts.pool;
        pool.total_staked = pool.total_staked.checked_add(amount).unwrap();

        msg!("Staked {} LAC for {} seconds (ID: {})", amount, duration, stake_id);
        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        let user_stake = &mut ctx.accounts.user_stake;
        let pool = &mut ctx.accounts.pool;
        let current_time = Clock::get()?.unix_timestamp;

        let is_mature = current_time >= user_stake.start_time + user_stake.duration;
        let seeds = &[
            b"staking_pool",
            &[pool.bump],
        ];
        let signer = &[&seeds[..]];

        if is_mature {
            // Calculate Rewards
            // APY: 30d=5%, 90d=10%, 180d=15%, 365d=20%
            let apy = match user_stake.duration {
                2592000 => 5, // 30 days
                7776000 => 10, // 90 days
                15552000 => 15, // 180 days
                31536000 => 20, // 365 days
                _ => 0,
            };

            let reward = (user_stake.amount as u128 * apy as u128 * user_stake.duration as u128 / (365 * 86400 * 100)) as u64;

            // Transfer Principal from Staking Vault
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.staking_vault.to_account_info(),
                        to: ctx.accounts.user_token_account.to_account_info(),
                        authority: ctx.accounts.pool.to_account_info(),
                    },
                    signer,
                ),
                user_stake.amount,
            )?;

            // Transfer Reward from Reward Vault
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.reward_vault.to_account_info(),
                        to: ctx.accounts.user_token_account.to_account_info(),
                        authority: ctx.accounts.pool.to_account_info(),
                    },
                    signer,
                ),
                reward,
            )?;

            msg!("Unstaked {} principal + {} reward", user_stake.amount, reward);

        } else {
            // Early Penalty: 10% Burn
            let penalty = user_stake.amount / 10;
            let return_amount = user_stake.amount - penalty;

            // Burn Penalty
            token::burn(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Burn {
                        mint: ctx.accounts.mint.to_account_info(),
                        from: ctx.accounts.staking_vault.to_account_info(),
                        authority: ctx.accounts.pool.to_account_info(),
                    },
                    signer,
                ),
                penalty,
            )?;

            // Return Remaining Principal
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.staking_vault.to_account_info(),
                        to: ctx.accounts.user_token_account.to_account_info(),
                        authority: ctx.accounts.pool.to_account_info(),
                    },
                    signer,
                ),
                return_amount,
            )?;

            msg!("Early Unstake: Burned {} penalty, returned {}", penalty, return_amount);
        }

        // Close User Stake Account (or mark claimed)
        // Here we just mark claimed and let user close it to reclaim rent if we implemented a close instruction
        user_stake.claimed = true;
        user_stake.amount = 0;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 8 + 32 + 32 + 1, // Discriminator + Total + Vaults + Bump
        seeds = [b"staking_pool"],
        bump
    )]
    pub pool: Account<'info, StakePool>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = admin,
        token::mint = mint,
        token::authority = pool,
        seeds = [b"staking_vault"],
        bump
    )]
    pub staking_vault: Account<'info, TokenAccount>,
    
    // Reward vault must be funded manually
    #[account(mut)]
    pub reward_vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(amount: u64, duration: i64, stake_id: u64)]
pub struct Stake<'info> {
    #[account(mut, seeds = [b"staking_pool"], bump = pool.bump)]
    pub pool: Account<'info, StakePool>,

    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 8 + 8 + 8 + 1 + 1, // Discriminator + Pubkey + u64s + bool + u8
        seeds = [b"user_stake", user.key().as_ref(), &stake_id.to_le_bytes()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,

    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub staking_vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut, seeds = [b"staking_pool"], bump = pool.bump)]
    pub pool: Account<'info, StakePool>,

    #[account(mut, has_one = user, close = user)]
    pub user_stake: Account<'info, UserStake>,

    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub staking_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub reward_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

#[account]
pub struct StakePool {
    pub total_staked: u64,
    pub staking_vault: Pubkey,
    pub reward_vault: Pubkey,
    pub bump: u8,
}

#[account]
pub struct UserStake {
    pub user: Pubkey,
    pub amount: u64,
    pub start_time: i64,
    pub duration: i64,
    pub stake_id: u64,
    pub claimed: bool,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid staking duration.")]
    InvalidDuration,
}
