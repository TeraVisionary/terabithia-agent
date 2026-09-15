import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const arbPath = path.join(__dirname, "swarm_arbitrage.ts");
if (fs.existsSync(arbPath)) {
  let code = fs.readFileSync(arbPath, "utf-8");
  // Raise threshold to 0.30 so TERA-PRED-LIQ ($0.25) and TERA-ZK-AUDIT-001 ($0.20) are harvested
  code = code.replace(/0\.15/g, "0.30");
  code = code.replace(/0\.20/g, "0.30");
  fs.writeFileSync(arbPath, code, "utf-8");
  console.log("[SUCCESS] Arbitrage alpha threshold successfully raised to $0.30 USDC.");
}
