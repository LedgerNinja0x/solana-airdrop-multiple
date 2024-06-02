use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer as SplTransfer};

declare_id!("DDGa2CL5TNgnL5wBJXdn3RcZugKmcwNzxsZ422os6HYt");

#[program]
pub mod solana_multi_airdrop {
    use super::*;

    pub fn transfer_spl_tokens<'info>(
        ctx: Context<'_, '_, '_, 'info, SplTokenTransfer<'info>>,
        amount: u64
    ) -> Result<()> {
        // Assuming `source_account` is correctly typed and initialized
        let source_account = &ctx.accounts.source_token_account;
        let token_program = &ctx.accounts.spl_token_program;
        let authority = &ctx.accounts.authority;
        let recipients = ctx.remaining_accounts.iter();

        // Iterate over recipients
        for recipient in recipients {
            // Create CPI accounts with correct references
            let cpi_accounts = SplTransfer {
                from: source_account.to_account_info().clone(),
                to: recipient.clone(), // Ensure this is valid
                authority: authority.to_account_info().clone(), // Ensureu this is valid
            };
            let cpi_program = token_program.to_account_info(); // Ensure this is valid

            // Perform the transfer
            token::transfer(CpiContext::new(cpi_program, cpi_accounts), amount)?;
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SplTokenTransfer<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub source_token_account: Account<'info, TokenAccount>,
    pub spl_token_program: Program<'info, Token>,
}