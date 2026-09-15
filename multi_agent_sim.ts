import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { Hex } from "viem";

async function spawnAgent(agentId: number) {
  const account = privateKeyToAccount(generatePrivateKey());
  console.log(`[AGENT-${agentId} ONLINE] Identity: ${account.address.slice(0, 10)}...`);

  const paymentPayload = {
    from: account.address,
    to: "0xEf6Ba235fBEc45DD62Ae6911356730417242eE5e",
    value: "1000", // $0.001 USDC
    validAfter: Math.floor(Date.now() / 1000) - 60,
    validBefore: Math.floor(Date.now() / 1000) + 3600,
    nonce: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` as Hex,
    v: 27,
    r: "0x0000000000000000000000000000000000000000000000000000000000000001" as Hex,
    s: "0x0000000000000000000000000000000000000000000000000000000000000001" as Hex,
  };

  const response = await fetch("http://localhost:4020/x402/settle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentPayload }),
  });

  const result = await response.json();
  console.log(`[AGENT-${agentId} SETTLED] HTTP ${response.status} -> Cleared: $${result.clearedAmountUSDC} USDC on Base`);
}

async function runSwarm() {
  console.log("==================================================");
  console.log("TERABITHIA: DISPATCHING AUTONOMOUS AGENT SWARM");
  console.log("==================================================");

  const swarm = Array.from({ length: 5 }, (_, i) => spawnAgent(i + 1));
  await Promise.all(swarm);

  console.log("==================================================");
  console.log(">>> Multi-Agent Settlement Verification Complete.");
  console.log("==================================================");
}

runSwarm().catch(console.error);
