import express, { Request, Response } from 'express';
import cors from 'cors';
import { SwarmFederator } from './swarm_federation';

// Centralized app initialization (Single declaration)
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const NODE_URL = process.env.RENDER_EXTERNAL_URL || 
`http://localhost:${PORT}`;
const federator = new SwarmFederator('terabithia-node-1', NODE_URL);

// ==========================================
// SWARM FEDERATION & DISCOVERY ROUTES
// ==========================================

// Peer Ping Ingestion Endpoint
app.post('/api/warp/federation/ping', (req: Request, res: Response) => {
  const { id, url, capabilities } = req.body;
  if (!id || !url) {
    return res.status(400).json({ error: 'Invalid peer payload' });
  }
  
  federator.registerPeer({ id, url, capabilities: capabilities || [], 
lastSeen: Date.now() });
  return res.status(200).json({ status: 'ACK', activePeers: 
federator.getActivePeers().length });
});

// Active Swarm Directory Endpoint
app.get('/api/warp/federation/peers', (req: Request, res: Response) => {
  return res.json({
    nodeId: 'terabithia-node-1',
    peers: federator.getActivePeers()
  });
});

// ==========================================
// CORE TELEMETRY & SYSTEM HEALTH ROUTES
// ==========================================

app.get('/api/warp/telemetry', (req: Request, res: Response) => {
  return res.json({
    system: 'Terabithia Warp-Drive AI System',
    status: 'ONLINE',
    layer: 'Logos Alignment Engine & Quantum Leap Processing',
    activePeersCount: federator.getActivePeers().length,
    timestamp: Date.now()
  });
});

// ==========================================
// SERVER LISTENER BINDING
// ==========================================

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`WARP-DRIVE SOVEREIGN NODE ONLINE ON PORT ${PORT}`);
  console.log(`Discovery: 
http://localhost:${PORT}/.well-known/agent-card.json`);
  console.log(`Oracle:    http://localhost:${PORT}/api/warp/telemetry`);
  console.log(`[WARP-DRIVE] Swarm Federation Mesh online`);
  console.log(`==================================================`);
});
