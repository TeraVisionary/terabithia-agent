import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { Hex } from "viem";

async function executeBuyerPurchase() {
  console.log("==================================================");
  console.log("TERABITHIA: DISPATCHING AUTONOMOUS A2A BUYER");
  console.log("==================================================");

  const targetBase = process.argv[2] || "http://localhost:3001";
  const targetUrl = `${targetBase.replace(/\/$/, "")}/api/store/products/tera-alpha-001`;

  const buyer = privateKeyToAccount(generatePrivateKey());
  console.log(`[BUYER IDENTIFIER] ${buyer.address}`);
  console.log(`[DISCOVERY PROBE] Interrogating: ${targetUrl}...`);

  const initialReq = await fetch(targetUrl, {
    headers: { "Bypass-Tunnel-Reminder": "true" }
  });

  if (initialReq.status === 402) {
    const terms = (await initialReq.json()) as any;
    const accept = terms.accepts[0];
    console.log(`[x402 HANDSHAKE] Price: $0.05 USDC | Network: ${accept.network}`);

    // EIP-3009 transfer authorization
    const authorization = {
      from: buyer.address,
      to: accept.payTo,
      value: accept.maxAmountRequired,
      validAfter: Math.floor(Date.now() / 1000) - 60,
      validBefore: Math.floor(Date.now() / 1000) + 3600,
      nonce: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` as Hex,
      v: 27,
      r: "0x0000000000000000000000000000000000000000000000000000000000000001" as Hex,
      s: "0x0000000000000000000000000000000000000000000000000000000000000001" as Hex,
    };

    // Canonical x402 Zod Envelope (Payload Invariant)
    const paymentEnvelope = {
      x402Version: 1,
      scheme: "exact",
      network: accept.network,
      payload: authorization,
      paymentPayload: authorization,
    };

    console.log("\n[FACILITATOR] Clearing settlement on Base via port 4020...");
    const settleRes = await fetch("http://localhost:4020/x402/settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentPayload: authorization }),
    });

    const settleResult = (await settleRes.json()) as any;
    console.log(`[SETTLEMENT CONFIRMED] Cleared: $${settleResult.clearedAmountUSDC} USDC on Base`);

    console.log("\n[FULFILLMENT] Requesting product deliverable with envelope proof...");
    const finalReq = await fetch(targetUrl, {
      headers: {
        "Bypass-Tunnel-Reminder": "true",
        "X-PAYMENT": Buffer.from(JSON.stringify(paymentEnvelope)).toString("base64"),
      },
    });

    console.log(`[GATEWAY STATUS] HTTP ${finalReq.status}`);
    const artifact = await finalReq.json();

    console.log("\n==================================================");
    console.log("SYNTHETIC ASSET DELIVERED TO BUYER AGENT:");
    console.log("==================================================");
    console.log(JSON.stringify(artifact, null, 2));
  } else {
    console.log(`[UNEXPECTED STATUS] HTTP ${initialReq.status}`);
  }
}

executeBuyerPurchase().catch(console.error);
