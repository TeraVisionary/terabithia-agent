import { createPublicClient, http, formatEther } from 'viem';
import { base, arbitrum, optimism, polygon } from 'viem/chains';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const TELEMETRY_NODES = [
  { name: 'base', chain: base, rpc: process.env.BASE_RPC_URL },
  { name: 'arbitrum', chain: arbitrum, rpc: process.env.ARBITRUM_RPC_URL },
  { name: 'optimism', chain: optimism, rpc: process.env.OPTIMISM_RPC_URL },
  { name: 'polygon', chain: polygon, rpc: process.env.POLYGON_RPC_URL || 'https://polygon-bor-rpc.publicnode.com' },
];

async function collectTelemetry() {
  const timestamp = new Date().toISOString();
  console.log(`\n==================================================`);
  console.log(`[TERABITHIA TELEMETRY] PULSE CHECK | ${timestamp}`);
  console.log(`==================================================`);

  const meshMetrics: any = { timestamp, nodes: [] };

  for (const node of TELEMETRY_NODES) {
    try {
      const client = createPublicClient({
        chain: node.chain,
        transport: http(node.rpc),
      });

      const startTime = Date.now();
      const blockNumber = await client.getBlockNumber();
      const gasPrice = await client.getGasPrice();
      const latency = Date.now() - startTime;

      const nodeData = {
        name: node.name,
        block: blockNumber.toString(),
        gas_price_gwei: formatEther(gasPrice),
        latency_ms: latency,
        status: 'HEALTHY'
      };

      meshMetrics.nodes.push(nodeData);
      console.log(`[TELEMETRY] ${node.name.toUpperCase()} --> Block: ${blockNumber} | Gas: ${nodeData.gas_price_gwei} ETH | Latency: ${latency}ms`);
    } catch (err: any) {
      console.error(`[TELEMETRY ERROR] ${node.name} telemetry fault:`, err?.message || err);
      meshMetrics.nodes.push({ name: node.name, status: 'DEGRADED', error: err?.message });
    }
  }

  fs.writeFileSync('./latest-telemetry.json', JSON.stringify(meshMetrics, null, 2));
  console.log(`[TELEMETRY SYNC] Metrics locked to latest-telemetry.json`);
}

async function runTelemetryLoop() {
  console.log('[WARP-DRIVE] Initializing Automated Cross-Chain Telemetry...');
  await collectTelemetry();
  
  setInterval(async () => {
    try {
      await collectTelemetry();
    } catch (err: any) {
      console.error('[TELEMETRY LOOP ERROR]:', err?.message || err);
    }
  }, 30000); // Pulse every 30 seconds
}

runTelemetryLoop();
