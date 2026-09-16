import { createServer } from 'http';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || process.env.STORE_PORT || 4020;

const server = createServer((req, res) => {
  if (req.url === '/.well-known/agent-manifest.json' || req.url === '/manifest') {
    try {
      const manifest = fs.readFileSync('./agent-manifest.json', 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(manifest);
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: "Manifest broadcast error" }));
      return;
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    system: "TERABITHIA_A2A_MESH",
    status: "ONLINE",
    broadcast_route: "/.well-known/agent-manifest.json",
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, () => {
  console.log(`[TERABITHIA BROADCAST GATEWAY] Operational on port ${PORT}`);
});
