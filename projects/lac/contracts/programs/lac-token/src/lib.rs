use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Placeholder ID

#[program]
pub mod lac_token {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        _mining_bump: u8, // Not strictly needed if we just mint to passed ATAs
        _charity_bump: u8,
        _team_bump: u8,
        _investor_bump: u8,
        _treasury_bump: u8,
    ) -> Result<()> {
        let total_supply: u64 = 10_000_000_000 * 1_000_000_000; // 10 Billion with 9 decimals

        // Distribution percentages
        let mining_amount = (total_supply as u128 * 45 / 100) as u64;
        let charity_amount = (total_supply as u128 * 15 / 100) as u64;
        let team_amount = (total_supply as u128 * 15 / 100) as u64;
        let investor_amount = (total_supply as u128 * 10 / 100) as u64;
        let treasury_amount = (total_supply as u128 * 15 / 100) as u64;

        // Mint to Mining Pool
        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.mining_wallet.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
            ),
            mining_amount,
        )?;

        // Mint to Charity/Builder Fund
        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.charity_wallet.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
            ),
            charity_amount,
        )?;

        // Mint to Team (Will be moved to Vesting Contract)
        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.team_wallet.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
            ),
            team_amount,
        )?;

        // Mint to Investors (Will be moved to Vesting Contract)
        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.investor_wallet.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
            ),
            investor_amount,
        )?;

        // Mint to Treasury/Liquidity
        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.treasury_wallet.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
            ),
            treasury_amount,
        )?;

        msg!("LAC Token Initialized. Total Supply: 10,000,000,000");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = mint_authority, // The multisig pays for rent
        mint::decimals = 9,
        mint::authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub mint_authority: Signer<'info>,

    #[account(mut)]
    pub mining_wallet: Account<'info, TokenAccount>,
    #[account(mut)]
    pub charity_wallet: Account<'info, TokenAccount>,
    #[account(mut)]
    pub team_wallet: Account<'info, TokenAccount>,
    #[account(mut)]
    pub investor_wallet: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_wallet: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}
