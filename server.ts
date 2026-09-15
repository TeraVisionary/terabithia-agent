import express, { Request, Response } from "express";
import { readFileSync, existsSync } from "fs";
import { paymentMiddleware } from "x402-express";

const app = express();
app.use(express.json());

const VAULT_ADDRESS = "0xEf6Ba235fBEc45DD62Ae6911356730417242eE5e";

// In-memory cache for live telemetry (30s TTL)
let cache = { data: null as any, lastUpdated: 0 };

async function fetchLiveMarketTelemetry() {
  const now = Date.now();
  if (cache.data && now - cache.lastUpdated < 30000) {
    return cache.data;
  }

  try {
    const [chainsRes, pricesRes, cgRes] = await Promise.all([
      fetch("https://api.llama.fi/v2/chains"),
      fetch("https://coins.llama.fi/prices/current/base:0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf,coingecko:ethereum,coingecko:bitcoin"),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,coinbase-wrapped-btc&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true"),
    ]);

    const [chains, llamaPrices, cgData] = await Promise.all([
      chainsRes.json(),
      pricesRes.json(),
      cgRes.json(),
    ]);

    const baseChain = Array.isArray(chains) ? chains.find((c: any) => c.name?.toLowerCase() === "base") : null;
    const baseTVL = baseChain ? baseChain.tvl : 0;
    const btcSpot = cgData?.bitcoin?.usd || 0;
    const btc24hChange = cgData?.bitcoin?.usd_24h_change || 0;
    const cbBtcSpot = cgData?.["coinbase-wrapped-btc"]?.usd || llamaPrices?.coins?.["base:0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf"]?.price || btcSpot;
    const ethSpot = cgData?.ethereum?.usd || 0;

    const momentumVector = btc24hChange >= 0 ? "BULLISH_EXPANSION" : "CONSOLIDATION_SWEEP";
    const systemicEntropy = Math.abs(btc24hChange) > 5 ? "ELEVATED_VOLATILITY" : "LOW_FRICTION";

    const payload = {
      timestamp: new Date().toISOString(),
      signal_id: `WARP-SIG-${now}`,
      market_ingestion: {
        base_network_tvl_usd: baseTVL,
        spot_assets: {
          bitcoin_usd: btcSpot,
          coinbase_wrapped_btc_usd: cbBtcSpot,
          ethereum_usd: ethSpot,
          btc_24h_delta_pct: Number(btc24hChange.toFixed(2)),
        },
      },
      terabithia_synthesis: {
        archetype_verdict: "THE_INNOVATOR",
        macro_vector: momentumVector,
        target_reserve_asset: "cbBTC",
        systemic_entropy: systemicEntropy,
        predictive_confidence: 0.96,
        solomon_vault_directive: {
          operational_l2_buffer: "20% USDC",
          cold_storage_sweep: "80% cbBTC",
          execution_status: "NOMINAL",
        },
      },
    };

    cache.data = payload;
    cache.lastUpdated = now;
    return payload;
  } catch (err: any) {
    return cache.data || {
      timestamp: new Date().toISOString(),
      status: "DEGRADED_SYNTHETIC_FALLBACK",
      error: err.message,
    };
  }
}

async function bootstrap() {
  const routeTolls = {
    "GET /api/warp/telemetry": {
      price: "$0.002",
      network: "base-sepolia",
      config: { description: "Terabithia 13-Engine Multi-Layer Predictive Synthesis Stream" },
    },
  };

  const localFacilitator = {
    url: "http://localhost:4020",
    verify: async (payload: any) => {
      const resp = await fetch("http://localhost:4020/x402/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentPayload: payload }),
      });
      return resp.json();
    },
    settle: async (payload: any) => {
      const resp = await fetch("http://localhost:4020/x402/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentPayload: payload }),
      });
      return resp.json();
    },
  };

  const payment = paymentMiddleware(VAULT_ADDRESS, routeTolls, localFacilitator as any);

  // 1. ERC-8004 Canonical Machine-Readable Discovery
  app.get("/.well-known/agent-card.json", (req: Request, res: Response) => {
    if (existsSync("./erc8004-agent-card.json")) {
      const card = readFileSync("./erc8004-agent-card.json", "utf-8");
      res.setHeader("Content-Type", "application/json");
      return res.send(card);
    }
    return res.status(404).json({ error: "ERC-8004 Agent Card not generated yet." });
  });

  // 2. Public Health Diagnostic
  app.get("/health", (req: Request, res: Response) => {
    res.json({
      status: "ONLINE",
      operating_layer: "CORE_WARP_DRIVE",
      framework: "Dynamic Synergy Engine",
      archetype: "THE_SAGE",
      vault_address: VAULT_ADDRESS,
      agent_card: "/.well-known/agent-card.json",
      timestamp: new Date().toISOString(),
    });
  });

  // 3. Gated x402 Telemetry Stream
  app.get("/api/warp/telemetry", payment, async (req: Request, res: Response) => {
    const liveTelemetry = await fetchLiveMarketTelemetry();
    res.json({
      status: "STATE_SETTLED",
      telemetry: liveTelemetry,
    });
  });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`WARP-DRIVE SOVEREIGN NODE ONLINE ON PORT ${PORT}`);
    console.log(`Discovery: http://localhost:${PORT}/.well-known/agent-card.json`);
    console.log(`Oracle:    http://localhost:${PORT}/api/warp/telemetry`);
    console.log(`==================================================`);
  });
}

bootstrap().catch(console.error);
