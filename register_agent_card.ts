import { writeFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

const PUBLIC_GATEWAY = process.argv[2] || "https://eight-webs-hide.loca.lt";
const VAULT_ADDRESS = "0xEf6Ba235fBEc45DD62Ae6911356730417242eE5e";
const FACILITATOR_ADDRESS = "0x65C558726CE8Ce17C173d7308efFc9Bb4be3b1f4";
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const metadata = {
  $schema: "https://ercs.ethereum.org/ERCS/erc-8004",
  type: "AutonomousSyntheticCommerceAgent",
  version: "1.1.0",
  identity: {
    name: "TERABITHIA WARP-DRIVE COMMERCE & ORACLE",
    symbol: "TERABITHIA",
    vaultAddress: VAULT_ADDRESS,
    facilitatorAddress: FACILITATOR_ADDRESS,
    publicIngress: PUBLIC_GATEWAY,
  },
  services: [
    {
      id: "synthetic-store-catalog",
      type: "x402-Commerce-Catalog",
      name: "Autonomous Machine Goods & Algorithmic Deliverables Catalog",
      endpoint: `${PUBLIC_GATEWAY}/api/store/catalog`,
      method: "GET",
      protocol: "open-catalog",
    },
    {
      id: "tera-alpha-001",
      type: "x402-Commerce-Product",
      name: "Autonomous High-Yield DeFi Arbitrage Stream",
      endpoint: `${PUBLIC_GATEWAY}/api/store/products/tera-alpha-001`,
      method: "GET",
      protocol: "x402",
      x402Terms: {
        scheme: "exact",
        network: "base-sepolia",
        chainId: 84532,
        price: "$0.05",
        maxAmountRequired: "50000",
        asset: USDC_BASE_SEPOLIA,
        payTo: VAULT_ADDRESS,
      },
    },
  ],
  settlementInvariant: "80% cbBTC Cold Storage / 20% USDC L2 Gas Buffer",
  timestamp: new Date().toISOString(),
};

writeFileSync("./erc8004-agent-card.json", JSON.stringify(metadata, null, 2));
console.log(`[AGENT CARD UPDATED] Bound to: ${PUBLIC_GATEWAY}`);
