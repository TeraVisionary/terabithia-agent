import fs from 'fs';

const LEDGER_FILE = './treasury-ledger.json';

function printLedgerAudit() {
  console.log(`\n==================================================`);
  console.log(`[TERABITHIA LEDGER INSPECTOR] ON-DEMAND AUDIT`);
  console.log(`==================================================`);

  let ledger;
  if (!fs.existsSync(LEDGER_FILE)) {
    // Initialize default structure if missing
    ledger = {
      vault_address: "0xTerabithiaSovereignVault",
      invariant: "80% cbBTC Cold Sink / 20% L2 Gas Buffer",
      total_volume_usdc: 0.00,
      total_cold_sink_cbbtc: 0.00,
      total_gas_buffer_l2: 0.00,
      transactions: []
    };
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2));
    console.log(`Status: Initialized fresh sovereign ledger state.`);
  } else {
    const rawData = fs.readFileSync(LEDGER_FILE, 'utf8');
    ledger = JSON.parse(rawData);
    console.log(`Status: Ledger active and synchronized.`);
  }

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
  } else {
    console.log(`  -> Awaiting first live transaction settlement.`);
  }
  console.log(`==================================================\n`);
}

printLedgerAudit();
