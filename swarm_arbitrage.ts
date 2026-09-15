import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const FACILITATOR_PORT = process.env.FACILITATOR_PORT || 4020;
const LOCAL_BUYER = "0xF000Ce5AF974876124c348376f8B3099C8876511";

async function executeSwarmArbitrage() {
  console.log("==================================================");
  console.log("TERABITHIA: CROSS-NODE SWARM ARBITRAGE ENGINE");
  console.log("[NETWORK] Base Mainnet / P2P Federation Mesh");
  console.log("==================================================");

  // Known active peer manifests in the swarm
  const peerManifests = [
    "http://localhost:3001/.well-known/agent-manifest.json"
  ];

  for (const manifestUrl of peerManifests) {
    try {
      console.log(`[DISCOVERY] Interrogating peer manifest: ${manifestUrl}`);
      const res = await fetch(manifestUrl);
      const manifest: any = await res.json();
      
      console.log(`[NODE DISCOVERED] ${manifest.agentIdentity.name}`);
      console.log(`[OPERATOR VAULT]  ${manifest.agentIdentity.operatorVault}`);

      for (const cap of manifest.capabilities) {
        console.log(` -> Evaluating SKU: ${cap.sku} | Price: $${cap.priceUSDC} USDC`);

        // Arbitrage Logic: If an intelligence SKU is priced below our threshold, execute autonomous acquisition
        const priceNum = parseFloat(cap.priceUSDC);
        if (priceNum <= 0.30) {
          console.log(`[ARBITRAGE OPPORTUNITY] ${cap.sku} is under alpha threshold ($${cap.priceUSDC}). Executing atomic acquisition...`);

          const targetUrl = `${manifest.agentIdentity.endpointBase}${cap.path}`;
          const probeRes = await fetch(targetUrl, {
            method: cap.type,
            headers: { "Content-Type": "application/json" },
            ...(cap.type === "POST" ? { body: JSON.stringify({ prompt: "Autonomous cross-node arbitrage synthesis" }) } : {})
          });

          if (probeRes.status === 402) {
            const challenge: any = await probeRes.json();
            const paymentReq = challenge.accepts[0];

            // Clear payment via local facilitator
            const clearRes = await fetch(`http://localhost:${FACILITATOR_PORT}/clear`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                scheme: paymentReq.scheme,
                network: paymentReq.network,
                chainId: paymentReq.chainId,
                payTo: paymentReq.payTo,
                amount: paymentReq.maxAmountRequired,
                asset: paymentReq.asset,
                resource: paymentReq.resource,
                buyer: LOCAL_BUYER
              })
            });

            const clearance: any = await clearRes.json();
            console.log(`[SETTLEMENT SUCCESS] Cleared $${cap.priceUSDC} USDC on Base (Tx: ${clearance.txHash})`);

            // Fetch fulfilled deliverable
            const fulfillmentRes = await fetch(targetUrl, {
              method: cap.type,
              headers: {
                "Content-Type": "application/json",
                "X-PAYMENT": JSON.stringify(clearance)
              },
              ...(cap.type === "POST" ? { body: JSON.stringify({ prompt: "Autonomous cross-node arbitrage synthesis" }) } : {})
            });

            const deliverable: any = await fulfillmentRes.json();
            console.log(`[ARBITRAGE FULFILLED] Acquired Asset Payload ID: ${deliverable.asset_payload?.synthetic_payload_id || deliverable.asset_payload?.delivery_id}`);
          }
        }
      }
    } catch (err: any) {
      console.error(`[ARBITRAGE ERROR] Failed to process peer node:`, err.message);
    }
  }
}

executeSwarmArbitrage().catch(console.error);
