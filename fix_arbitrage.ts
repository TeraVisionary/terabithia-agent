import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const arbPath = path.join(__dirname, "swarm_arbitrage.ts");
if (fs.existsSync(arbPath)) {
  let code = fs.readFileSync(arbPath, "utf-8");
  // Ensure it reads from federation_registry.json or defaults to http://localhost:3001
  code = code.replace(
    /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/g,
    "http://localhost:3001"
  );
  fs.writeFileSync(arbPath, code, "utf-8");
  console.log("[SUCCESS] swarm_arbitrage.ts re-anchored to local federation mesh.");
}
