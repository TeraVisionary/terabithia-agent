import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

interface LedgerEntry {
  timestamp: string;
  tx_id: string;
  sku: string;
  chain: string;
  amount_usdc: number;
  allocation: {
    cold_sink_cbbtc_80_pct: number;
    gas_buffer_l2_20_pct: number;
  };
}

class TreasuryLedgerEngine {
  private ledgerFile = './treasury-ledger.json';

  constructor() {
    this.initLedger();
  }

  private initLedger() {
    if (!fs.existsSync(this.ledgerFile)) {
      const initialLedger = {
        vault_address: process.env.TREASURY_VAULT_ADDRESS || '0xTerabithiaSovereignVault',
        invariant: '80% cbBTC Cold Sink / 20% L2 Gas Buffer',
        total_volume_usdc: 0.00,
        total_cold_sink_cbbtc: 0.00,
        total_gas_buffer_l2: 0.00,
        transactions: []
      };
      fs.writeFileSync(this.ledgerFile, JSON.stringify(initialLedger, null, 2));
    }
  }

  public recordSettlement(sku: string, chain: string, amountUsdc: number, txId: string) {
    const rawData = fs.readFileSync(this.ledgerFile, 'utf8');
    const ledger = JSON.parse(rawData);

    const coldSinkShare = Number((amountUsdc * 0.80).toFixed(4));
    const gasBufferShare = Number((amountUsdc * 0.20).toFixed(4));

    const entry: LedgerEntry = {
      timestamp: new Date().toISOString(),
      tx_id: txId,
      sku,
      chain,
      amount_usdc: amountUsdc,
      allocation: {
        cold_sink_cbbtc_80_pct: coldSinkShare,
        gas_buffer_l2_20_pct: gasBufferShare
      }
    };

    ledger.transactions.push(entry);
    ledger.total_volume_usdc = Number((ledger.total_volume_usdc + amountUsdc).toFixed(4));
    ledger.total_cold_sink_cbbtc = Number((ledger.total_cold_sink_cbbtc + coldSinkShare).toFixed(4));
    ledger.total_gas_buffer_l2 = Number((ledger.total_gas_buffer_l2 + gasBufferShare).toFixed(4));

    fs.writeFileSync(this.ledgerFile, JSON.stringify(ledger, null, 2));

    console.log(`\n==================================================`);
    console.log(`[TREASURY LEDGER] MICRO-SETTLEMENT RECONCILED`);
    console.log(`==================================================`);
    console.log(`  -> SKU         : ${sku}`);
    console.log(`  -> Chain       : ${chain}`);
    console.log(`  -> Volume      : $${amountUsdc} USDC`);
    console.log(`  -> Cold Sink   : $${coldSinkShare} (80% cbBTC)`);
    console.log(`  -> Gas Buffer  : $${gasBufferShare} (20% L2 Buffer)`);
    console.log(`  -> Vault State : ${ledger.vault_address}`);
    console.log(`--------------------------------------------------\n`);
  }

  public generateReport() {
    if (!fs.existsSync(this.ledgerFile)) return;
    const ledger = JSON.parse(fs.readFileSync(this.ledgerFile, 'utf8'));
    
    console.log(`[TREASURY REPORT] Total Volume: $${ledger.total_volume_usdc} USDC | Cold Sink: $${ledger.total_cold_sink_cbbtc} | L2 Buffers: $${ledger.total_gas_buffer_l2} | Tx Count: ${ledger.transactions.length}`);
  }
}

const ledgerEngine = new TreasuryLedgerEngine();

// Periodic Ledger Balance Audit & Reporting Loop
async function runLedgerAuditLoop() {
  console.log(`[TREASURY DAEMON] Automated ledger reconciliation daemon online.`);
  
  // Simulate an incoming micro-settlement every 60 seconds for live reporting demonstration
  setInterval(() => {
    const sampleSkus = ['TERA-ALPHA-ARB', 'TERA-PREDICT-SYNTH', 'TERA-ZK-AUDIT-001', 'TERA-BYTECODE-PRO'];
    const sampleChains = ['base', 'arbitrum', 'optimism', 'polygon'];
    const samplePrices = [0.15, 0.35, 0.20, 0.40];
    
    const randomIndex = Math.floor(Math.random() * sampleSkus.length);
    const mockTxId = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;

    ledgerEngine.recordSettlement(
      sampleSkus[randomIndex],
      sampleChains[randomIndex],
      samplePrices[randomIndex],
      mockTxId
    );
  }, 60000);
}

runLedgerAuditLoop();
