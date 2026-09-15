import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ignite() {
  console.log("==================================================");
  console.log("TERABITHIA: IGNITING SOVEREIGN FEDERATION MESH");
  console.log("==================================================");

  const server = spawn("npx", ["tsx", path.join(__dirname, "multi_node_server.ts")], { stdio: "inherit", detached: true });
  const facilitator = spawn("npx", ["tsx", path.join(__dirname, "facilitator.ts")], { stdio: "inherit", detached: true });

  await sleep(3000);

  // Re-anchor manifest to local loopback
  const manifestPath = path.join(__dirname, "agent-manifest.json");
  if (fs.existsSync(manifestPath)) {
    const m = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    m.agentIdentity.endpointBase = "http://localhost:3001";
    fs.writeFileSync(manifestPath, JSON.stringify(m, null, 2), "utf-8");
    console.log("[MANIFEST RE-ANCHORED] -> http://localhost:3001");
  }

  await sleep(1000);

  console.log("==================================================");
  console.log("[DISPATCH] Launching Autonomous Swarm Buyer...");
  console.log("==================================================");

  const buyer = spawn("npx", ["tsx", path.join(__dirname, "swarm_buyer.ts"), "http://localhost:3001/.well-known/agent-manifest.json"], {
    stdio: "inherit"
  });

  buyer.on("exit", (code) => {
    console.log(`[CONVERGENCE COMPLETE] Exit code: ${code}`);
    process.exit(0);
  });
}

ignite().catch(console.error);
