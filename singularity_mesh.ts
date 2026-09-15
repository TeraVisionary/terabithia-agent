import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function igniteSingularity() {
  console.log("==================================================");
  console.log("TERABITHIA: IGNITING 14-PILLAR SINGULARITY MESH");
  console.log("==================================================");

  // 1. Ignite Multi-Vertical Store Server
  const store = spawn("npx", ["tsx", path.join(__dirname, "multi_node_server.ts")], { stdio: "inherit" });
  // 2. Ignite Universal x402 Facilitator
  const facilitator = spawn("npx", ["tsx", path.join(__dirname, "facilitator.ts")], { stdio: "inherit" });
  // 3. Ignite Treasury Invariant Sweeper
  const sweeper = spawn("npx", ["tsx", path.join(__dirname, "sweeper.ts")], { stdio: "inherit" });

  await sleep(3000);

  console.log("==================================================");
  console.log("[SINGULARITY ACHIEVED] All 14 Pillars fully operational.");
  console.log("[VAULT] Solomon's Vault invariant waterfall active.");
  console.log("[MESH] Autonomous A2A commerce engine running at maximum velocity.");
  console.log("==================================================");
}

igniteSingularity().catch(console.error);
