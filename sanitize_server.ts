import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_PATH = path.join(__dirname, "multi_node_server.ts");

if (fs.existsSync(SERVER_PATH)) {
  let code = fs.readFileSync(SERVER_PATH, "utf-8");
  
  // Remove duplicate or dangling trailing braces if present
  code = code.trim();
  while (code.endsWith("}") && (code.match(/\{/g) || []).length < (code.match(/\}/g) || []).length) {
    code = code.slice(0, -1).trim();
  }

  // Ensure app.listen is present
  if (!code.includes("app.listen(")) {
    code += `\n\napp.listen(3001, () => {\n  console.log("==================================================");\n  console.log("TERABITHIA MULTI-VERTICAL FEDERATION NODE ONLINE");\n  console.log("[NETWORK]     base (Port 3001)");\n  console.log("[CATALOG]     http://localhost:3001/api/store/catalog");\n  console.log("[MANIFEST]    http://localhost:3001/.well-known/agent-manifest.json");\n  console.log("[SETTLEMENT]  0x20734FBa4c8436f87eC70388016a246f8C89e7f2");\n  console.log("==================================================");\n});\n`;
  }

  fs.writeFileSync(SERVER_PATH, code, "utf-8");
  console.log("[SUCCESS] multi_node_server.ts syntax successfully sanitized.");
}
