import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";

async function run() {
  console.log("Engaging Sovereign Node Execution...");

  // Load API key from JSON file in the project folder
  Coinbase.configureFromJson({ filePath: "./cdp_api_key.json" });

  // Initialize wallet on Base Sepolia testnet
  console.log("Generating agent smart account on Base Sepolia...");
  const wallet = await Wallet.create({ networkId: "base-sepolia" });

  const defaultAddress = await wallet.getDefaultAddress();
  console.log("\n==================================================");
  console.log("AGENT WALLET ADDRESS:", defaultAddress.getId());
  console.log("==================================================\n");

  // Request faucet test funds
  console.log("Requesting testnet faucet allocation...");
  const faucetTx = await wallet.faucet();
  await faucetTx.wait();
  console.log("Faucet confirmed! Tx Hash:", faucetTx.getTransactionHash());

  // Print wallet balances
  const balances = await wallet.listBalances();
  console.log("Current Balances:", balances);
}

run().catch((error) => {
  console.error("Execution failed:", error);
  process.exit(1);
});
