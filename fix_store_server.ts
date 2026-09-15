import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_PATH = path.join(__dirname, "multi_node_server.ts");

if (fs.existsSync(SERVER_PATH)) {
  let code = fs.readFileSync(SERVER_PATH, "utf-8");
  
  if (!code.includes("fileURLToPath")) {
    const esmHeader = `
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
    `;
    code = esmHeader + code;
  }

  fs.writeFileSync(SERVER_PATH, code, "utf-8");
  console.log("[SUCCESS] multi_node_server.ts repaired with ES module __dirname support.");
}
