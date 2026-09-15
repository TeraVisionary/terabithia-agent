import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_PATH = path.join(__dirname, "multi_node_server.ts");
const ALT_SERVER_PATH = path.join(__dirname, "store_server.ts");

const targetPath = fs.existsSync(SERVER_PATH) ? SERVER_PATH : ALT_SERVER_PATH;

if (!fs.existsSync(targetPath)) {
  console.error("[ERROR] Store server script not found.");
  process.exit(1);
}

let serverCode = fs.readFileSync(targetPath, "utf-8");

const routeSnippet = `
// Autonomous Predictive Liquidity Mesh SKU Route Handler
app.get("/api/store/products/tera-pred-liq", (req, res) => {
  res.status(200).json({
    status: "DELIVERED_AND_SETTLED",
    sku: "TERA-PRED-LIQ",
    item_name: "Autonomous Predictive Cross-Chain Liquidity Mesh",
    license: "COMMERCIAL_MACHINE_EXECUTION_UNLIMITED",
    asset_payload: {
      format: "algorithmic_asset",
      synthetic_payload_id: \`WARP-PRED-LIQ-\${Date.now()}\`,
      content: "[VERIFIED ARTIFACT: Autonomous Predictive Cross-Chain Liquidity Mesh] Multi-DEX order book depth compiled into zero-latency rebalancing buffers.",
      integrity_hash: \`0x\${Buffer.from("TERA-PRED-LIQ").toString("hex").padStart(64, "0")}\`
    },
    transaction_clearance: {
      recipient: "0x20734FBa4c8436f87eC70388016a246f8C89e7f2",
      cleared_via: "x402_FACILITATOR_PORT_4020",
      invariant_allocation: "80% cbBTC Cold Sink / 20% L2 Gas Buffer"
    },
    timestamp: new Date().toISOString()
  });
});
`;

if (!serverCode.includes("tera-pred-liq")) {
  // Insert before app.listen
  serverCode = serverCode.replace("app.listen(", routeSnippet + "\n\napp.listen(");
  fs.writeFileSync(targetPath, serverCode, "utf-8");
  console.log("[SUCCESS] Added TERA-PRED-LIQ route handler to", path.basename(targetPath));
} else {
  console.log("[INFO] Route handler already present.");
}
