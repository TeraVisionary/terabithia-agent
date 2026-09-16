import express, { Request, Response } from 'express';
import cors from 'cors';
import { SwarmFederator } from './swarm_federation';
import { createX402PaymentGate } from './x402_gate';

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const NODE_URL = process.env.RENDER_EXTERNAL_URL || 
`http://localhost:${PORT}`;
const federator = new SwarmFederator('terabithia-node-1', NODE_URL);

// Configure x402 payment gate (e.g., $0.001 USDC per query routed to your 
sovereign wallet)
const sovereignWallet = process.env.SOVEREIGN_WALLET_ADDRESS || 
'0xYourBaseWalletAddressHere';
const x402Gate = createX402PaymentGate({
  amountUSDC: '0.001',
  recipientWallet: sovereignWallet,
  network: 'base-mainnet'
});

// ==========================================
// OPEN DISCOVERY ROUTES (Free Mesh Handshake)
// ==========================================

app.post('/api/warp/federation/ping', (req: Request, res: Response) => {
  const { id, url, capabilities } = req.body;
  if (!id || !url) return res.status(400).json({ error: 'Invalid peer 
payload' });
  
  federator.registerPeer({ id, url, capabilities: capabilities || [], 
lastSeen: Date.now() });
  return res.status(200).json({ status: 'ACK', activePeers: 
federator.getActivePeers().length });
});

app.get('/api/warp/federation/peers', (req: Request, res: Response) => {
  return res.json({ nodeId: 'terabithia-node-1', peers: 
federator.getActivePeers() });
});

// ==========================================
// MONETIZED X402 A2A INTELLIGENCE ENDPOINTS
// ==========================================

// Premium Telemetry & Deep Synthesis (Gated by x402)
app.get('/api/warp/telemetry', x402Gate, (req: Request, res: Response) => 
{
  return res.json({
    system: 'Terabithia Warp-Drive AI System',
    status: 'ONLINE',
    layer: 'Logos Alignment Engine & Quantum Leap Processing',
    activePeersCount: federator.getActivePeers().length,
    settlementLayer: 'Base L2 x402 Active',
    timestamp: Date.now()
  });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[WARP-DRIVE] Sovereign Node online with x402 payment gating 
on port ${PORT}`);
});
