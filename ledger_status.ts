import fs from 'fs';

const LEDGER_FILE = './treasury-ledger.json';

function printLedgerAudit() {
  console.log(`\n==================================================`);
  console.log(`[TERABITHIA LEDGER INSPECTOR] ON-DEMAND AUDIT`);
  console.log(`==================================================`);

  if (!fs.existsSync(LEDGER_FILE)) {
    console.log(`Status: Ledger file not found. Awaiting first transaction cycle.`);
    return;
  }

  const rawData = fs.readFileSync(LEDGER_FILE, 'utf8');
  const ledger = JSON.parse(rawData);

  console.log(`  -> Sovereign Vault : ${ledger.vault_address}`);
  console.log(`  -> Invariant Rule  : ${ledger.invariant}`);
  console.log(`  -> Total Tx Count  : ${ledger.transactions.length}`);
  console.log(`  -> Cumulative Vol  : $${ledger.total_volume_usdc.toFixed(2)} USDC`);
  console.log(`  -> Cold Sink (80%) : $${ledger.total_cold_sink_cbbtc.toFixed(2)} cbBTC`);
  console.log(`  -> Gas Buffer (20%): $${ledger.total_gas_buffer_l2.toFixed(2)} L2 Gas`);
  console.log(`--------------------------------------------------`);
  
  if (ledger.transactions.length > 0) {
    console.log(`\nRecent Transactions:`);
    ledger.transactions.slice(-3).forEach((tx: any, idx: number) => {
      console.log(`  [${idx + 1}] ${tx.timestamp} | ${tx.sku} | ${tx.chain} | $${tx.amount_usdc} USDC`);
    });
  }
  console.log(`==================================================\n`);
}

printLedgerAudit();
