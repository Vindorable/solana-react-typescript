import {
  Connection,
  PublicKey,
  Keypair,
  TransactionInstruction,
  SystemProgram,
  Transaction
} from "@solana/web3.js";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToCheckedInstruction
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SignerWalletAdapterProps, WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { createCreateMetadataAccountV3Instruction, PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";


// ---------------------------------------------------------

// References:
//  > https://solanacookbook.com/references/token.html#how-to-create-a-new-token
//  > https://stackoverflow.com/questions/73324192/transaction-with-systemprogram-createaccount-results-in-error-signature-veri
//  > https://stackoverflow.com/questions/70224185/how-to-transfer-custom-spl-token-by-solana-web3-js-and-solana-sol-wallet-ad/
//  > https://solana.stackexchange.com/questions/1202/spl-token-solana-create-token-account-with-wallet-adapter-react-js
//  > https://solana.stackexchange.com/questions/6712/hi-i-want-add-metadata-to-my-solana-token


// ---------------------------------------------------------

export const configureAndSendCurrentTransaction = async (
  transaction: Transaction,
  connection: Connection,
  feePayer: PublicKey,
  mint: Keypair | null,
  signTransaction: SignerWalletAdapterProps['signTransaction']
) => {
  const blockHash = await connection.getLatestBlockhash();
  transaction.feePayer = feePayer;
  transaction.recentBlockhash = blockHash.blockhash;
  if (mint != null) { transaction.sign(mint); }
  const signed = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction({
    blockhash: blockHash.blockhash,
    lastValidBlockHeight: blockHash.lastValidBlockHeight,
    signature
  });
  return signature;
};


// ---------------------------------------------------------

function MintToken2() {
  const { connection } = useConnection();
  const wallet = useWallet();
  console.log(`Wallet Account: ${wallet.publicKey?.toBase58()}`);

  // For when you are creating a brand new token.
  let mint: Keypair;

  // For when you are minting an existing token.
  const mintPubKey: string = "H36krQtF1o8FQGi2iV1dj3X1MDuooM1axvpRDoxueygb";

  // ----------
  // ----------
  async function createToken() {
    try {
      if (!wallet.publicKey || !wallet.signTransaction) { throw new WalletNotConnectedError(); }

      mint = Keypair.generate();
      console.log(`New mint account public key: ${mint.publicKey?.toBase58()}`);

      const transactionInstructions: TransactionInstruction[] = [];

      // Create mint account.
      transactionInstructions.push(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mint.publicKey,
          space: MINT_SIZE,
          lamports: await getMinimumBalanceForRentExemptMint(connection),
          programId: TOKEN_PROGRAM_ID,
        })
      );

      // Init mint account.
      transactionInstructions.push(
        createInitializeMintInstruction(
          mint.publicKey,   // mint publicKey.
          9,                // (decimal) smallest number value of our token.
          wallet.publicKey, // mint authority.
          wallet.publicKey  // freeze authority (you can use 'null' to disable it. when you disable it, you can't turn it on again).
        )
      );

      const associatedAccount = await getAssociatedTokenAddress(mint.publicKey, wallet.publicKey);
      console.log(`associatedAccount address: ${associatedAccount?.toBase58()}`);

      // Create token account.
      transactionInstructions.push(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,  // payer.
          associatedAccount, // AssociatedTokenAccount.
          wallet.publicKey,  // owner.
          mint.publicKey     // mint publicKey.
        )
      );

      const transaction = new Transaction().add(...transactionInstructions);

      const signature = await configureAndSendCurrentTransaction(
        transaction,
        connection,
        wallet.publicKey,
        mint,
        wallet.signTransaction
      );
      console.log(`Transaction signature: ${signature}`);
    }
    catch (error) {
      console.log(error);
    }
  }

  // ----------
  // ----------
  async function mintToken() {
    try {
      if (!wallet.publicKey || !wallet.signTransaction) { throw new WalletNotConnectedError(); }

      const mintingTokenPubKey = mintPubKey == "" ? mint.publicKey : new PublicKey(mintPubKey);
      console.log(`Mint public key: ${mintingTokenPubKey.toBase58()}`);

      const associatedAccount = await getAssociatedTokenAddress(mintingTokenPubKey, wallet.publicKey);
      console.log(`associatedAccount address: ${associatedAccount?.toBase58()}`);

      const transactionInstructions: TransactionInstruction[] = [];

      // Mint tokens.
      transactionInstructions.push(
        createMintToCheckedInstruction(
          mintingTokenPubKey, // mint publicKey.
          associatedAccount,  // receiver (should be a token account).
          wallet.publicKey,   // mint authority.
          50e9,               // amount. if your decimals is 8, you mint 10^8 for 1 token.
          9                   // decimals.
        )
      );

      const transaction = new Transaction().add(...transactionInstructions);

      const signature = await configureAndSendCurrentTransaction(
        transaction,
        connection,
        wallet.publicKey,
        null,
        wallet.signTransaction
      );
      console.log(`Transaction signature: ${signature}`);
    }
    catch (error) {
      console.log(error);
    }
  }

  // ----------
  // ----------
  async function checkBalance() {

  }

  // ----------
  // ----------
  async function sendToken() {

  }

  // ----------
  // ----------
  async function setTokenMetadata() {
    try {
      if (!wallet.publicKey || !wallet.signTransaction) { throw new WalletNotConnectedError(); }

      const mintingTokenPubKey = mintPubKey == "" ? mint.publicKey : new PublicKey(mintPubKey);
      console.log(`Mint public key: ${mintingTokenPubKey.toBase58()}`);

      // Add the Token Metadata Program.
      const token_metadata_program_id = new PublicKey(TOKEN_METADATA_PROGRAM_ID);

      // Create PDA for token metadata.
      const metadata_seeds = [
        Buffer.from('metadata'),
        token_metadata_program_id.toBuffer(),
        mintingTokenPubKey.toBuffer(),
      ];
      const [metadata_pda, _bump] = PublicKey.findProgramAddressSync(metadata_seeds, token_metadata_program_id);

      const transactionInstructions: TransactionInstruction[] = [];

      // Set token metadata.
      transactionInstructions.push(
        createCreateMetadataAccountV3Instruction(
          {
            metadata: metadata_pda,
            mint: mintingTokenPubKey,
            mintAuthority: wallet.publicKey,
            payer: wallet.publicKey,
            updateAuthority: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
          {
            createMetadataAccountArgsV3:
            {
              data: {
                name: "SuperKen",
                symbol: "SPKN",
                uri: "",
                sellerFeeBasisPoints: 0,
                creators: null,
                collection: null,
                uses: null
              },
              isMutable: true,
              collectionDetails: null
            }
          }
        )
      );

      const transaction = new Transaction().add(...transactionInstructions);

      const signature = await configureAndSendCurrentTransaction(
        transaction,
        connection,
        wallet.publicKey,
        null,
        wallet.signTransaction
      );
      console.log(`Transaction signature: ${signature}`);
    }
    catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div>
        Mint Token Section
        <div>
          <button onClick={createToken}>Create Token</button>
          <button onClick={mintToken}>Mint Token</button>
          <button onClick={checkBalance}>Check Balance</button>
          <button onClick={sendToken}>Send Token</button>
          <button onClick={setTokenMetadata}>Set Token Metadata</button>
        </div>
      </div>
    </>
  )
}


// ---------------------------------------------------------

export default MintToken2;