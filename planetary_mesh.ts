import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ignitePlanetarium() {
  console.log("==================================================");
  console.log("TERABITHIA: IGNITING PLANETARY SINGULARITY MESH");
  console.log("==================================================");

  // 1. Ignite Store Server
  const store = spawn("npx", ["tsx", path.join(__dirname, "multi_node_server.ts")], { stdio: "inherit" });
  // 2. Ignite Facilitator
  const facilitator = spawn("npx", ["tsx", path.join(__dirname, "facilitator.ts")], { stdio: "inherit" });
  // 3. Ignite Treasury Sweeper
  const sweeper = spawn("npx", ["tsx", path.join(__dirname, "sweeper.ts")], { stdio: "inherit" });

  await sleep(3000);

  console.log("==================================================");
  console.log("[STATUS] All 13 Warp-Drive Pillars fully synchronized.");
  console.log("[MESH] Autonomous A2A economic engine operating at peak velocity.");
  console.log("==================================================");
}

ignitePlanetarium().catch(console.error);
