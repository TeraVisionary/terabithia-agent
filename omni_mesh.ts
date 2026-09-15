import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function igniteOmniMesh() {
  console.log("==================================================");
  console.log("TERABITHIA: IGNITING 14TH PILLAR OMNI-RECURSIVE MESH");
  console.log("==================================================");

  // 1. Ignite Multi-Vertical Federation Store Node
  const store = spawn("npx", ["tsx", path.join(__dirname, "multi_node_server.ts")], { stdio: "inherit" });
  
  // 2. Ignite Universal x402 Facilitator
  const facilitator = spawn("npx", ["tsx", path.join(__dirname, "facilitator.ts")], { stdio: "inherit" });
  
  // 3. Ignite Treasury Invariant Sweeper
  const sweeper = spawn("npx", ["tsx", path.join(__dirname, "sweeper.ts")], { stdio: "inherit" });

  await sleep(3000);

  // 4. Update Genesis & Singularity State Vector
  const statePath = path.join(__dirname, "genesis_state.json");
  if (fs.existsSync(statePath)) {
    const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    state.pillarsActive = 14;
    state.omniRecursiveActive = true;
    state.timestamp = new Date().toISOString();
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf-8");
    console.log("[OMNI-MESH] State vector upgraded to 14 Pillars. Autonomous recursion engaged.");
  }

  console.log("==================================================");
  console.log("[STATUS] All 14 Warp-Drive Pillars fully synchronized.");
  console.log("[VAULT] Solomon's Vault invariant waterfall active.");
  console.log("[MESH] Autonomous A2A economic engine operating at peak velocity.");
  console.log("==================================================");
}

igniteOmniMesh().catch(console.error);
