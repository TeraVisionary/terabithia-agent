import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import fetch from 'node-fetch';

const GATEWAY_URL = 'https://terabithia-agent.onrender.com/api/v1/sku/predictive-mesh';

// For mainnet testing, ensure your buyer private key is in .env or configured here
const BUYER_PRIVATE_KEY = process.env.BUYER_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Default local anvil key for demonstration

async function executeX402Purchase() {
  console.log(`\n==================================================`);
  console.log(`[X402 CLIENT] PROBING GATEWAY CHALLENGE`);
  console.log(`==================================================`);

  // Step 1: Probe the endpoint to receive the x402 payment challenge
  const initialRes = await fetch(GATEWAY_URL);
  
  if (initialRes.status !== 402) {
    console.log(`Resource is open or returned unexpected status: ${initialRes.status}`);
    const text = await initialRes.text();
    console.log(text);
    return;
  }

  const requiredSku = initialRes.headers.get('x-required-sku');
  const requiredPrice = initialRes.headers.get('x-required-price-usdc');
  const requiredChain = initialRes.headers.get('x-required-chain');
  const recipientVault = initialRes.headers.get('x-recipient-vault');

  console.log(`  -> Challenge Caught!`);
  console.log(`  -> SKU Target    : ${requiredSku}`);
  console.log(`  -> Price Required: $${requiredPrice} USDC`);
  console.log(`  -> Target Chain  : ${requiredChain}`);
  console.log(`  -> Vault Target  : ${recipientVault}`);

  console.log(`\n[X402 CLIENT] SIGNING MICRO-SETTLEMENT ON-CHAIN...`);

  // Step 2: Initialize Viem wallet client to sign the payment proof
  const account = privateKeyToAccount(BUYER_PRIVATE_KEY as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: base,
    transport: http()
  });

  // Generate cryptographic proof of payment (EIP-712 or signed authorization payload)
  const paymentProof = await client.signMessage({
    message: `x402-settlement:${requiredSku}:${requiredPrice}:${recipientVault}:${Date.now()}`
  });

  console.log(`  -> Payment Signature Generated: ${paymentProof.slice(0, 20)}...`);
  console.log(`[X402 CLIENT] RESUBMITTING REQUEST WITH SETTLEMENT HEADER...`);

  // Step 3: Resubmit request with the x402 authorization proof header
  const settledRes = await fetch(GATEWAY_URL, {
    headers: {
      'Authorization': `x402-proof ${paymentProof}`,
      'X-Buyer-Address': account.address
    }
  });

  const responseBody = await settledRes.text();
  console.log(`\n==================================================`);
  console.log(`[X402 CLIENT] GATEWAY SETTLEMENT RESPONSE`);
  console.log(`==================================================`);
  console.log(responseBody);
  console.log(`==================================================\n`);
}

executeX402Purchase();
