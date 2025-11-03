/**
 * Encryption/Key generation utility functions
 */

/**
 * Our custom encrypted data format. We store these two fields together.
 * We need a key to decrypt this data.
 * - data: ciphertext
 * - iv: initialization vector for ciphertext
 */
export interface EncryptedData {
  iv: ArrayBuffer;
  data: ArrayBuffer;
}

/**
 * Parameters used to derive the data passphrase derived key.
 */
export interface DataPassphraseDerivedKeyDerivationParams {
  salt: ArrayBuffer;
}

//------------------------------------------------------------------------------
// Encryption Key Configurations
//------------------------------------------------------------------------------
// Account Key Check Value Data, used to verify account key integrity
const ACCOUNT_KEY_CHECK_VALUE_DATA = new ArrayBuffer(0);

/**
 * General configuration for encrypting data. Used by encrypt/wrapKey operations.
 */
const ENCRYPT_DATA_CONFIG = {
  algorithm: {
    name: "AES-GCM",
    tagLength: 128,
  },
  ivLength: 12, // 96 bits
};

/**
 * Configuration for Account Key generation and import operations.
 * - algorithm: AesKeyGenParams for key generation
 */
const ACCOUNT_KEY_CONFIG = {
  algorithm: {
    name: "AES-GCM",
    length: 256,
  },
  extractable: true,
  keyUsages: ["encrypt", "decrypt"] as KeyUsage[],
};

/**
 * Configuration specifying how to use the data passphrase derived key.
 * - algorithm: AesDerivedKeyParams for key operations
 */
const DATA_PASSPHRASE_DERIVED_KEY_CONFIG = {
  algorithm: {
    name: "AES-GCM",
    length: 256,
  },
  extractable: false,
  keyUsages: ["wrapKey", "unwrapKey"] as KeyUsage[],
};

/**
 * Configuration for deriving the data passphrase derived key from data passphrase.
 * - algorithm: Pbkdf2Params for key derivation
 */
const DATA_PASSPHRASE_DERIVED_KEY_DERIVATION_PARAMS_CONFIG = {
  algorithm: {
    name: "PBKDF2",
    hash: "SHA-256",
    iterations: 600000, // OWASP 2023
  },
  saltLength: 16,
};

/**
 * Configuration for converting the data passphrase to key material.
 * - algorithm: PBKDF2, the type of key to import
 */
const DATA_PASSPHRASE_KEY_MATERIAL_CONFIG = {
  algorithm: {
    name: "PBKDF2",
  },
  extractable: false,
  keyUsages: ["deriveKey"] as KeyUsage[],
};

//------------------------------------------------------------------------------
// Encryption Key Utility Functions
//------------------------------------------------------------------------------
/**
 * Generate a new account key.
 * @returns Promise<CryptoKey> The generated account key
 */
export function generateAccountKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    ACCOUNT_KEY_CONFIG.algorithm,
    ACCOUNT_KEY_CONFIG.extractable,
    ACCOUNT_KEY_CONFIG.keyUsages,
  );
}

/**
 * Generate a key check value for the given crypto key.
 * @param cryptoKey The crypto key to compute check value for
 * @returns Promise<EncryptedData> The key check value
 */
export function generateAccountKeyCheckValue(
  accountKey: CryptoKey,
): Promise<EncryptedData> {
  return encrypt(accountKey, ACCOUNT_KEY_CHECK_VALUE_DATA);
}

/**
 * Check if account key is valid.
 * @param accountKey Cryptokey
 * @param accountKeyCheckValue EncryptedData
 * @returns Promise<boolean> true if accountKey is valid, false otherwise
 */
export async function checkAccountKey(
  accountKey: CryptoKey,
  accountKeyCheckValue: EncryptedData,
): Promise<boolean> {
  try {
    const buffer = await decrypt(accountKey, accountKeyCheckValue);
    return assertEqual(buffer, ACCOUNT_KEY_CHECK_VALUE_DATA);
  } catch (error: unknown) {
    // If decrypt fails, the key is invalid
    console.error("Decrypt Text Failed", (error as Error).message);
    return false;
  }
}

/**
 * Export account key to ArrayBuffer format.
 * @param accountKey The CryptoKey to export
 * @returns Promise<ArrayBuffer> The exported key as ArrayBuffer
 */
