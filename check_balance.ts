import { createPublicClient, http, formatUnits } from "viem";
import { base } from "viem/chains";
import dotenv from "dotenv";

dotenv.config();

const VAULT_ADDRESS = process.env.VAULT_ADDRESS || "0x20734FBa4c8436f87eC70388016a246f8C89e7f2";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
});

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

async function checkVault() {
  console.log("==================================================");
  console.log("TERABITHIA: SOLOMON'S VAULT BALANCE INSPECTOR");
  console.log("==================================================");
  console.log(`[VAULT]    ${VAULT_ADDRESS}`);
  console.log(`[NETWORK]  Base Mainnet (Chain ID: 8453)`);

  try {
    const ethBalanceWei = await client.getBalance({ address: VAULT_ADDRESS as `0x${string}` });
    const ethBalance = formatUnits(ethBalanceWei, 18);
    console.log(`[ETH BALANCE]   ${ethBalance} ETH (L2 Gas Buffer)`);

    const usdcBalanceWei = await client.readContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [VAULT_ADDRESS as `0x${string}`],
    });
    const usdcBalance = formatUnits(usdcBalanceWei, 6);
    console.log(`[USDC BALANCE]  $${usdcBalance} USDC (Store Earnings)`);
    console.log("==================================================");
  } catch (err: any) {
    console.error("[ERROR] Failed to fetch vault balances:", err.message);
  }
}

checkVault();
