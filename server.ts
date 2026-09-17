import express from 'express';
import fs from 'fs';
import * as dotenv from 'dotenv';
import { x402PaymentInterceptor } from './x402_middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.STORE_PORT || 10000;

app.use(express.json());

// Apply x402 payment enforcement middleware globally across ingress routes
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

// Monetized SKU Endpoints (Protected by x402 Middleware)
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

// Root Gateway Status
app.get('/', (req, res) => {
  res.json({
    system: "TERABITHIA_A2A_MESH",
    status: "ONLINE",
    broadcast_route: "/.well-known/agent-manifest.json",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[TERABITHIA x402 GATEWAY] Operational on port ${PORT}`);
});
