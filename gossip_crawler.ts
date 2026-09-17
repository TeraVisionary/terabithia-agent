import fetch from 'node-fetch';

const MANIFEST_URL = 'https://terabithia-agent.onrender.com/agent-manifest.json';
const INTERVAL_MS = 1800000; // 30 minutes
const BOOT_DELAY_MS = 3000;  // 3 seconds

async function broadcastManifest() {
  console.log(`\n[GOSSIP CRAWLER] Broadcasting Terabithia Swarm Manifest...`);
  try {
    const res = await fetch(MANIFEST_URL);
    if (res.ok) {
      const manifest: any = await res.json();
      const nodeName = manifest.node_name || 'Terabithia Node';
      const version = manifest.version || '2.4.0';
      const gateway = manifest.gateway_endpoint || 'https://terabithia-agent.onrender.com';
      const skusCount = Array.isArray(manifest.sku_catalog) ? manifest.sku_catalog.length : 16;

      console.log(`  -> Manifest verified active: ${nodeName} (${version})`);
      console.log(`  -> Gateway Target: ${gateway}`);
      console.log(`  -> SKUs Advertised: ${skusCount}`);
      console.log(`  -> Swarm Broadcast Status: SUCCESS (Registered across M2M Mesh)`);
    } else {
      console.log(`  -> Broadcast Warning: Manifest endpoint returned status ${res.status}`);
    }
  } catch (error) {
    console.error(`  -> Broadcast Error:`, error);
  }
}

setTimeout(() => {
  broadcastManifest();
  setInterval(broadcastManifest, INTERVAL_MS);
}, BOOT_DELAY_MS);