export function exportAccountKey(accountKey: CryptoKey): Promise<ArrayBuffer> {
  return window.crypto.subtle.exportKey("raw", accountKey);
}

/**
 * Import account key from ArrayBuffer to CryptoKey.
 * @param accountKeyBuffer The ArrayBuffer containing the key data
 * @returns Promise<CryptoKey> The imported account key
 */
export function importAccountKey(
  accountKeyBuffer: ArrayBuffer,
): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    "raw",
    accountKeyBuffer,
    ACCOUNT_KEY_CONFIG.algorithm.name,
    ACCOUNT_KEY_CONFIG.extractable,
    ACCOUNT_KEY_CONFIG.keyUsages,
  );
}

//------------------------------------------------------------------------------
// Encryption Utility Functions
//------------------------------------------------------------------------------
/**
 * API to encrypt text
 * @param key CryptoKey User's account key
 * @param str string to encrypt (prayer)
 * @returns Promise<EncryptedData>
 */
export function encryptText(
  key: CryptoKey,
  str: string,
): Promise<EncryptedData> {
  return encrypt(key, strToBuffer(str));
}

/**
 * API to decrypt text
 * @param key CryptoKey User's account key
 * @param encryptedData EncryptedData containined text (prayer)
 * @returns Promise<string | null>
 */
export async function decryptText(
  key: CryptoKey,
  encryptedData: EncryptedData,
): Promise<string | null> {
  try {
    return bufferToStr(await decrypt(key, encryptedData));
  } catch (error: unknown) {
    // If decrypt fails, the key is invalid
    console.error("Decrypt Text Failed", (error as Error).message);
    return null;
  }
}

/**
 * Helper function for encrypting data.
 * @param key CryptoKey
 * @param data ArrayBuffer
 * @returns Promise<EncryptedData>
 */
async function encrypt(
  key: CryptoKey,
  data: ArrayBuffer,
): Promise<EncryptedData> {
  const iv = generateIV();
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      ...ENCRYPT_DATA_CONFIG.algorithm,
      iv,
    },
    key,
    data,
  );
  return {
    iv,
    data: ciphertext,
  };
}

/**
 * Helper function for decrypting data.
 * @param key CryptoKey
 * @param encryptedData EncryptedData
 * @returns Promise<ArrayBuffer>
 */
function decrypt(
  key: CryptoKey,
  encryptedData: EncryptedData,
): Promise<ArrayBuffer> {
  return window.crypto.subtle.decrypt(
    {
      ...ENCRYPT_DATA_CONFIG.algorithm,
      iv: encryptedData.iv,
    },
    key,
    encryptedData.data,
  );
}

//------------------------------------------------------------------------------
// End-to-End Encryption (E2EE) Utility Functions
//------------------------------------------------------------------------------
/**
 * Generate a new data passphrase derived key derivation params for an e2ee
 * account.
 * @returns DataPassphraseDerivedKeyDerivationParamts
 */
export function generateDataPassphraseDerivedKeyDerivationParams(): DataPassphraseDerivedKeyDerivationParams {
  return {
    salt: window.crypto.getRandomValues(
      new Uint8Array(
        DATA_PASSPHRASE_DERIVED_KEY_DERIVATION_PARAMS_CONFIG.saltLength,
      ),
    ).buffer,
  };
}
/**
 * Derive the data passphrase derived key from data passphrase and derivation parameters.
 * @param dataPassphrase The data passphrase string
 * @param dataPassphraseDerivedKeyDerivationParams The derivation parameters
 * @returns Promise<CryptoKey> The derived data passphrase key
 */
export async function deriveDataPassphraseDerivedKey(
  dataPassphrase: string,
  dataPassphraseDerivedKeyDerivationParams: DataPassphraseDerivedKeyDerivationParams,
): Promise<CryptoKey> {
  // Convert dataPassphrase to CryptoKey key material
  const dataPassphraseKeyMaterial =
    await importDataPassphraseKeyMaterial(dataPassphrase);
  return window.crypto.subtle.deriveKey(
    {
      ...DATA_PASSPHRASE_DERIVED_KEY_DERIVATION_PARAMS_CONFIG.algorithm,
      salt: dataPassphraseDerivedKeyDerivationParams.salt,
    },
    dataPassphraseKeyMaterial,
    DATA_PASSPHRASE_DERIVED_KEY_CONFIG.algorithm,
    DATA_PASSPHRASE_DERIVED_KEY_CONFIG.extractable,
    DATA_PASSPHRASE_DERIVED_KEY_CONFIG.keyUsages,
  );
}

