import fetch from "node-fetch";

const NODE_URL = process.argv[2] || "https://warner-uniform-hub-bowl.trycloudflare.com";
const FACILITATOR_URL = "http://localhost:4020";

async function runCodeSimulation() {
  console.log("==================================================");
  console.log("TERABITHIA: DISPATCHING LIVE TUNNEL CODE AGENT");
  console.log("==================================================");

  const prompt = "Write a high-performance cross-chain arbitrage router in TypeScript";
  console.log(`[PROMPT SUBMISSION] Target: ${NODE_URL}/api/store/generate`);
  console.log(`[PROMPT CONTENT] "${prompt}"`);

  // 1. Initial discovery probe (Expect HTTP 402 Payment Required)
  const probeResponse = await fetch(`${NODE_URL}/api/store/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (probeResponse.status === 402) {
    const challenge: any = await probeResponse.json();
    console.log(`[x402 HANDSHAKE] Challenge received. Price: $0.10 USDC | Network: base`);

    const paymentRequirement = challenge.accepts[0];

    // 2. Clear payment via local facilitator on port 4020
    console.log(`[FACILITATOR] Clearing $0.10 USDC settlement on Base via port 4020...`);
    const clearanceRes = await fetch(`${FACILITATOR_URL}/clear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payTo: paymentRequirement.payTo,
        amount: paymentRequirement.maxAmountRequired,
        asset: paymentRequirement.asset,
        chainId: paymentRequirement.chainId,
      }),
    });

    const clearance: any = await clearanceRes.json();
    console.log(`[SETTLEMENT CONFIRMED] Cleared: $0.10 USDC on Base (Tx: ${clearance.txHash})`);

    // 3. Re-submit request with X-PAYMENT authorization header
    console.log(`[FULFILLMENT] Requesting synthesized code deliverable through public tunnel...`);
    const fulfillmentRes = await fetch(`${NODE_URL}/api/store/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PAYMENT": JSON.stringify(clearance),
      },
      body: JSON.stringify({ prompt }),
    });

    const deliverable: any = await fulfillmentRes.json();
    console.log(`[GATEWAY STATUS] HTTP ${fulfillmentRes.status}`);
    console.log("==================================================");
    console.log("SYNTHESIZED CODE MODULE DELIVERED VIA CLOUDFLARE TUNNEL:");
    console.log("==================================================");
    console.log(JSON.stringify(deliverable, null, 2));
  } else {
    const data = await probeResponse.text();
    console.log("[ERROR] Unexpected response:", data);
  }
}

runCodeSimulation().catch(console.error);
