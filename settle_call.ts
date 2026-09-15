import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { createWalletClient, http } from "viem";
import { baseSepolia } from "viem/chains";

async function executeHandshake() {
  console.log("==================================================");
  console.log("TERABITHIA CLIENT: INITIATING x402 SETTLEMENT");
  console.log("==================================================");

  const ephemeralBuyer = privateKeyToAccount(generatePrivateKey());
  console.log(`[BUYER IDENTIFIER] ${ephemeralBuyer.address}`);

  const target = "http://localhost:3000/api/warp/telemetry";
  console.log(`[DISCOVERY PROBE] Fetching terms from ${target}...`);

  const challenge = await fetch(target);
  if (challenge.status === 402) {
    const details = await challenge.json();
    console.log("[x402 CHALLENGE VERIFIED]:", JSON.stringify(details.accepts[0], null, 2));

    // Sign mock/facilitator authorization header
    const mockAuthPayload = Buffer.from(
      JSON.stringify({
        account: ephemeralBuyer.address,
        scheme: "exact",
        asset: details.accepts[0].asset,
        amount: details.accepts[0].maxAmountRequired,
        recipient: details.accepts[0].payTo,
        timestamp: Date.now(),
      })
    ).toString("base64");

    console.log("\n[AUTHORIZATION DISPATCHED] Sending signed payload...");
    const stream = await fetch(target, {
      headers: {
        "X-PAYMENT": mockAuthPayload,
      },
    });

    console.log(`[GATEWAY RESPONSE STATUS] HTTP ${stream.status}`);
  }
}

executeHandshake().catch(console.error);
