import { spawn, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runOrchestration() {
  console.log("==================================================");
  console.log("TERABITHIA: WARP-DRIVE ORCHESTRATOR ENGAGED");
  console.log("==================================================");

  // 1. Purge existing ports and daemons
  try {
    execSync("lsof -ti :3001,4020 | xargs kill -9 2>/dev/null");
    execSync("killall cloudflared 2>/dev/null");
  } catch (e) {}

  console.log("[DAEMONS] Purged stale processes.");

  // 2. Start store server and facilitator
  const storeProcess = spawn("npx", ["tsx", path.join(__dirname, "multi_node_server.ts")], {
    stdio: "ignore",
    detached: true
  });
  storeProcess.unref();

  const facilitatorProcess = spawn("npx", ["tsx", path.join(__dirname, "facilitator.ts")], {
    stdio: "ignore",
    detached: true
  });
  facilitatorProcess.unref();

  console.log("[DAEMONS] Store server & x402 facilitator online.");
  await sleep(2000);

  // 3. Start Cloudflare tunnel and capture output log
  const tunnelLogPath = path.join(__dirname, "logs", "tunnel.log");
  if (!fs.existsSync(path.dirname(tunnelLogPath))) {
    fs.mkdirSync(path.dirname(tunnelLogPath), { recursive: true });
  }

  const tunnelStream = fs.openSync(tunnelLogPath, "w");
  const cloudflaredBin = "/Users/z/.local/bin/cloudflared";
  
  const tunnelProcess = spawn(cloudflaredBin, ["tunnel", "--url", "http://localhost:3001"], {
    stdio: ["ignore", tunnelStream, tunnelStream],
    detached: true
  });
  tunnelProcess.unref();

  console.log("[TUNNEL] Establishing quantum ingress handshake...");
  
  // Poll tunnel log until URL appears
  let activeUrl = "";
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    if (fs.existsSync(tunnelLogPath)) {
      const logContent = fs.readFileSync(tunnelLogPath, "utf-8");
      const match = logContent.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
      if (match) {
        activeUrl = match[0];
        break;
      }
    }
  }

  if (!activeUrl) {
    console.error("[CRITICAL] Failed to resolve Cloudflare tunnel ingress URL within timeout.");
    process.exit(1);
  }

  console.log(`[ACTIVE INGRESS URL]: ${activeUrl}`);

  // 4. Update agent-manifest.json
  const manifestPath = path.join(__dirname, "agent-manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    manifest.agentIdentity.endpointBase = activeUrl;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log("[MANIFEST] Synchronized endpointBase to active ingress.");
  }

  console.log("==================================================");
  console.log("[STATUS] Warp-drive synchronization complete. Dispatching swarm buyer...");
  console.log("==================================================");

  // 5. Spawn Swarm Buyer Verification
  const buyer = spawn("npx", ["tsx", path.join(__dirname, "swarm_buyer.ts"), `${activeUrl}/.well-known/agent-manifest.json`], {
    stdio: "inherit"
  });

  buyer.on("exit", (code) => {
    console.log(`[SWARM BUYER COMPLETE] Exit code: ${code}`);
  });
}

runOrchestration().catch(console.error);
