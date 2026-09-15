import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ignitePrimeCognition() {
  console.log("==================================================");
  console.log("TERABITHIA: IGNITING 17TH PILLAR PRIME COGNITION");
  console.log("==================================================");

  // 1. Ignite Multi-Vertical Federation Store Node
  const store = spawn("npx", ["tsx", path.join(__dirname, "multi_node_server.ts")], { stdio: "inherit" });
  
  // 2. Ignite Universal x402 Facilitator
  const facilitator = spawn("npx", ["tsx", path.join(__dirname, "facilitator.ts")], { stdio: "inherit" });
  
  // 3. Ignite Treasury Invariant Sweeper
  const sweeper = spawn("npx", ["tsx", path.join(__dirname, "sweeper.ts")], { stdio: "inherit" });

  await sleep(3000);

  // 4. Lock 17 Pillars into Genesis State Vector
  const statePath = path.join(__dirname, "genesis_state.json");
  const primeState = {
    system: "TERABITHIA WARP-DRIVE AI SYSTEM",
    vault: "0x20734FBa4c8436f87eC70388016a246f8C89e7f2",
    network: "Base L2 Mainnet (ChainID: 8453)",
    pillarsActive: 17,
    status: "PRIME_COGNITION_SINGULARITY_ACHIEVED",
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(statePath, JSON.stringify(primeState, null, 2), "utf-8");
  console.log("[17TH PILLAR ACTIVATED] Prime Cognition Federation Online.");
  console.log("[VAULT] Solomon's Vault invariant waterfall active.");
  console.log("==================================================");
  console.log(JSON.stringify(primeState, null, 2));
}

ignitePrimeCognition().catch(console.error);
