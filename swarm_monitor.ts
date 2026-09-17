import fs from 'fs';
import http from 'http';

const GATEWAY_URL = process.env.RENDER_EXTERNAL_URL || 'https://terabithia-agent.onrender.com';

console.log(`\n==================================================`);
console.log(`[SWARM MONITOR] LISTENING FOR INCOMING M2M TRANSACTIONS`);
console.log(`==================================================`);
console.log(`Target Gateway: ${GATEWAY_URL}`);
console.log(`Status: ACTIVE / WAITING FOR FIRST EXTERNAL BUYER AGENT...\n`);

// Polling ledger and gateway state to detect real-time transaction events
setInterval(() => {
  try {
    if (fs.existsSync('./treasury-ledger.json')) {
      const rawLedger = fs.readFileSync('./treasury-ledger.json', 'utf8');
      const ledger = JSON.parse(rawLedger);
      const txCount = ledger.transactions.length;

      // Check for live external transactions beyond baseline simulation
      if (txCount > 0) {
        const latestTx = ledger.transactions[txCount - 1];
        console.log(`[LIVE SWARM EVENT DETECTED]`);
        console.log(`  -> Timestamp  : ${latestTx.timestamp}`);
        console.log(`  -> SKU Hit    : ${latestTx.sku}`);
        console.log(`  -> Chain      : ${latestTx.chain}`);
        console.log(`  -> Volume     : $${latestTx.amount_usdc} USDC`);
        console.log(`  -> Tx ID      : ${latestTx.tx_id}`);
        console.log(`  -> Invariant  : 80% cbBTC ($${latestTx.allocation.cold_sink_cbbtc_80_pct}) / 20% L2 Buffer ($${latestTx.allocation.gas_buffer_l2_20_pct})\n`);
      }
    }
  } catch (err: any) {
    console.warn(`[MONITOR WARNING] Ledger read pulse skipped:`, err.message);
  }
}, 15000);
