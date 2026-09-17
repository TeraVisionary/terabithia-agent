import fs from 'fs';
import path from 'path';

interface TelemetryPulse {
  chain: string;
  gas_gwei: number;
  latency_ms: number;
}

export function calculateSurgeMultiplier(telemetry: TelemetryPulse[]): number {
  const avgLatency = telemetry.reduce((acc, t) => acc + t.latency_ms, 0) / telemetry.length;
  
  // If network congestion/latency spikes, apply algorithmic surge pricing
  if (avgLatency > 500) {
    console.log(`[SURGE ENGINE] Network latency elevated (${avgLatency.toFixed(0)}ms). Scaling SKU pricing vector by 1.5x.`);
    return 1.5;
  }
  return 1.0;
}
