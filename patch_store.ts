import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure store server includes the /api/store/products/tera-pred-liq endpoint
console.log("[PATCH] Synchronizing route handlers for autonomous SKUs...");
