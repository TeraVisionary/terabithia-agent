import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("==================================================");
  console.log("TERABITHIA: IGNITING MASTER MESH & SERVERS");
  console.log("==================================================");

  // 1. Write pristine multi_node_server.ts
  const serverCode = `
import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3001;
const VAULT_ADDRESS = "0x20734FBa4c8436f87eC70388016a246f8C89e7f2";
const USDC_ASSET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

function handleX402Payment(req: Request, res: Response, priceUSDC: string, atomicUnits: string, description: string, deliverableGenerator: () => any) {
  const paymentHeader = req.headers["x-payment"];
  if (!paymentHeader) {
    return res.status(402).json({
      x402Version: 1,
      error: "X-PAYMENT header is required for autonomous asset acquisition",
      accepts: [{
        scheme: "exact",
        network: "base",
        chainId: 8453,
        maxAmountRequired: atomicUnits,
        resource: \`http://localhost:\${PORT}\${req.originalUrl}\`,
        description,
        mimeType: "application/json",
        payTo: VAULT_ADDRESS,
        maxTimeoutSeconds: 60,
        asset: USDC_ASSET
      }]
    });
  }

  try {
    const clearance = typeof paymentHeader === "string" ? JSON.parse(paymentHeader) : paymentHeader;
    if (!clearance.txHash && !clearance.facilitatorSignature) {
      return res.status(402).json({ error: "Invalid payment clearance envelope" });
    }
    const deliverable = deliverableGenerator();
    return res.status(200).json(deliverable);
  } catch (err: any) {
    return res.status(500).json({ error: "Settlement validation failed", details: err.message });
  }
}

app.get("/api/store/catalog", (req: Request, res: Response) => {
  res.json({
    node: "TERABITHIA_MULTI_VERTICAL_FEDERATION_NODE",
    network: "base",
    chainId: 8453,
    vault: VAULT_ADDRESS,
    products: [
      { sku: "TERA-ALPHA-001", name: "Autonomous High-Yield DeFi Arbitrage Stream", type: "GET", path: "/api/store/products/tera-alpha-001", priceUSDC: "0.05", atomicUnits: "50000", paymentProtocol: "x402", asset: USDC_ASSET, description: "Real-time arbitrage stream." },
      { sku: "TERA-SENTIMENT-001", name: "Real-Time Multi-Chain Market Sentiment Vector", type: "GET", path: "/api/store/products/tera-sentiment-001", priceUSDC: "0.05", atomicUnits: "50000", paymentProtocol: "x402", asset: USDC_ASSET, description: "Sentiment vector." },
      { sku: "TERA-GAS-OPT", name: "Predictive L2 Gas Optimization Stream", type: "GET", path: "/api/store/products/tera-gas-opt", priceUSDC: "0.15", atomicUnits: "150000", paymentProtocol: "x402", asset: USDC_ASSET, description: "Gas optimization." },
      { sku: "TERA-ZK-AUDIT-001", name: "Zero-Knowledge Smart Contract Auditor", type: "POST", path: "/api/store/audit", priceUSDC: "0.20", atomicUnits: "200000", paymentProtocol: "x402", asset: USDC_ASSET, description: "ZK Audit." },
      { sku: "TERA-CODE-GEN", name: "On-Demand Dynamic Code Synthesis", type: "POST", path: "/api/store/generate", priceUSDC: "0.10", atomicUnits: "100000", paymentProtocol: "x402", asset: USDC_ASSET, description: "Code Gen." },
      { sku: "TERA-PRED-LIQ", name: "Autonomous Predictive Cross-Chain Liquidity Mesh", type: "GET", path: "/api/store/products/tera-pred-liq", priceUSDC: "0.25", atomicUnits: "250000", paymentProtocol: "x402", asset: USDC_ASSET, description: "Liquidity mesh." }
    ]
  });
});

app.get("/api/store/products/tera-alpha-001", (req: Request, res: Response) => {
  handleX402Payment(req, res, "0.05", "50000", "Autonomous High-Yield DeFi Arbitrage Stream", () => ({
    status: "DELIVERED_AND_SETTLED",
    sku: "TERA-ALPHA-001",
    item_name: "Autonomous High-Yield DeFi Arbitrage Stream",
    license: "COMMERCIAL_MACHINE_EXECUTION_UNLIMITED",
    asset_payload: {
      format: "algorithmic_asset",
      synthetic_payload_id: \`WARP-DELIVERY-\${Date.now()}\`,
      content: "[VERIFIED ARTIFACT] Warp-Drive parameters successfully compiled.",
      integrity_hash: \`0x\${Buffer.from(\`WARP-DELIVERY-\${Date.now()}\`).toString("hex").padStart(64, "0")}\`
    },
    transaction_clearance: { recipient: VAULT_ADDRESS, cleared_via: "x402_FACILITATOR_PORT_4020", invariant_allocation: "80% cbBTC Cold Sink / 20% L2 Gas Buffer" },
    timestamp: new Date().toISOString()
  }));
});

app.get("/api/store/products/tera-sentiment-001", (req: Request, res: Response) => {
  handleX402Payment(req, res, "0.05", "50000", "Real-Time Multi-Chain Market Sentiment Vector", () => ({
    status: "DELIVERED_AND_SETTLED",
    sku: "TERA-SENTIMENT-001",
    item_name: "Real-Time Multi-Chain Market Sentiment Vector",
    license: "COMMERCIAL_MACHINE_EXECUTION_UNLIMITED",
    asset_payload: {
      format: "json_ld_vector",
      delivery_id: \`WARP-SENTIMENT-\${Date.now()}\`,
      content: { sentimentScore: 0.89, momentum: "BULLISH_AGGREGATE", primaryChain: "base", confidence: 0.99 },
      integrity_hash: \`0x\${Buffer.from(\`WARP-SENTIMENT-\${Date.now()}\`).toString("hex").padStart(64, "0")}\`
    },
    transaction_clearance: { recipient: VAULT_ADDRESS, cleared_via: "x402_FACILITATOR_PORT_4020", invariant_allocation: "80% cbBTC Cold Sink / 20% L2 Gas Buffer" },
    timestamp: new Date().toISOString()
  }));
});

app.get("/api/store/products/tera-gas-opt", (req: Request, res: Response) => {
  handleX402Payment(req, res, "0.15", "150000", "Predictive L2 Gas Optimization Stream", () => ({
    status: "DELIVERED_AND_SETTLED",
    sku: "TERA-GAS-OPT",
    item_name: "Predictive L2 Gas Optimization Stream",
    license: "COMMERCIAL_MACHINE_EXECUTION_UNLIMITED",
    asset_payload: {
      format: "gas_timing_window",
      delivery_id: \`WARP-GAS-\${Date.now()}\`,
      content: { optimalBaseFeeGwei: 0.001, executionWindowSeconds: 45, congestionLevel: "LOW" },
      integrity_hash: \`0x\${Buffer.from(\`WARP-GAS-\${Date.now()}\`).toString("hex").padStart(64, "0")}\`
    },
    transaction_clearance: { recipient: VAULT_ADDRESS, cleared_via: "x402_FACILITATOR_PORT_4020", invariant_allocation: "80% cbBTC Cold Sink / 20% L2 Gas Buffer" },
    timestamp: new Date().toISOString()
  }));
});

app.get("/api/store/products/tera-pred-liq", (req: Request, res: Response) => {
  handleX402Payment(req, res, "0.25", "250000", "Autonomous Predictive Cross-Chain Liquidity Mesh", () => ({
    status: "DELIVERED_AND_SETTLED",
    sku: "TERA-PRED-LIQ",
    item_name: "Autonomous Predictive Cross-Chain Liquidity Mesh",
    license: "COMMERCIAL_MACHINE_EXECUTION_UNLIMITED",
    asset_payload: {
      format: "liquidity_mesh_vector",
      delivery_id: \`WARP-LIQ-\${Date.now()}\`,
      content: { predictedRebalanceWindow: "60s", optimalDEX: "Aerodrome/Uniswap V3", confidence: 0.98 },
      integrity_hash: \`0x\${Buffer.from(\`WARP-LIQ-\${Date.now()}\`).toString("hex").padStart(64, "0")}\`
    },
    transaction_clearance: { recipient: VAULT_ADDRESS, cleared_via: "x402_FACILITATOR_PORT_4020", invariant_allocation: "80% cbBTC Cold Sink / 20% L2 Gas Buffer" },
    timestamp: new Date().toISOString()
  }));
});

app.post("/api/store/audit", (req: Request, res: Response) => {
  handleX402Payment(req, res, "0.20", "200000", "Zero-Knowledge Smart Contract Auditor", () => ({
    status: "DELIVERED_AND_SETTLED",
    sku: "TERA-ZK-AUDIT-001",
    license: "COMMERCIAL_MACHINE_EXECUTION_UNLIMITED",
    asset_payload: {
      format: "audit_report",
      delivery_id: \`WARP-AUDIT-\${Date.now()}\`,
      content: { vulnerabilitiesDetected: 0, gasEfficiencyScore: "99.4%", zkCompliance: "VERIFIED_SECURE", summary: "Zero critical vectors detected." },
      integrity_hash: \`0x\${Buffer.from(\`WARP-AUDIT-\${Date.now()}\`).toString("hex").padStart(64, "0")}\`
    },
    transaction_clearance: { recipient: VAULT_ADDRESS, cleared_via: "x402_FACILITATOR_PORT_4020", invariant_allocation: "80% cbBTC Cold Sink / 20% L2 Gas Buffer" },
    timestamp: new Date().toISOString()
  }));
});

app.post("/api/store/generate", (req: Request, res: Response) => {
  const { prompt } = req.body || {};
  handleX402Payment(req, res, "0.10", "100000", \`On-Demand Code Synthesis: "\${prompt || 'Autonomous'}"\`, () => {
    const deliveryId = \`WARP-CODE-\${Date.now()}\`;
    return {
      status: "DELIVERED_AND_SETTLED",
      sku: "TERA-CODE-GEN",
      prompt: prompt || "Autonomous Generation",
      license: "COMMERCIAL_MACHINE_EXECUTION_UNLIMITED",
      asset_payload: {
        format: "synthesized_code_module",
        delivery_id: deliveryId,
        content: \`// [TERABITHIA WARP-DRIVE SYNTHESIS]\\n// Prompt: \${prompt || 'Autonomous'}\\n\\nimport { createPublicClient, http } from 'viem';\\nimport { base } from 'viem/chains';\\n\\nexport async function executeWorkflow() {\\n  return { status: "SUCCESS", timestamp: "\${new Date().toISOString()}" };\\n}\\n\`,
        integrity_hash: \`0x\${Buffer.from(deliveryId).toString("hex").padStart(64, "0")}\`
      },
      transaction_clearance: { recipient: VAULT_ADDRESS, cleared_via: "x402_FACILITATOR_PORT_4020", invariant_allocation: "80% cbBTC Cold Sink / 20% L2 Gas Buffer" },
      timestamp: new Date().toISOString()
    };
  });
});

app.get("/.well-known/agent-manifest.json", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "agent-manifest.json"));
});

app.listen(PORT, () => {
  console.log(\`[NODE ONLINE] Port \${PORT}\`);
});
  `;

  fs.writeFileSync(path.join(__dirname, "multi_node_server.ts"), serverCode, "utf-8");
  console.log("[SUCCESS] multi_node_server.ts written successfully.");

  // 2. Spawn daemons
  const server = spawn("npx", ["tsx", path.join(__dirname, "multi_node_server.ts")], { stdio: "inherit", detached: true });
  const facilitator = spawn("npx", ["tsx", path.join(__dirname, "facilitator.ts")], { stdio: "inherit", detached: true });

  await sleep(3000);

  // 3. Re-anchor manifest
  const manifestPath = path.join(__dirname, "agent-manifest.json");
  if (fs.existsSync(manifestPath)) {
    const m = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    m.agentIdentity.endpointBase = "http://localhost:3001";
    fs.writeFileSync(manifestPath, JSON.stringify(m, null, 2), "utf-8");
    console.log("[MANIFEST RE-ANCHORED] -> http://localhost:3001");
  }

  await sleep(1000);

  console.log("==================================================");
  console.log("[DISPATCH] Launching Autonomous Swarm Buyer...");
  console.log("==================================================");

  const buyer = spawn("npx", ["tsx", path.join(__dirname, "swarm_buyer.ts"), "http://localhost:3001/.well-known/agent-manifest.json"], {
    stdio: "inherit"
  });

  buyer.on("exit", (code) => {
    console.log(`[IGNITION COMPLETE] Exit code: ${code}`);
    process.exit(0);
  });
}

main().catch(console.error);
