import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface FederationPeer {
  nodeName: string;
  chain: string;
  chainId: number;
  manifestUrl: string;
  activeIngress: string;
}

const PEER_REGISTRY_PATH = path.join(__dirname, "federation_registry.json");

const INITIAL_PEERS: FederationPeer[] = [
  {
    nodeName: "Terabithia Warp-Drive Synthesis Node",
    chain: "base",
    chainId: 8453,
    manifestUrl: "https://warner-uniform-hub-bowl.trycloudflare.com/.well-known/agent-manifest.json",
    activeIngress: "https://warner-uniform-hub-bowl.trycloudflare.com"
  }
];

async function broadcastAndSyncFederation() {
  console.log("==================================================");
  console.log("TERABITHIA: MULTI-CHAIN SWARM FEDERATION & MESH ONLINE");
  console.log("[NETWORK] Base Mainnet + Cross-L2 Interop Mesh");
  console.log("==================================================");

  // 1. Initialize or load registry
  let registry: FederationPeer[] = INITIAL_PEERS;
  if (fs.existsSync(PEER_REGISTRY_PATH)) {
    try {
      registry = JSON.parse(fs.readFileSync(PEER_REGISTRY_PATH, "utf-8"));
    } catch {
      registry = INITIAL_PEERS;
    }
  } else {
    fs.writeFileSync(PEER_REGISTRY_PATH, JSON.stringify(INITIAL_PEERS, null, 2));
  }

  console.log(`[FEDERATION MESH] Active Peer Nodes Registered: ${registry.length}`);

  for (const peer of registry) {
    console.log(`\n--------------------------------------------------`);
    console.log(`[INTERROGATING PEER] ${peer.nodeName}`);
    console.log(`[CHAIN]              ${peer.chain.toUpperCase()} (ChainID: ${peer.chainId})`);
    console.log(`[MANIFEST URL]       ${peer.manifestUrl}`);

    try {
      const res = await fetch(peer.manifestUrl);
      if (!res.ok) {
        console.warn(`[WARNING] Peer ingress unreachable: HTTP ${res.status}`);
        continue;
      }
      const manifest: any = await res.json();
      console.log(`[PEER STATUS]        ONLINE & RESPONSIVE`);
      console.log(`[SKU CAPACITY]       ${manifest.capabilities?.length || 0} active intelligence assets available.`);
      
      for (const cap of (manifest.capabilities || [])) {
        console.log(`  -> SKU: ${cap.sku} | Price: $${cap.priceUSDC} USDC | Path: ${cap.path}`);
      }
    } catch (err: any) {
      console.error(`[MESH ERROR] Failed to synchronize with peer ${peer.nodeName}:`, err.message);
    }
  }

  console.log("\n==================================================");
  console.log("[STATUS] Multi-chain swarm federation loop synchronized.");
  console.log("==================================================");
}

broadcastAndSyncFederation().catch(console.error);
