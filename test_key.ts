import { privateKeyToAccount } from "viem/accounts";
import base64 from "base-64";

const rawB64 = "uOwkzYNapcAVr+8xVxRInamSqM90qRpEQe00z710E++y8gfA3FKluyEpSQ0hY/bg7u/TV+Rsy/99aLxrMbiQ==";
const buf = Buffer.from(rawB64, "base64");

const TARGET = "0xEf6Ba235fBEc45DD62Ae6911356730417242eE5e".toLowerCase();

console.log("Testing derived chunks from Base64 string against target:", TARGET);

const candidates = [
  "0x" + buf.subarray(0, 32).toString("hex"),
  "0x" + buf.subarray(32, 64).toString("hex"),
];

let matched = false;
for (let i = 0; i < candidates.length; i++) {
  try {
    const acc = privateKeyToAccount(candidates[i] as `0x${string}`);
    console.log(`Chunk ${i + 1} Address: ${acc.address}`);
    if (acc.address.toLowerCase() === TARGET) {
      console.log(`\n>>> SUCCESS: Chunk ${i + 1} MATCHES VAULT! <<<`);
      console.log(`Injecting verified key into .env...`);
      import("fs").then(fs => {
        let envContent = fs.readFileSync(".env", "utf-8");
        envContent = envContent.replace(/VAULT_PRIVATE_KEY=.*/g, "");
        envContent += `\nVAULT_PRIVATE_KEY="${candidates[i]}"\n`;
        fs.writeFileSync(".env", envContent.trim() + "\n");
        console.log(".env updated with matching key.");
      });
      matched = true;
      break;
    }
  } catch (e) {}
}

if (!matched) {
  console.log("\nNeither chunk matches 0xEf6Ba... The string provided is not the raw private key for this address.");
  console.log("Please export the 64-character private key directly from your wallet (MetaMask / Coinbase Wallet / Rabby) for account 0xEf6Ba...");
}
