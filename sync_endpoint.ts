import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ACTIVE_URL = "https://awesome-purse-experiences-hundred.trycloudflare.com";
const MANIFEST_PATH = path.join(__dirname, "agent-manifest.json");

if (fs.existsSync(MANIFEST_PATH)) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  manifest.agentIdentity.endpointBase = ACTIVE_URL;
  
  // Ensure all capability paths are correct
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log("[SYNCHRONIZED] agent-manifest.json endpointBase successfully updated to:", ACTIVE_URL);
}