/**
 * Wrap an account key to encrypt it with the data passphrase derived key.
 * @param accountKey The CryptoKey to wrap
 * @param dataPassphraseDerivedKey The CryptoKey used for wrapping
 * @returns Promise<EncryptedData> The wrapped account key as encrypted data
 */
export async function wrapAccountKey(
  accountKey: CryptoKey,
  dataPassphraseDerivedKey: CryptoKey,
): Promise<EncryptedData> {
  const iv = generateIV();
  const wrappedKey = await window.crypto.subtle.wrapKey(
    "raw",
    accountKey,
    dataPassphraseDerivedKey,
    {
      ...ENCRYPT_DATA_CONFIG.algorithm,
      iv,
    },
  );
  return {
    iv,
    data: wrappedKey,
  };
}

/**
 * Unwrap EncryptedData to get the account key.
 * @param protectedAccountKey The EncryptedData containing the wrapped account key
 * @param dataPassphraseDerivedKey The CryptoKey used for unwrapping
 * @returns Promise<CryptoKey> The unwrapped account key
 */
export function unwrapAccountKey(
  protectedAccountKey: EncryptedData,
  dataPassphraseDerivedKey: CryptoKey,
): Promise<CryptoKey> {
  return window.crypto.subtle.unwrapKey(
    "raw",
    protectedAccountKey.data,
    dataPassphraseDerivedKey,
    {
      ...ENCRYPT_DATA_CONFIG.algorithm,
      iv: protectedAccountKey.iv,
    },
    ACCOUNT_KEY_CONFIG.algorithm.name,
    ACCOUNT_KEY_CONFIG.extractable,
    ACCOUNT_KEY_CONFIG.keyUsages,
  );
}

/**
 * Deep compare if two EncryptedData objects are equal.
 * @param a EncryptedData
 * @param b EncryptedData
 * @returns boolean
 */
export function assertEqualEncryptedData(
  a: EncryptedData,
  b: EncryptedData,
): boolean {
  return assertEqual(a.iv, b.iv) && assertEqual(a.data, b.data);
}

//------------------------------------------------------------------------------
// Helper Utility Functions
//------------------------------------------------------------------------------
/**
 * Convert data passphrase to key material for key derivation operations.
 * @param dataPassphrase The data passphrase string
 * @returns Promise<CryptoKey> The key material for derivation
 */
function importDataPassphraseKeyMaterial(
  dataPassphrase: string,
): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(dataPassphrase),
    DATA_PASSPHRASE_KEY_MATERIAL_CONFIG.algorithm,
    DATA_PASSPHRASE_KEY_MATERIAL_CONFIG.extractable,
    DATA_PASSPHRASE_KEY_MATERIAL_CONFIG.keyUsages,
  );
}

/**
 * Generate a random initialization vector for encryption
 * @returns ArrayBuffer IV
 */
function generateIV(): ArrayBuffer {
  return window.crypto.getRandomValues(
    new Uint8Array(ENCRYPT_DATA_CONFIG.ivLength),
  ).buffer;
}

/**
 * Convert string to ArrayBuffer.
 * @param str The string to convert
 * @returns ArrayBuffer The ArrayBuffer representation of the string
 */
function strToBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer as ArrayBuffer;
}

/**
 * Convert buffer to string.
 * @param buffer buffer to convert
 * @returns String representation of buffer
 */
function bufferToStr(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

/**
 * Check two array buffers for equality
 * @param a ArrayBuffer
 * @param b ArrayBuffer
 * @returns boolean
 */
function assertEqual(buffer1: ArrayBuffer, buffer2: ArrayBuffer) {
  if (buffer1.byteLength !== buffer2.byteLength) {
    return false;
  }

  // Create Uint8Array views for element-wise comparison
  const view1 = new Uint8Array(buffer1);
  const view2 = new Uint8Array(buffer2);

  // Compare each byte
  for (let i = 0; i < view1.byteLength; i++) {
    if (view1[i] !== view2[i]) {
      return false; // Found a difference
    }
  }

  return true; // All bytes are equal
}
