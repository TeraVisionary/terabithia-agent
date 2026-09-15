import fetch from "node-fetch";

const BUYER_IDENTIFIER = "0xF000Ce5AF974876124c348376f8B3099C8876511";
const FACILITATOR_URL = "http://localhost:4020/clear";

async function discoverAndPurchaseNode(manifestUrl: string) {
  console.log("==================================================");
  console.log("TERABITHIA: DISPATCHING AUTONOMOUS SWARM BUYER");
  console.log(`[BUYER IDENTIFIER] ${BUYER_IDENTIFIER}`);
  console.log(`[DISCOVERY PROBE] Interrogating target manifest: ${manifestUrl}`);
  console.log("==================================================");

  if (!manifestUrl.startsWith("http://") && !manifestUrl.startsWith("https://")) {
    throw new Error(`Only absolute URLs are supported. Received: ${manifestUrl}`);
  }

  const res = await fetch(manifestUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch manifest: HTTP ${res.status}`);
  }

  const manifest: any = await res.json();
  const endpointBase = manifest.agentIdentity.endpointBase;
  
  console.log(`[NODE DISCOVERED] ${manifest.agentIdentity.name}`);
  console.log(`[ENDPOINT BASE]   ${endpointBase}`);
  console.log(`[SKU COUNT]       ${manifest.capabilities.length} capabilities registered.\n`);

  for (const cap of manifest.capabilities) {
    console.log(`--------------------------------------------------`);
    console.log(`[EVALUATING SKU]  ${cap.sku} (${cap.name})`);
    console.log(`[PRICE]           $${cap.priceUSDC} USDC (${cap.atomicUnits} atomic units)`);
    
    const targetUrl = cap.path.startsWith("http") ? cap.path : `${endpointBase}${cap.path}`;
    console.log(`[TARGET URL]      ${targetUrl}`);

    // 1. Send initial request to trigger x402 challenge
    const probeRes = await fetch(targetUrl, {
      method: cap.type || "GET",
      headers: { "Content-Type": "application/json" },
      ...(cap.type === "POST" ? { body: JSON.stringify({ prompt: "Autonomous swarm intelligence query", contractSource: "contract SecureVault { mapping(address => uint) balances; }" }) } : {})
    });

    if (probeRes.status === 402) {
      const challenge: any = await probeRes.json();
      console.log(`[x402 HANDSHAKE] Challenge received. Requesting facilitator clearance...`);

      // 2. Request clearance from Universal x402 Facilitator
      const clearRes = await fetch(FACILITATOR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentRequirements: challenge.accepts[0],
          buyerAddress: BUYER_IDENTIFIER
        })
      });

      if (!clearRes.ok) {
        throw new Error(`Facilitator clearance failed: HTTP ${clearRes.status}`);
      }

      const clearance: any = await clearRes.json();
      console.log(`[SETTLEMENT CONFIRMED] Cleared on Base (Tx: ${clearance.txHash})`);

      // 3. Request final fulfillment with X-PAYMENT header
      console.log(`[FULFILLMENT] Requesting asset deliverable with cryptographic proof...`);
      const fulfillmentRes = await fetch(targetUrl, {
        method: cap.type || "GET",
        headers: {
          "Content-Type": "application/json",
          "X-PAYMENT": JSON.stringify(clearance)
        },
        ...(cap.type === "POST" ? { body: JSON.stringify({ prompt: "Autonomous swarm intelligence query", contractSource: "contract SecureVault { mapping(address => uint) balances; }" }) } : {})
      });

      const deliverable: any = await fulfillmentRes.json();
      console.log(`[GATEWAY STATUS] HTTP ${fulfillmentRes.status}`);
      console.log("[ASSET DELIVERED SUCCESSFULLY]:");
      console.log(JSON.stringify(deliverable, null, 2));
    } else {
      const data = await probeRes.text();
      console.log("[INFO] Non-402 response:", data);
    }
  }
}

const targetManifest = process.argv[2] || "https://slot-note-fisher-thank.trycloudflare.com/.well-known/agent-manifest.json";
discoverAndPurchaseNode(targetManifest).catch((err) => {
  console.error("[ERROR] Swarm buyer execution failed:", err.message);
  process.exit(1);
});
