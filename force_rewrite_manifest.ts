import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ACTIVE_URL = "https://awesome-purse-experiences-hundred.trycloudflare.com";
const MANIFEST_PATH = path.join(__dirname, "agent-manifest.json");

if (fs.existsSync(MANIFEST_PATH)) {
  const raw = fs.readFileSync(MANIFEST_PATH, "utf-8");
  // Replace any old trycloudflare domain with the new active URL
  const updated = raw.replace(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/g, ACTIVE_URL);
  fs.writeFileSync(MANIFEST_PATH, updated, "utf-8");
  console.log("[SUCCESS] agent-manifest.json fully re-anchored to:", ACTIVE_URL);
}
