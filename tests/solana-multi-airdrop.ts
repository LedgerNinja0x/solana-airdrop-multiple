import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaMultiAirdrop } from "../target/types/solana_multi_airdrop";
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { PublicKey, Keypair } from "@solana/web3.js";

describe("solana-multi-airdrop", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaMultiAirdrop as Program<SolanaMultiAirdrop>;

  const mintKeypair = Keypair.generate();
  const receiverKeypair = Keypair.generate();
  let mint;
  let auxiliaryTokenAccount;
  let receiverATA;

  before(async () => {
    // Create a new mint and token accounts
    mint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.payer.publicKey,
      null,
      9,
      mintKeypair
    );

    auxiliaryTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection, 
      provider.wallet.payer,
      mint,
      provider.wallet.payer.publicKey
    );

    receiverATA = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      receiverKeypair.publicKey
    );

    // Mint some tokens to the source account
    await mintTo(
      provider.connection,
      provider.wallet.payer,
      mint,
      auxiliaryTokenAccount.address,
      provider.wallet.payer,
      1000
    );
    
  });

  it("Transfers SPL tokens", async () => {
    await program.methods
      .transferSplTokens(new anchor.BN(100))
      .accounts({
        authority: provider.wallet.payer.publicKey,
        sourceTokenAccount: auxiliaryTokenAccount.address,
        splTokenProgram: TOKEN_PROGRAM_ID,
      })
      .remainingAccounts(
        [
          {pubkey: receiverATA.address, isWritable: true, isSigner: false}
        ]
      )
      .signers([provider.wallet.payer])
      .rpc();
    // // Verify the transfer
  });
});
