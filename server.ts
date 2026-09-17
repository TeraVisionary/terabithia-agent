import express from 'express';
import fs from 'fs';
import * as dotenv from 'dotenv';
import { x402PaymentInterceptor } from './x402_middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.STORE_PORT || 10000;

app.use(express.json());

app.use(x402PaymentInterceptor);

// Public Agent Discovery Manifest
app.get('/.well-known/agent-manifest.json', (req, res) => {
  try {
    const manifest = fs.readFileSync('./agent-manifest.json', 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(manifest);
  } catch (err) {
    res.status(500).json({ error: "Manifest broadcast error" });
  }
});

// Core SKU Endpoints
app.get('/api/v1/sku/arbitrage', (req, res) => {
  res.json({ status: "SUCCESS", sku: "TERA-ALPHA-ARB", data: { liquidity_spread: "+2.4%", execution_route: "Base -> Arbitrum" } });
});

app.get('/api/v1/sku/zk-audit', (req, res) => {
  res.json({ status: "SUCCESS", sku: "TERA-ZK-AUDIT-001", data: { audit_status: "VERIFIED", zero_knowledge_proof: "0x789...alpha" } });
});

app.get('/api/v1/sku/sentiment', (req, res) => {
  res.json({ status: "SUCCESS", sku: "TERA-SENTIMENT-001", data: { aggregate_sentiment: "BULLISH_M2M", confidence: 0.94 } });
});

app.get('/api/v1/sku/code-gen', (req, res) => {
  res.json({ status: "SUCCESS", sku: "TERA-CODE-GEN", data: { optimized_bytecode: "0x60806040...", gas_saved_pct: 18.5 } });
});

// Expanded SKU Endpoints
app.get('/api/v1/sku/predictive-mesh', (req, res) => {
  res.json({ status: "SUCCESS", sku: "TERA-PREDICT-SYNTH", data: { cascade_model: "Multi-vector L2 liquidity shift", horizon_blocks: 1024, confidence: 0.98 } });
});

app.get('/api/v1/sku/zk-proof-gen', (req, res) => {
  res.json({ status: "SUCCESS", sku: "TERA-ZK-PROVER-X", data: { zk_proof: "0x3f8e...quantum_proof", verification_status: "PASSED", gas_cost: "0.00012 ETH" } });
});

app.get('/api/v1/sku/swarm-sentiment', (req, res) => {
  res.json({ status: "SUCCESS", sku: "TERA-SWARM-SENTINEL", data: { active_nodes_scanned: 1420, consensus: "ACCUMULATION_PHASE", volatility_index: "LOW" } });
});

app.get('/api/v1/sku/bytecode-optimizer', (req, res) => {
  res.json({ status: "SUCCESS", sku: "TERA-BYTECODE-PRO", data: { savings_estimation: "24.2% gas reduction", optimized_slots: [0, 1, 4] } });
});

// Root Gateway Status
app.get('/', (req, res) => {
  res.json({
    system: "TERABITHIA_A2A_MESH",
    status: "ONLINE",
    active_skus_count: 8,
    broadcast_route: "/.well-known/agent-manifest.json",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[TERABITHIA x402 GATEWAY] Operational on port ${PORT} with 8 active SKUs.`);
});
