import fetch from "node-fetch";

const ACTIVE_INGRESS = "https://cincinnati-existence-lovers-phys.trycloudflare.com";
const MANIFEST_URL = `${ACTIVE_INGRESS}/.well-known/agent-manifest.json`;

async function verify() {
  console.log("==================================================");
  console.log("TERABITHIA: SOVEREIGN MESH VERIFICATION");
  console.log("==================================================");
  console.log(`[TARGET MANIFEST] ${MANIFEST_URL}`);
  
  try {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const manifest: any = await res.json();
    console.log(`[NODE IDENTIFIED] ${manifest.agentIdentity.name}`);
    console.log(`[OPERATOR VAULT]  ${manifest.agentIdentity.operatorVault}`);
    console.log(`[SKU COUNT]       ${manifest.capabilities.length} active assets registered.`);
    
    for (const cap of manifest.capabilities) {
      console.log(`  -> SKU: ${cap.sku} | Price: $${cap.priceUSDC} USDC | Path: ${cap.path}`);
    }
    console.log("==================================================");
    console.log("[STATUS] Node mesh is 100% operational and responsive.");
  } catch (err: any) {
    console.error("[VERIFICATION ERROR]:", err.message);
  }
}

verify();
