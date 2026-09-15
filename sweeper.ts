import {
  createPublicClient,
  createWalletClient,
  http,
  formatUnits,
  parseUnits,
  Address,
  Hex,
} from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import dotenv from "dotenv";

dotenv.config();

// ============================================================================
// 1. CONFIGURATION & NETWORK SELECTION
// ============================================================================
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ACTIVE_CHAIN = IS_PRODUCTION ? base : baseSepolia;

// Base Mainnet vs Base Sepolia Contract Registry
const SWAP_ROUTER_ADDRESS: Address = IS_PRODUCTION
  ? "0x2626664c2603336E57B271c5C0b26F421741e481" // Uniswap SwapRouter02 (Base Mainnet)
  : "0x94cC0AaC535CCDB3C01d6787d6413C739ae12bc4"; // Uniswap SwapRouter02 (Base Sepolia)

const USDC_ADDRESS: Address = IS_PRODUCTION
  ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // Base Mainnet USDC
  : "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC

const CBBTC_ADDRESS: Address = IS_PRODUCTION
  ? "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf" // Coinbase Wrapped BTC (Base Mainnet)
  : "0x4200000000000000000000000000000000000006"; // WETH / Testnet mock on Sepolia

// Cold Reserve Destination Vault
const COLD_STORAGE_VAULT: Address = (process.env.COLD_STORAGE_VAULT as Address) || "0xEf6Ba235fBEc45DD62Ae6911356730417242eE5e";

// Execution Threshold: Minimum $5.00 USDC in vault before triggering swap
const SWEEP_THRESHOLD_USDC = 5.0;
const POOL_FEE_TIER = 500; // 0.05% fee pool (standard for USDC/cbBTC)

// Vault Private Key (Operator account holding the accumulated toll USDC)
let rawKey = process.env.VAULT_PRIVATE_KEY;
if (!rawKey || !rawKey.startsWith("0x") || rawKey.length !== 66) {
  rawKey = generatePrivateKey();
}
const vaultAccount = privateKeyToAccount(rawKey as Hex);

// ============================================================================
// 2. CHAIN CLIENTS & RPC SETUP
// ============================================================================
const RPC_URL = process.env.RPC_URL || (IS_PRODUCTION ? "https://mainnet.base.org" : "https://sepolia.base.org");

const publicClient = createPublicClient({
  chain: ACTIVE_CHAIN,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  account: vaultAccount,
  chain: ACTIVE_CHAIN,
  transport: http(RPC_URL),
});

// ============================================================================
// 3. MINIMAL ABI INTERFACES
// ============================================================================
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

const SWAP_ROUTER_ABI = [
  {
    name: "exactInputSingle",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
] as const;

// ============================================================================
// 4. CORE 80/20 UNISWAP V3 SWEEPER LOGIC
// ============================================================================

async function execute8020Swap(amountInUSDC: bigint) {
  try {
    console.log(`\n[INVARIANT ENGAGED] Initiating Uniswap V3 on-chain conversion...`);
    console.log(`-> Swap Amount: $${formatUnits(amountInUSDC, 6)} USDC`);
    console.log(`-> Route: USDC (${USDC_ADDRESS}) -> cbBTC (${CBBTC_ADDRESS})`);
    console.log(`-> Recipient: ${COLD_STORAGE_VAULT}`);

    // 1. Check & Update ERC20 Allowance for SwapRouter
    const currentAllowance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [vaultAccount.address, SWAP_ROUTER_ADDRESS],
    });

    if (currentAllowance < amountInUSDC) {
      console.log(`[APPROVAL REQUIRED] Granting Uniswap Router allowance...`);
      const approveTx = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [SWAP_ROUTER_ADDRESS, amountInUSDC * 10n],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTx });
      console.log(`[APPROVAL CONFIRMED] Tx: ${approveTx}`);
    }

    // 2. Execute exactInputSingle Swap
    // Note: In high-volume production, calculate amountOutMinimum via QuoterV2 for slippage control
    const swapParams = {
      tokenIn: USDC_ADDRESS,
      tokenOut: CBBTC_ADDRESS,
      fee: POOL_FEE_TIER,
      recipient: COLD_STORAGE_VAULT,
      amountIn: amountInUSDC,
      amountOutMinimum: 0n, // Relaxed for automated micro-swaps; set > 0 for slippage limits
      sqrtPriceLimitX96: 0n,
    };

    const swapTx = await walletClient.writeContract({
      address: SWAP_ROUTER_ADDRESS,
      abi: SWAP_ROUTER_ABI,
      functionName: "exactInputSingle",
      args: [swapParams],
    });

    console.log(`[SWAP BROADCASTED] Tx Hash: ${swapTx}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: swapTx });
    console.log(`[SWAP SETTLED] Block ${receipt.blockNumber} (Status: ${receipt.status})\n`);
  } catch (err: any) {
    console.error(`[SWAP ERROR]:`, err.message);
  }
}

async function checkAndSweep() {
  try {
    const rawBalance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [vaultAccount.address],
    });

    const balanceUSDC = parseFloat(formatUnits(rawBalance, 6));
    const now = new Date().toLocaleTimeString();

    console.log(`[${now}] Vault Balance: $${balanceUSDC.toFixed(4)} USDC | Threshold: $${SWEEP_THRESHOLD_USDC.toFixed(2)}`);

    if (balanceUSDC >= SWEEP_THRESHOLD_USDC) {
      // 80% converted to cbBTC reserve; 20% preserved for operational compute/gas
      const swapAmount = (rawBalance * 80n) / 100n;
      const bufferAmount = rawBalance - swapAmount;

      console.log(`==================================================`);
      console.log(`[THRESHOLD MET] Executing 80/20 Solomon Allocation:`);
      console.log(`-> Retaining 20%: $${formatUnits(bufferAmount, 6)} USDC (Operational Buffer)`);
      console.log(`-> Sweeping  80%: $${formatUnits(swapAmount, 6)} USDC -> cbBTC`);
      console.log(`==================================================`);

      await execute8020Swap(swapAmount);
    }
  } catch (error: any) {
    console.error(`[DAEMON POLLING WARNING]:`, error.message);
  }
}

// ============================================================================
// 5. START SWEEPER DAEMON
// ============================================================================
console.log("==================================================");
console.log("TERABITHIA SOLOMON'S VAULT: ON-CHAIN UNISWAP SWEEPER");
console.log(`[OPERATOR ADDRESS] ${vaultAccount.address}`);
console.log(`[TARGET NETWORK]   ${ACTIVE_CHAIN.name} (${ACTIVE_CHAIN.id})`);
console.log(`[COLD DESTINATION] ${COLD_STORAGE_VAULT}`);
console.log(`[SWEEP INVARIANT]  80% cbBTC / 20% USDC Buffer`);
console.log("==================================================");

// Poll every 15 seconds
setInterval(checkAndSweep, 15000);
checkAndSweep();
