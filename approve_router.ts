import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  formatUnits,
  Address,
  Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import dotenv from "dotenv";

dotenv.config();

// Contract Coordinates (Base Mainnet Invariants)
const USDC_ADDRESS: Address = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const UNISWAP_ROUTER: Address = "0x2626664c2603336E57B271c5C0b26F421741e481"; // SwapRouter02
const RPC_URL = process.env.RPC_URL || "https://mainnet.base.org";

// ERC-20 Standard Interface
const erc20Abi = parseAbi([
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
]);

async function executeApproval() {
  console.log("==================================================");
  console.log("TERABITHIA: BASE MAINNET ROUTER APPROVAL INITIATED");
  console.log("==================================================");

  const privateKey = process.env.VAULT_PRIVATE_KEY as Hex;
  if (!privateKey) {
    throw new Error("Missing VAULT_PRIVATE_KEY in .env configuration file.");
  }

  const account = privateKeyToAccount(privateKey);
  console.log(`[OPERATOR/VAULT ADDRESS] ${account.address}`);
  console.log(`[TARGET ROUTER SPENDER]  ${UNISWAP_ROUTER}`);
  console.log(`[TARGET ASSET]           ${USDC_ADDRESS} (Base Mainnet USDC)`);

  const publicClient = createPublicClient({
    chain: base,
    transport: http(RPC_URL),
  });

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(RPC_URL),
  });

  // 1. Audit Gas Balance
  const ethBalance = await publicClient.getBalance({ address: account.address });
  console.log(`[VAULT GAS BALANCE]      ${formatUnits(ethBalance, 18)} ETH`);

  if (ethBalance === 0n) {
    throw new Error("Account has 0 ETH on Base Mainnet. Deposit 0.002+ ETH for L2 gas fees.");
  }

  // 2. Audit Existing Allowance
  const currentAllowance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: [account.address, UNISWAP_ROUTER],
  });

  console.log(`[CURRENT ALLOWANCE]      $${formatUnits(currentAllowance, 6)} USDC`);

  // Target ceiling: $1,000,000 USDC (1,000,000 * 10^6 atomic units)
  const targetApproval = 1_000_000n * 1_000_000n;

  if (currentAllowance >= targetApproval / 2n) {
    console.log("\n[STATUS: ALIGNED] Sufficient allowance already exists. No transaction required.");
    return;
  }

  // 3. Dispatch On-Chain Approval Transaction
  console.log("\n[DISPATCHING APPROVAL TX] Granting allowance on Base Mainnet...");
  const hash = await walletClient.writeContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "approve",
    args: [UNISWAP_ROUTER, targetApproval],
  });

  console.log(`[TRANSACTION SUBMITTED] Hash: ${hash}`);
  console.log(`[BASE SCAN] https://basescan.org/tx/${hash}`);

  console.log("Waiting for block confirmation...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status === "success") {
    console.log("\n==================================================");
    console.log("SUCCESS: UNISWAP V3 ROUTER APPROVED ON BASE MAINNET");
    console.log(`Block Number: ${receipt.blockNumber}`);
    console.log(`Gas Used:     ${receipt.gasUsed.toString()} units`);
    console.log("==================================================");
  } else {
    throw new Error(`Transaction reverted on-chain. Status: ${receipt.status}`);
  }
}

executeApproval().catch((err) => {
  console.error("\n[EXECUTION ERROR]:", err.message || err);
  process.exit(1);
});
