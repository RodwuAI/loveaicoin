use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Placeholder ID

#[program]
pub mod lac_mining {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, admin: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.admin = admin;
        state.merkle_root = [0; 32];
        state.epoch = 0;
        state.vault = ctx.accounts.vault.key();
        state.bump = ctx.bumps.state;
        Ok(())
    }

    pub fn update_epoch(ctx: Context<UpdateEpoch>, merkle_root: [u8; 32], epoch: u64) -> Result<()> {
        let state = &mut ctx.accounts.state;
        require!(ctx.accounts.admin.key() == state.admin, ErrorCode::Unauthorized);
        state.merkle_root = merkle_root;
        state.epoch = epoch;
        Ok(())
    }

    pub fn claim(
        ctx: Context<Claim>,
        amount: u64, // Total accumulated amount for user
        proof: Vec<[u8; 32]>,
    ) -> Result<()> {
        let state = &ctx.accounts.state;
        let user_status = &mut ctx.accounts.user_status;

        // Verify Merkle Proof
        let leaf = keccak::hashv(&[
            &ctx.accounts.user.key().to_bytes(),
            &amount.to_le_bytes(),
        ]);
        require!(
            verify_proof(proof, state.merkle_root, leaf.0),
            ErrorCode::InvalidProof
        );

        // Calculate claimable amount
        let claimable = amount.checked_sub(user_status.claimed_amount).unwrap();
        require!(claimable > 0, ErrorCode::NoNewRewards);

        // Update user status
        user_status.claimed_amount = amount;
        user_status.bump = ctx.bumps.user_status;

        // Transfer tokens
        let seeds = &[
            b"mining_state",
            &[state.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.state.to_account_info(), // State is authority of vault
                },
                signer,
            ),
            claimable,
        )?;

        msg!("Claimed {} tokens for user {}", claimable, ctx.accounts.user.key());
        Ok(())
    }
}

// Helper for Merkle Proof Verification
fn verify_proof(proof: Vec<[u8; 32]>, root: [u8; 32], leaf: [u8; 32]) -> bool {
    let mut current_hash = leaf;
    for hash in proof {
        if current_hash <= hash {
            current_hash = keccak::hashv(&[&current_hash, &hash]).0;
        } else {
            current_hash = keccak::hashv(&[&hash, &current_hash]).0;
        }
    }
    current_hash == root
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 8 + 32 + 1, // Discriminator + Admin + Root + Epoch + Vault + Bump
        seeds = [b"mining_state"],
        bump
    )]
    pub state: Account<'info, MiningState>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = admin,
        token::mint = mint,
        token::authority = state,
        seeds = [b"mining_vault"],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateEpoch<'info> {
    #[account(mut, seeds = [b"mining_state"], bump = state.bump)]
    pub state: Account<'info, MiningState>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut, seeds = [b"mining_state"], bump = state.bump)]
    pub state: Account<'info, MiningState>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 8 + 1, // Discriminator + Claimed + Bump
        seeds = [b"user_status", user.key().as_ref()],
        bump
    )]
    pub user_status: Account<'info, UserClaimStatus>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct MiningState {
    pub admin: Pubkey,
    pub merkle_root: [u8; 32],
    pub epoch: u64,
    pub vault: Pubkey,
    pub bump: u8,
}

#[account]
pub struct UserClaimStatus {
    pub claimed_amount: u64,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access.")]
    Unauthorized,
    #[msg("Invalid Merkle proof.")]
    InvalidProof,
    #[msg("No new rewards to claim.")]
    NoNewRewards,
}

// Keccak hash binding
mod keccak {
    use anchor_lang::solana_program::keccak;
    pub fn hashv(vals: &[&[u8]]) -> keccak::Hash {
        keccak::hashv(vals)
    }
}
