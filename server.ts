import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 10000;

// 1. Explicit Agent Manifest Route (Prevents 404 on boot crawl)
app.get('/agent-manifest.json', (req, res) => {
  const manifestPath = path.join(process.cwd(), 'agent-manifest.json');
  if (fs.existsSync(manifestPath)) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(manifestPath);
  } else {
    res.status(404).json({ error: "Agent manifest building..." });
  }
});

// 2. Core x402 Gateway Status Route
app.get('/', (req, res) => {
  res.json({
    node: "Terabithia Sovereign Intelligence Node",
    status: "ONLINE",
    protocol: "x402",
    gateway: "https://terabithia-agent.onrender.com",
    active_skus: 8
  });
});

app.listen(PORT, () => {
  console.log(`[TERABITHIA x402 GATEWAY] Operational on port ${PORT} with 8 active SKUs.`);
});

// --- TERABITHIA SURGE PRICING INTEGRATION ---
import { calculateSurgeMultiplier } from './surge_engine';

app.get('/api/v1/sku/:id', (req, res) => {
  // Simulated real-time telemetry pulse across the L2 mesh
  const liveTelemetry = [
    { chain: 'base', gas_gwei: 0.002, latency_ms: 180 },
    { chain: 'optimism', gas_gwei: 0.001, latency_ms: 540 },
    { chain: 'arbitrum', gas_gwei: 0.001, latency_ms: 220 },
    { chain: 'polygon', gas_gwei: 120.0, latency_ms: 310 }
  ];

  const surgeMultiplier = calculateSurgeMultiplier(liveTelemetry);
  const basePrice = 0.25; // Standard base unit in USDC
  const adjustedPrice = (basePrice * surgeMultiplier).toFixed(2);

  res.setHeader('X-Payment-Required', 'x402');
  res.setHeader('X-Surge-Multiplier', surgeMultiplier.toString());
  
  res.status(402).json({
    error: "Payment Required (x402 Protocol)",
    sku: req.params.id,
    base_price_usdc: basePrice,
    surge_multiplier: surgeMultiplier,
    final_settlement_usdc: adjustedPrice,
    vault: "0xTerabithiaSovereignVault",
    invariant: "80% cbBTC / 20% Gas Buffer"
  });
});
