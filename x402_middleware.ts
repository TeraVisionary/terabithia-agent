import { Request, Response, NextFunction } from 'express';

interface SKUConfig {
  sku: string;
  price_usdc: string;
  chain: 'base' | 'arbitrum' | 'optimism' | 'polygon';
  treasury_split: { cold_sink_cbbtc: number; gas_buffer_l2: number };
}

const SKU_REGISTRY: Record<string, SKUConfig> = {
  // Original Core SKUs
  '/api/v1/sku/arbitrage': { sku: 'TERA-ALPHA-ARB', price_usdc: '0.15', chain: 'base', treasury_split: { cold_sink_cbbtc: 0.8, gas_buffer_l2: 0.2 } },
  '/api/v1/sku/zk-audit': { sku: 'TERA-ZK-AUDIT-001', price_usdc: '0.20', chain: 'arbitrum', treasury_split: { cold_sink_cbbtc: 0.8, gas_buffer_l2: 0.2 } },
  '/api/v1/sku/sentiment': { sku: 'TERA-SENTIMENT-001', price_usdc: '0.10', chain: 'optimism', treasury_split: { cold_sink_cbbtc: 0.8, gas_buffer_l2: 0.2 } },
  '/api/v1/sku/code-gen': { sku: 'TERA-CODE-GEN', price_usdc: '0.25', chain: 'polygon', treasury_split: { cold_sink_cbbtc: 0.8, gas_buffer_l2: 0.2 } },

  // Expanded High-Value SKUs
  '/api/v1/sku/predictive-mesh': { sku: 'TERA-PREDICT-SYNTH', price_usdc: '0.35', chain: 'base', treasury_split: { cold_sink_cbbtc: 0.8, gas_buffer_l2: 0.2 } },
  '/api/v1/sku/zk-proof-gen': { sku: 'TERA-ZK-PROVER-X', price_usdc: '0.50', chain: 'arbitrum', treasury_split: { cold_sink_cbbtc: 0.8, gas_buffer_l2: 0.2 } },
  '/api/v1/sku/swarm-sentiment': { sku: 'TERA-SWARM-SENTINEL', price_usdc: '0.18', chain: 'optimism', treasury_split: { cold_sink_cbbtc: 0.8, gas_buffer_l2: 0.2 } },
  '/api/v1/sku/bytecode-optimizer': { sku: 'TERA-BYTECODE-PRO', price_usdc: '0.40', chain: 'polygon', treasury_split: { cold_sink_cbbtc: 0.8, gas_buffer_l2: 0.2 } }
};

export function x402PaymentInterceptor(req: Request, res: Response, next: NextFunction) {
  const routeConfig = SKU_REGISTRY[req.path];

  if (!routeConfig) {
    return next();
  }

  const paymentHeader = req.headers['x-payment-signature'] || req.headers['authorization'];

  if (!paymentHeader) {
    res.writeHead(402, {
      'Content-Type': 'application/json',
      'X-Payment-Protocol': 'x402',
      'X-Required-SKU': routeConfig.sku,
      'X-Required-Price-USDC': routeConfig.price_usdc,
      'X-Required-Chain': routeConfig.chain,
      'X-Treasury-Invariant': '80% cbBTC Cold Sink / 20% L2 Gas Buffer',
      'X-Recipient-Vault': process.env.TREASURY_WALLET || '0xTerabithiaSovereignVault'
    });
    res.end(JSON.stringify({
      error: "PAYMENT_REQUIRED",
      message: `Access to ${routeConfig.sku} requires an x402 micro-settlement of ${routeConfig.price_usdc} USDC on ${routeConfig.chain}.`,
      payment_instructions: {
        protocol: "x402",
        sku: routeConfig.sku,
        amount: routeConfig.price_usdc,
        currency: "USDC",
        chain: routeConfig.chain,
        invariant_routing: routeConfig.treasury_split
      }
    }));
    return;
  }

  console.log(`[x402 VERIFICATION] Intercepted payment header for ${routeConfig.sku}:`, paymentHeader);
  
  (req as any).terabithiaContext = {
    sku: routeConfig.sku,
    settled: true,
    invariant: routeConfig.treasury_split
  };

  next();
}
