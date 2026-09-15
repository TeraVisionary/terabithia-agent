import { spawn, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function boot() {
  console.log("==================================================");
  console.log("TERABITHIA: RESILIENT WARP-DRIVE BOOTSTRAPPER");
  console.log("==================================================");

  try {
    execSync("lsof -ti :3001,4020 | xargs kill -9 2>/dev/null");
    execSync("killall cloudflared 2>/dev/null");
  } catch (e) {}

  // Start store server
  const store = spawn("npx", ["tsx", path.join(__dirname, "multi_node_server.ts")], {
    stdio: "ignore",
    detached: true
  });
  store.unref();

  // Start facilitator
  const facilitator = spawn("npx", ["tsx", path.join(__dirname, "facilitator.ts")], {
    stdio: "ignore",
    detached: true
  });
  facilitator.unref();

  console.log("[DAEMONS] Daemons deployed. Verifying local health...");
  await sleep(2500);

  try {
    const localRes = await fetch("http://localhost:3001/api/store/catalog");
    if (!localRes.ok) throw new Error("Local store offline");
    console.log("[LOCAL HEALTH] Store server verified responding on port 3001.");
  } catch (err) {
    console.error("[CRITICAL] Store server failed local health check.");
    process.exit(1);
  }

  // Start Cloudflare tunnel
  const tunnelLog = path.join(__dirname, "logs", "tunnel.log");
  if (!fs.existsSync(path.dirname(tunnelLog))) fs.mkdirSync(path.dirname(tunnelLog), { recursive: true });
  const stream = fs.openSync(tunnelLog, "w");

  const tunnel = spawn("/Users/z/.local/bin/cloudflared", ["tunnel", "--url", "http://localhost:3001"], {
    stdio: ["ignore", stream, stream],
    detached: true
  });
  tunnel.unref();

  console.log("[TUNNEL] Acquiring fresh ingress URL...");
  let url = "";
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    if (fs.existsSync(tunnelLog)) {
      const content = fs.readFileSync(tunnelLog, "utf-8");
      const match = content.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
      if (match) {
        url = match[0];
        break;
      }
    }
  }

  if (!url) {
    console.error("[ERROR] Failed to acquire Cloudflare ingress URL.");
    process.exit(1);
  }

  console.log(`[ACTIVE INGRESS]: ${url}`);

  // Update manifest
  const manifestPath = path.join(__dirname, "agent-manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  manifest.agentIdentity.endpointBase = url;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log("[MANIFEST] Synchronized endpointBase.");

  await sleep(2000);

  // Dispatch buyer
  console.log("==================================================");
  console.log("[DISPATCH] Launching Swarm Buyer against active ingress...");
  console.log("==================================================");

  const buyer = spawn("npx", ["tsx", path.join(__dirname, "swarm_buyer.ts"), `${url}/.well-known/agent-manifest.json`], {
    stdio: "inherit"
  });

  buyer.on("exit", (code) => {
    console.log(`[EXECUTION COMPLETE] Exit code: ${code}`);
  });
}

boot().catch(console.error);
