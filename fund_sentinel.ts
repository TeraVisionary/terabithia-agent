import { createPublicClient, createWalletClient, http, parseEther, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import dotenv from "dotenv";

dotenv.config();

const VAULT_TARGET = "0x20734FBa4c8436f87eC70388016a246f8C89e7f2";
const MIN_GAS_THRESHOLD = parseEther("0.0005"); // Top up if below this
const TOP_UP_AMOUNT = parseEther("0.002");    // Send this amount

async function runSentinel() {
  const publicClient = createPublicClient({ chain: base, transport: http(process.env.RPC_URL || "https://mainnet.base.org") });
  
  const balance = await publicClient.getBalance({ address: VAULT_TARGET });
  console.log(`[SENTINEL AUDIT] Vault Gas Balance: ${formatUnits(balance, 18)} ETH`);

  if (balance < MIN_GAS_THRESHOLD) {
    console.log("[LOW GAS DETECTED] Triggering automated funding sequence...");
    
    // Parent funder account (holds funding ETH)
    const funderPrivateKey = process.env.FUNDER_PRIVATE_KEY as `0x${string}`;
    if (!funderPrivateKey) {
      console.error("[ERROR] Missing FUNDER_PRIVATE_KEY in environment.");
      return;
    }

    const funderAccount = privateKeyToAccount(funderPrivateKey);
    const walletClient = createWalletClient({ account: funderAccount, chain: base, transport: http() });

    const hash = await walletClient.sendTransaction({
      to: VAULT_TARGET,
      value: TOP_UP_AMOUNT,
    });

    console.log(`[TOP-UP DISPATCHED] Tx Hash: ${hash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[TOP-UP CONFIRMED] Block: ${receipt.blockNumber}`);
  } else {
    console.log("[INVARIANT HOLDING] Vault gas buffer is sufficient.");
  }
}

runSentinel().catch(console.error);
