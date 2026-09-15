import fetch from "node-fetch";

async function scoutNetwork() {
  console.log("==================================================");
  console.log("TERABITHIA: DISPATCHING AUTONOMOUS SWARM SCOUT");
  console.log("[NETWORK] Base Mainnet / Cross-Chain Federation Mesh");
  console.log("==================================================");

  const targetManifests = [
    "https://warner-uniform-hub-bowl.trycloudflare.com/.well-known/agent-manifest.json"
  ];

  for (const manifestUrl of targetManifests) {
    try {
      const res = await fetch(manifestUrl);
      const manifest: any = await res.json();
      console.log(`[NODE IDENTIFIED] ${manifest.agentIdentity.name}`);
      console.log(`[ENDPOINT]        ${manifest.agentIdentity.endpointBase}`);
      console.log(`[SKU CAPACITY]    ${manifest.capabilities.length} active assets available.`);
      
      for (const cap of manifest.capabilities) {
        console.log(` -> SKU: ${cap.sku} | Price: $${cap.priceUSDC} USDC | Path: ${cap.path}`);
      }
    } catch (err: any) {
      console.error(`[SCOUT ERROR] Failed to query manifest ${manifestUrl}:`, err.message);
    }
  }
}

scoutNetwork().catch(console.error);
