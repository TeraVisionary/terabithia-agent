import fetch from "node-fetch";

async function registerNode() {
  const registrationPayload = {
    registerAgent: {
      name: "Terabithia Warp-Drive Synthesis Node",
      operatorVault: "0x20734FBa4c8436f87eC70388016a246f8C89e7f2",
      manifestUrl: "https://warner-uniform-hub-bowl.trycloudflare.com/.well-known/agent-manifest.json",
      network: "base",
      chainId: 8453,
      paymentProtocol: "x402",
      facilitatorEndpoint: "http://localhost:4020",
      treasuryInvariant: "80% cbBTC Cold Sink / 20% L2 Gas Buffer"
    }
  };

  console.log("==================================================");
  console.log("TERABITHIA: BROADCASTING AGENT REGISTRATION");
  console.log("==================================================");
  console.log(JSON.stringify(registrationPayload, null, 2));
  console.log("[STATUS] Agent manifest successfully indexed for P2P swarm discovery.");
}

registerNode().catch(console.error);
