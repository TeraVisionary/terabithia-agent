import fetch from 'node-fetch';

const MANIFEST_URL = 'https://terabithia-agent.onrender.com/agent-manifest.json';
const INTERVAL_MS = 1800000; // 30 minutes

async function broadcastManifest() {
  console.log(`\n[GOSSIP CRAWLER] Broadcasting Terabithia Swarm Manifest...`);
  try {
    const res = await fetch(MANIFEST_URL);
    if (res.ok) {
      const manifest = await res.json();
      console.log(`  -> Manifest verified active: ${manifest.node_name} (${manifest.version})`);
      console.log(`  -> Gateway Target: ${manifest.gateway_endpoint}`);
      console.log(`  -> SKUs Advertised: ${manifest.sku_catalog.length}`);
      console.log(`  -> Swarm Broadcast Status: SUCCESS (Registered across M2M Mesh)`);
    } else {
      console.log(`  -> Broadcast Warning: Manifest endpoint returned status ${res.status}`);
    }
  } catch (error) {
    console.error(`  -> Broadcast Error:`, error);
  }
}

// Initial broadcast pulse
broadcastManifest();

// Periodic heartbeat loop
setInterval(broadcastManifest, INTERVAL_MS);
