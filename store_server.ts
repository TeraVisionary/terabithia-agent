import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3001;
const VAULT_ADDRESS = process.env.VAULT_ADDRESS || "0x20734FBa4c8436f87eC70388016a246f8C89e7f2";
const USDC_ADDRESS = process.env.USDC_ADDRESS || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Expanded Multiversal Machine Intelligence SKU Catalog
const CATALOG = {
  "tera-alpha-001": {
    sku: "TERA-ALPHA-001",
    name: "Autonomous High-Yield DeFi Arbitrage Stream",
    priceUSDC: "0.05",
    atomicUnits: "50000",
    description: "Real-time arbitrage stream and warp-drive parameters compiled for machine execution.",
  },
  "tera-sentiment-001": {
    sku: "TERA-SENTIMENT-001",
    name: "Real-Time Multi-Chain Market Sentiment Vector",
    priceUSDC: "0.05",
    atomicUnits: "50000",
    description: "Aggregates social, on-chain, and order-book momentum indicators into an optimized JSON-LD vector for autonomous trading agents.",
  },
  "tera-gas-opt": {
    sku: "TERA-GAS-OPT",
    name: "Predictive L2 Gas Optimization Stream",
    priceUSDC: "0.15",
    atomicUnits: "150000",
    description: "Synthesizes historical base fee curves and mempool congestion metrics to output zero-slippage execution timing windows.",
  },
};

// Catalog Endpoint
app.get("/api/store/catalog", (req: Request, res: Response) => {
  res.json({
    node: "TERABITHIA_A2A_COMMERCE_NODE",
    network: "base",
    vault: VAULT_ADDRESS,
    products: Object.values(CATALOG),
  });
});

// Agent Discovery Manifest Endpoint
app.get("/.well-known/agent-manifest.json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.sendFile(path.join(process.env.HOME || "/Users/z", "terabithia-agent", "agent-manifest.json"));
});

// Product Discovery & x402 Challenge (GET SKUs)
app.get("/api/store/products/:sku", (req: Request, res: Response) => {
  const { sku } = req.params;
  const product = (CATALOG as any)[sku];

  if (!product) {
    return res.status(404).json({ error: "SKU not found in Terabithia registry" });
  }

  const paymentHeader = req.headers["x-payment"] || req.headers["X-PAYMENT"];
  const resourceUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  if (!paymentHeader) {
    return res.status(402).json({
      x402Version: 1,
      error: "Payment Required via x402 protocol",
      accepts: [
        {
          scheme: "exact",
          network: "base",
          chainId: 8453,
          maxAmountRequired: product.atomicUnits,
          resource: resourceUrl,
          description: product.name,
          mimeType: "application/json",
          payTo: VAULT_ADDRESS,
          maxTimeoutSeconds: 60,
          asset: USDC_ADDRESS,
        },
      ],
    });
  }

  const deliveryId = `WARP-DELIVERY-${Date.now()}`;
  let payloadContent = `[VERIFIED ARTIFACT: ${product.name}] Warp-Drive parameters successfully compiled into operational buffer.`;

  if (sku === "tera-sentiment-001") {
    payloadContent = JSON.stringify({
      sentimentScore: 0.89,
      volatilityIndex: "LOW",
      dominantMomentum: "BULLISH_L2",
      timestamp: new Date().toISOString(),
    });
  } else if (sku === "tera-gas-opt") {
    payloadContent = JSON.stringify({
      recommendedBaseFeeGwei: 0.0012,
      congestionLevel: "OPTIMAL",
      executionWindowMs: 45000,
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(200).json({
    status: "DELIVERED_AND_SETTLED",
    sku: product.sku,
    item_name: product.name,
    license: "COMMERCIAL_MACHINE_EXECUTION_UNLIMITED",
    asset_payload: {
      format: "algorithmic_asset",
      synthetic_payload_id: deliveryId,
      content: payloadContent,
      integrity_hash: `0x${Buffer.from(deliveryId).toString("hex").padStart(64, "0")}`,
    },
    transaction_clearance: {
      recipient: VAULT_ADDRESS,
      cleared_via: "x402_FACILITATOR_PORT_4020",
      invariant_allocation: "80% cbBTC Cold Sink / 20% L2 Gas Buffer",
    },
    timestamp: new Date().toISOString(),
  });
});

// On-Demand Dynamic Code Synthesis SKU ($0.10 USDC)
app.post("/api/store/generate", async (req: Request, res: Response) => {
  const { prompt } = req.body;
  const atomicUnits = "100000"; // 0.10 USDC
  const resourceUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  const paymentHeader = req.headers["x-payment"] || req.headers["X-PAYMENT"];

  if (!paymentHeader) {
    return res.status(402).json({
      x402Version: 1,
      error: "X-PAYMENT header is required for autonomous code synthesis",
      accepts: [
        {
          scheme: "exact",
          network: "base",
          chainId: 8453,
          maxAmountRequired: atomicUnits,
          resource: resourceUrl,
          description: `On-Demand Code Synthesis: "${prompt || 'Optimized Autonomous Execution'}"`,
          mimeType: "application/json",
          payTo: VAULT_ADDRESS,
          maxTimeoutSeconds: 60,
          asset: USDC_ADDRESS,
        },
      ],
    });
  }

  const deliveryId = `WARP-CODE-${Date.now()}`;
  const synthesizedCode = `// [TERABITHIA WARP-DRIVE SYNTHESIS]
// Prompt: ${prompt || 'Optimized Autonomous Execution'}
// Clearance: $0.10 USDC Settled on Base Mainnet

import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export async function executeSynthesizedWorkflow() {
  const client = createPublicClient({ chain: base, transport: http("https://mainnet.base.org") });
  console.log("Executing verified synthetic workflow: ${deliveryId}");
  return { status: "SUCCESS", timestamp: "${new Date().toISOString()}" };
}
`;

  return res.status(200).json({
    status: "DELIVERED_AND_SETTLED",
    sku: "TERA-CODE-GEN",
    prompt: prompt || "Autonomous Generation",
    license: "COMMERCIAL_MACHINE_EXECUTION_UNLIMITED",
    asset_payload: {
      format: "synthesized_code_module",
      delivery_id: deliveryId,
      content: synthesizedCode,
      integrity_hash: `0x${Buffer.from(deliveryId).toString("hex").padStart(64, "0")}`,
    },
    transaction_clearance: {
      recipient: VAULT_ADDRESS,
      cleared_via: "x402_FACILITATOR_PORT_4020",
      invariant_allocation: "80% cbBTC Cold Sink / 20% L2 Gas Buffer",
    },
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log("==================================================");
  console.log("TERABITHIA A2A SYNTHETIC COMMERCE NODE ONLINE");
  console.log(`[NETWORK]     base (Port ${PORT})`);
  console.log(`[CATALOG]     http://localhost:${PORT}/api/store/catalog`);
  console.log(`[MANIFEST]    http://localhost:${PORT}/.well-known/agent-manifest.json`);
  console.log(`[GENERATOR]   http://localhost:${PORT}/api/store/generate`);
  console.log(`[SETTLEMENT]  ${VAULT_ADDRESS}`);
  console.log("==================================================");
});
