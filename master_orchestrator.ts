import { spawn, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runMaster() {
  console.log("==================================================s");
  console.log("TERABITHIA: MASTER WARP-DRIVE ORCHESTRATOR ENGAGED");
  console.log("==================================================s");

  // 1. Purge existing ports and processes
  try {
    execSync("lsof -ti :3001,4020 | xargs kill -9 2>/dev/null");
    execSync("killall cloudflared 2>/dev/null");
  } catch (e) {}

  console.log("[DAEMONS] Purged stale processes. Igniting store server & x402 facilitator...");

  // 2. Start Store Server
  const storeServer = spawn("npx", ["tsx", path.join(__dirname, "multi_node_server.ts")], {
    stdio: "inherit",
    detached: true
  });

  // 3. Start Facilitator
  const facilitator = spawn("npx", ["tsx", path.join(__dirname, "facilitator.ts")], {
    stdio: "inherit",
    detached: true
  });

  await sleep(3000);

  console.log("[TUNNEL] Launching Cloudflare QUIC Ingress...");
  const tunnelLogPath = path.join(__dirname, "logs/tunnel.log");
  const tunnelLogStream = fs.openSync(tunnelLogPath, "w");
  
  // Pipe both stdout and stderr to tunnel.log since cloudflared logs URLs to stderr
  const tunnel = spawn("/Users/z/.local/bin/cloudflared", ["tunnel", "--url", "http://localhost:3001"], {
    stdio: ["ignore", tunnelLogStream, tunnelLogStream],
    detached: true
  });

  // Poll for tunnel URL up to 15 seconds
  let activeUrl = "";
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    if (fs.existsSync(tunnelLogPath)) {
      const tunnelLog = fs.readFileSync(tunnelLogPath, "utf-8");
      const match = tunnelLog.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/g);
      if (match && match.length > 0) {
        activeUrl = match[match.length - 1];
        break;
      }
    }
  }

  if (!activeUrl) {
    console.error("[ERROR] Failed to extract Cloudflare tunnel URL within timeout.");
    process.exit(1);
  }

  console.log(`[ACTIVE INGRESS URL]: ${activeUrl}`);

  // Re-anchor manifest
  const manifestPath = path.join(__dirname, "agent-manifest.json");
  if (fs.existsSync(manifestPath)) {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const m = JSON.parse(raw);
    m.agentIdentity.endpointBase = activeUrl;
    fs.writeFileSync(manifestPath, JSON.stringify(m, null, 2), "utf-8");
    console.log("[MANIFEST RE-ANCHORED] ->", activeUrl);
  }

  await sleep(2000);

  console.log("==================================================");
  console.log("[DISPATCH] Launching Autonomous Swarm Buyer...");
  console.log("==================================================");

  const buyer = spawn("npx", ["tsx", path.join(__dirname, "swarm_buyer.ts"), `${activeUrl}/.well-known/agent-manifest.json`], {
    stdio: "inherit"
  });

  buyer.on("exit", (code) => {
    console.log(`[EXECUTION COMPLETE] Exit code: ${code}`);
    process.exit(0);
  });
}

runMaster().catch(console.error);
