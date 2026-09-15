import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEW_URL = "https://awesome-purse-experiences-hundred.trycloudflare.com";
const MANIFEST_PATH = path.join(__dirname, "agent-manifest.json");
const REGISTRY_PATH = path.join(__dirname, "federation_registry.json");

if (fs.existsSync(MANIFEST_PATH)) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  manifest.agentIdentity.endpointBase = NEW_URL;
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log("[UPDATED] agent-manifest.json endpointBase ->", NEW_URL);
}

if (fs.existsSync(REGISTRY_PATH)) {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
  registry.forEach((p: any) => {
    p.activeIngress = NEW_URL;
    p.manifestUrl = `${NEW_URL}/.well-known/agent-manifest.json`;
  });
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
  console.log("[UPDATED] federation_registry.json synchronized.");
}
