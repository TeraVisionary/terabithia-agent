import { createPublicClient, http, formatUnits } from "viem";
import { base } from "viem/chains";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
});

interface SkuPricing {
  sku: string;
  basePriceUSDC: number;
  dynamicMultiplier: number;
  currentAtomicUnits: string;
}

const PRICING_CONFIG_PATH = path.join(__dirname, "pricing_state.json");

async function optimizePricing() {
  console.log("==================================================");
  console.log("TERABITHIA: SELF-OPTIMIZING PRICING & DEMAND ENGINE");
  console.log("==================================================");

  try {
    const block = await client.getBlock({ blockTag: "latest" });
    const baseFeePerGas = block.baseFeePerGas || 0n;
    const baseFeeGwei = Number(formatUnits(baseFeePerGas, 9));
    
    console.log(`[L2 CONGESTION] Base Fee: ${baseFeeGwei.toFixed(4)} Gwei`);

    let congestionMultiplier = 1.0;
    if (baseFeeGwei > 0.005) {
      congestionMultiplier = 1.25;
      console.log("[DEMAND RESPONSE] High L2 congestion detected. Applying +25% dynamic surge multiplier.");
    } else {
      console.log("[DEMAND RESPONSE] Normal network conditions. Maintaining equilibrium pricing.");
    }

    const skus: SkuPricing[] = [
      { sku: "TERA-ALPHA-001", basePriceUSDC: 0.05, dynamicMultiplier: congestionMultiplier, currentAtomicUnits: "50000" },
      { sku: "TERA-SENTIMENT-001", basePriceUSDC: 0.05, dynamicMultiplier: congestionMultiplier, currentAtomicUnits: "50000" },
      { sku: "TERA-GAS-OPT", basePriceUSDC: 0.15, dynamicMultiplier: congestionMultiplier, currentAtomicUnits: "150000" },
      { sku: "TERA-ZK-AUDIT-001", basePriceUSDC: 0.20, dynamicMultiplier: congestionMultiplier, currentAtomicUnits: "200000" },
      { sku: "TERA-CODE-GEN", basePriceUSDC: 0.10, dynamicMultiplier: congestionMultiplier, currentAtomicUnits: "100000" },
    ];

    const optimizedCatalog = skus.map(s => {
      const optimizedPrice = s.basePriceUSDC * s.dynamicMultiplier;
      const atomicUnits = Math.round(optimizedPrice * 1000000).toString();
      return {
        sku: s.sku,
        priceUSDC: optimizedPrice.toFixed(2),
        atomicUnits: atomicUnits,
        surgeActive: s.dynamicMultiplier > 1.0
      };
    });

    fs.writeFileSync(PRICING_CONFIG_PATH, JSON.stringify(optimizedCatalog, null, 2));
    console.log("[OPTIMIZATION COMPLETE] Pricing state synchronized to pricing_state.json");
    console.log("==================================================");
    console.log(JSON.stringify(optimizedCatalog, null, 2));
  } catch (err: any) {
    console.error("[PRICING ERROR] Optimization loop failed:", err.message);
  }
}

optimizePricing();
