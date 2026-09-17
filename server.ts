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
