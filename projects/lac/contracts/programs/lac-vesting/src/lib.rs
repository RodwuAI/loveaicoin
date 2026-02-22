use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Placeholder ID

#[program]
pub mod lac_vesting {
    use super::*;

    pub fn create_vesting_schedule(
        ctx: Context<CreateVestingSchedule>,
        amount: u64,
        start_time: i64,
        cliff_duration: i64,
        vesting_duration: i64,
    ) -> Result<()> {
        let vesting_account = &mut ctx.accounts.vesting_account;
        vesting_account.beneficiary = ctx.accounts.beneficiary.key();
        vesting_account.mint = ctx.accounts.mint.key();
        vesting_account.vault = ctx.accounts.vault.key();
        vesting_account.start_time = start_time;
        vesting_account.cliff_duration = cliff_duration;
        vesting_account.vesting_duration = vesting_duration;
        vesting_account.total_amount = amount;
        vesting_account.released_amount = 0;
        vesting_account.bump = ctx.bumps.vesting_account; // Using `ctx.bumps` directly in Anchor 0.29+

        // Transfer tokens from admin to the vesting vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.admin_token_account.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.admin.to_account_info(),
                },
            ),
            amount,
        )?;

        msg!("Vesting schedule created for {}", ctx.accounts.beneficiary.key());
        Ok(())
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        let vesting_account = &mut ctx.accounts.vesting_account;
        let current_time = Clock::get()?.unix_timestamp;

        // Calculate vested amount
        let vested_amount = if current_time < vesting_account.start_time + vesting_account.cliff_duration {
            0
        } else if current_time >= vesting_account.start_time + vesting_account.vesting_duration {
            vesting_account.total_amount
        } else {
            let time_since_start = current_time.checked_sub(vesting_account.start_time).unwrap();
            
            // Linear vesting
            // vested = total * (time_since_start / vesting_duration)
            // Use u128 for calculation to prevent overflow
            (vesting_account.total_amount as u128)
                .checked_mul(time_since_start as u128)
                .unwrap()
                .checked_div(vesting_account.vesting_duration as u128)
                .unwrap() as u64
        };

        let claimable = vested_amount.checked_sub(vesting_account.released_amount).unwrap();

        if claimable == 0 {
            return Err(ErrorCode::NoTokensToClaim.into());
        }

        vesting_account.released_amount = vesting_account.released_amount.checked_add(claimable).unwrap();

        // Transfer tokens from vault to beneficiary
        let seeds = &[
            b"vesting_account",
            vesting_account.beneficiary.as_ref(),
            &[vesting_account.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.beneficiary_token_account.to_account_info(),
                    authority: ctx.accounts.vesting_account.to_account_info(), // Vesting account is the authority of the vault? No, vault authority is typically the PDA.
                    // Actually, usually vault authority is a PDA. Let's make vesting_account the authority.
                },
                signer,
            ),
            claimable,
        )?;

        msg!("Claimed {} tokens", claimable);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateVestingSchedule<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1, // Discriminator + Pubkeys + i64/u64s + bump
        seeds = [b"vesting_account", beneficiary.key().as_ref()],
        bump
    )]
    pub vesting_account: Account<'info, VestingAccount>,

    /// CHECK: Safe
    #[account(mut)]
    pub beneficiary: AccountInfo<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = admin,
        token::mint = mint,
        token::authority = vesting_account, // Vesting account PDA controls the vault
        seeds = [b"vesting_vault", vesting_account.key().as_ref()], // Different seed for vault
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(mut)]
    pub admin_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(
        mut,
        seeds = [b"vesting_account", beneficiary.key().as_ref()],
        bump = vesting_account.bump,
        has_one = beneficiary,
        has_one = vault,
    )]
    pub vesting_account: Account<'info, VestingAccount>,

    #[account(mut)]
    pub beneficiary: Signer<'info>,

    #[account(mut)]
    pub beneficiary_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[account]
pub struct VestingAccount {
    pub beneficiary: Pubkey,
    pub mint: Pubkey,
    pub vault: Pubkey,
    pub start_time: i64,
    pub cliff_duration: i64,
    pub vesting_duration: i64,
    pub total_amount: u64,
    pub released_amount: u64,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("No tokens available to claim at this time.")]
    NoTokensToClaim,
}
