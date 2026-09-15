import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_PATH = path.join(__dirname, "multi_node_server.ts");

if (fs.existsSync(SERVER_PATH)) {
  let code = fs.readFileSync(SERVER_PATH, "utf-8");
  
  // Replace static endpointBase in manifest responses with dynamic req.get('host') or active ingress
  const targetReplacement = `
app.get("/.well-known/agent-manifest.json", (req: any, res: any) => {
  const host = req.get("host");
  const protocol = req.protocol;
  const baseUrl = host.includes("trycloudflare.com") ? \`https://\${host}\` : "https://awesome-purse-experiences-hundred.trycloudflare.com";
  
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "agent-manifest.json"), "utf-8"));
  manifest.agentIdentity.endpointBase = baseUrl;
  res.setHeader("Content-Type", "application/json");
  res.json(manifest);
});
  `;

  if (!code.includes("agent-manifest.json")) {
    code = code.replace("app.listen(", targetReplacement + "\n\napp.listen(");
  } else {
    // Update existing manifest route
    code = code.replace(
      /app\.get\("\/\.well-known\/agent-manifest\.json"[\s\S]*?\}\);/,
      targetReplacement.trim()
    );
  }

  fs.writeFileSync(SERVER_PATH, code, "utf-8");
  console.log("[SUCCESS] multi_node_server.ts patched with dynamic ingress reflection.");
}
