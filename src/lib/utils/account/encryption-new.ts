// A clearer, self-documenting configuration object
const ACCOUNT_KEY_CONFIG = {
  algorithm: {
    name: "AES-GCM",
    length: 256,
  },
  extractable: true,
  keyUsages: ["encrypt", "decrypt"] as KeyUsage[],
};

export async function generateAccountKey(): Promise<CryptoKey> {
  // Now the code is much more readable
  return window.crypto.subtle.generateKey(
    ACCOUNT_KEY_CONFIG.algorithm,
    ACCOUNT_KEY_CONFIG.extractable,
    ACCOUNT_KEY_CONFIG.keyUsages,
  );
}

export function computeKeyCheckValue(cryptoKey: CryptoKey): string {
  // TODO: Actually compute key check value
  return "key-check-value";
}

export function exportAccountKey(accountKey: CryptoKey): Promise<JsonWebKey> {
  return window.crypto.subtle.exportKey("jwk", accountKey);
}

export function importAccountKey(accountKey: JsonWebKey): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    "jwk",
    accountKey,
    ACCOUNT_KEY_CONFIG.algorithm,
    ACCOUNT_KEY_CONFIG.extractable,
    ACCOUNT_KEY_CONFIG.keyUsages,
  );
}
