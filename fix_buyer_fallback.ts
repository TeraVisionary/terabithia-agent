import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUYER_PATH = path.join(__dirname, "swarm_buyer.ts");

if (fs.existsSync(BUYER_PATH)) {
  let code = fs.readFileSync(BUYER_PATH, "utf-8");
  code = code.replace(
    /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/g,
    "https://awesome-purse-experiences-hundred.trycloudflare.com"
  );
  fs.writeFileSync(BUYER_PATH, code, "utf-8");
  console.log("[SUCCESS] Permanently re-anchored swarm_buyer.ts fallback ingress.");
}
