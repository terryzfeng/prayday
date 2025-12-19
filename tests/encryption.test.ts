/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, expect, test, beforeEach } from "vitest";
import { webcrypto } from "crypto";

// Ensure we have a window object with crypto
(global as any).window = (global as any).window || {};
(global as any).window.crypto = webcrypto;

// Import the functions to test
import {
  generateAccountKey,
  generateAccountKeyCheckValue,
  checkAccountKey,
  exportAccountKey,
  importAccountKey,
  encryptText,
  decryptText,
  deriveDataPassphraseDerivedKey,
  wrapAccountKey,
  unwrapAccountKey,
  type EncryptedData,
  type DataPassphraseDerivedKeyDerivationParams,
} from "lib/utils/account/encryption";

describe("Account Key Operations", () => {
  describe("generateAccountKey", () => {
    test("should generate a valid CryptoKey", async () => {
      const key = await generateAccountKey();

      expect(key).toBeInstanceOf(CryptoKey);
      expect(key.algorithm.name).toBe("AES-GCM");
      expect((key.algorithm as AesKeyAlgorithm).length).toBe(256);
      expect(key.extractable).toBe(true);
      expect(key.usages).toEqual(["encrypt", "decrypt"]);
    });
  });

  describe("generateAccountKeyCheckValue", () => {
    test("should generate check value for account key", async () => {
      const key = await generateAccountKey();
      const checkValue = await generateAccountKeyCheckValue(key);

      expect(checkValue).toHaveProperty("iv");
      expect(checkValue).toHaveProperty("data");
      expect(checkValue.iv).toBeInstanceOf(ArrayBuffer);
      expect(checkValue.data).toBeInstanceOf(ArrayBuffer);
      expect(checkValue.iv.byteLength).toBe(12); // 96 bits
    });
  });

  describe("checkAccountKey", () => {
    test("should return true for valid key and check value", async () => {
      const key = await generateAccountKey();
      const checkValue = await generateAccountKeyCheckValue(key);

      const isValid = await checkAccountKey(key, checkValue);
      expect(isValid).toBe(true);
    });

    test("should return false for invalid key", async () => {
      const key1 = await generateAccountKey();
      const key2 = await generateAccountKey();
      const checkValue = await generateAccountKeyCheckValue(key1);

      const isValid = await checkAccountKey(key2, checkValue);
      expect(isValid).toBe(false);
    });

    test("should return false for corrupted check value", async () => {
      const key = await generateAccountKey();
      const checkValue = await generateAccountKeyCheckValue(key);

      // Corrupt the data
      const corruptedCheckValue: EncryptedData = {
        ...checkValue,
        data: new ArrayBuffer(16),
      };

      const isValid = await checkAccountKey(key, corruptedCheckValue);
      expect(isValid).toBe(false);
    });
  });

  describe("exportAccountKey and importAccountKey", () => {
    test("should export and import key successfully", async () => {
      const originalKey = await generateAccountKey();
      const exported = await exportAccountKey(originalKey);
      const imported = await importAccountKey(exported);

      expect(exported).toBeInstanceOf(ArrayBuffer);
      expect(exported.byteLength).toBe(32); // 256 bits
      expect(imported).toBeInstanceOf(CryptoKey);
      expect(imported.algorithm.name).toBe("AES-GCM");
    });

    test("should maintain key functionality after export/import", async () => {
      const originalKey = await generateAccountKey();
      const exported = await exportAccountKey(originalKey);
      const imported = await importAccountKey(exported);

      const testData = "test encryption data";
      const encrypted = await encryptText(originalKey, testData);
      const decrypted = await decryptText(imported, encrypted);

      expect(decrypted).toBe(testData);
    });
  });
});

describe("Text Encryption/Decryption", () => {
  let testKey: CryptoKey;

  beforeEach(async () => {
    testKey = await generateAccountKey();
  });

  describe("encryptText", () => {
    test("should encrypt text successfully", async () => {
      const plaintext = "Hello, World!";
      const encrypted = await encryptText(testKey, plaintext);

      expect(encrypted).toHaveProperty("iv");
      expect(encrypted).toHaveProperty("data");
      expect(encrypted.iv).toBeInstanceOf(ArrayBuffer);
      expect(encrypted.data).toBeInstanceOf(ArrayBuffer);
      expect(encrypted.iv.byteLength).toBe(12);
      expect(encrypted.data.byteLength).toBeGreaterThan(0);
    });

    test("should generate different ciphertexts for same plaintext", async () => {
      const plaintext = "Hello, World!";
      const encrypted1 = await encryptText(testKey, plaintext);
      const encrypted2 = await encryptText(testKey, plaintext);

      const ivBuffer1 = new Uint8Array(encrypted1.iv);
      const dataBuffer1 = new Uint8Array(encrypted1.data);
      const ivBuffer2 = new Uint8Array(encrypted2.iv);
      const dataBuffer2 = new Uint8Array(encrypted2.data);

      expect(ivBuffer1).not.toEqual(ivBuffer2);
      expect(dataBuffer1).not.toEqual(dataBuffer2);
    });

    test("should handle empty string", async () => {
      const plaintext = "";
      const encrypted = await encryptText(testKey, plaintext);

      expect(encrypted).toHaveProperty("iv");
      expect(encrypted).toHaveProperty("data");
    });

    test("should handle unicode characters", async () => {
      const plaintext = "🔐 Test with émojis and ñ characters";
      const encrypted = await encryptText(testKey, plaintext);
      const decrypted = await decryptText(testKey, encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe("decryptText", () => {
    test("should decrypt text successfully", async () => {
      const plaintext = "Hello, World!";
      const encrypted = await encryptText(testKey, plaintext);
      const decrypted = await decryptText(testKey, encrypted);

      expect(decrypted).toBe(plaintext);
    });

    test("should return empty string for invalid key", async () => {
      const plaintext = "Hello, World!";
      const wrongKey = await generateAccountKey();
      const encrypted = await encryptText(testKey, plaintext);

      const decrypted = await decryptText(wrongKey, encrypted);

      expect(decrypted).toBe(null);
    });

    test("should return empty string for corrupted data", async () => {
      const plaintext = "Hello, World!";
      const encrypted = await encryptText(testKey, plaintext);

      // Corrupt the encrypted data
      const corruptedData: EncryptedData = {
        ...encrypted,
        data: new ArrayBuffer(16),
      };

      const decrypted = await decryptText(testKey, corruptedData);

      expect(decrypted).toBe(null);
    });

    test("should handle large text", async () => {
      const plaintext = "A".repeat(10000);
      const encrypted = await encryptText(testKey, plaintext);
      const decrypted = await decryptText(testKey, encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });
});

describe("End-to-End Encryption (E2EE)", () => {
  const testPassphrase = "MySecurePassphrase123!";
  let salt: ArrayBuffer;
  let derivationParams: DataPassphraseDerivedKeyDerivationParams;

  beforeEach(() => {
    salt = crypto.getRandomValues(new Uint8Array(32)).buffer;
    derivationParams = { salt };
  });

  describe("deriveDataPassphraseDerivedKey", () => {
    test("should derive key from passphrase and salt", async () => {
      const derivedKey = await deriveDataPassphraseDerivedKey(
        testPassphrase,
        derivationParams,
      );

      expect(derivedKey).toBeInstanceOf(CryptoKey);
      expect(derivedKey.algorithm.name).toBe("AES-GCM");
      expect((derivedKey.algorithm as AesKeyAlgorithm).length).toBe(256);
      expect(derivedKey.extractable).toBe(false);
      expect(derivedKey.usages).toEqual(["wrapKey", "unwrapKey"]);
    });

    test("should generate same key for same passphrase and salt", async () => {
      const derivedKey1 = await deriveDataPassphraseDerivedKey(
        testPassphrase,
        derivationParams,
      );
      const derivedKey2 = await deriveDataPassphraseDerivedKey(
        testPassphrase,
        derivationParams,
      );

      // We can't compare keys directly, so test by wrapping/unwrapping
      const accountKey = await generateAccountKey();
      const wrapped1 = await wrapAccountKey(accountKey, derivedKey1);
      const unwrapped2 = await unwrapAccountKey(wrapped1, derivedKey2);

      expect(unwrapped2).toBeInstanceOf(CryptoKey);
    });

    test("should generate different keys for different salts", async () => {
      const salt2 = crypto.getRandomValues(new Uint8Array(32)).buffer;
      const derivationParams2 = { salt: salt2 };

      const derivedKey1 = await deriveDataPassphraseDerivedKey(
        testPassphrase,
        derivationParams,
      );
      const derivedKey2 = await deriveDataPassphraseDerivedKey(
        testPassphrase,
        derivationParams2,
      );

      const accountKey = await generateAccountKey();
      const wrapped1 = await wrapAccountKey(accountKey, derivedKey1);

      // Should fail to unwrap with different derived key
      await expect(unwrapAccountKey(wrapped1, derivedKey2)).rejects.toThrow();
    });
  });

  describe("wrapAccountKey and unwrapAccountKey", () => {
    let accountKey: CryptoKey;
    let derivedKey: CryptoKey;

    beforeEach(async () => {
      accountKey = await generateAccountKey();
      derivedKey = await deriveDataPassphraseDerivedKey(
        testPassphrase,
        derivationParams,
      );
    });

    test("should wrap and unwrap account key successfully", async () => {
      const wrapped = await wrapAccountKey(accountKey, derivedKey);
      const unwrapped = await unwrapAccountKey(wrapped, derivedKey);

      expect(wrapped).toHaveProperty("iv");
      expect(wrapped).toHaveProperty("data");
      expect(wrapped.iv.byteLength).toBe(12);
      expect(unwrapped).toBeInstanceOf(CryptoKey);
    });

    test("should maintain key functionality after wrap/unwrap", async () => {
      const wrapped = await wrapAccountKey(accountKey, derivedKey);
      const unwrapped = await unwrapAccountKey(wrapped, derivedKey);

      const testData = "test data for wrapped key";
      const encrypted = await encryptText(accountKey, testData);
      const decrypted = await decryptText(unwrapped, encrypted);

      expect(decrypted).toBe(testData);
    });

    test("should fail to unwrap with wrong derived key", async () => {
      const wrongSalt = crypto.getRandomValues(new Uint8Array(32)).buffer;
      const wrongDerivedKey = await deriveDataPassphraseDerivedKey(
        testPassphrase,
        { salt: wrongSalt },
      );

      const wrapped = await wrapAccountKey(accountKey, derivedKey);

      await expect(
        unwrapAccountKey(wrapped, wrongDerivedKey),
      ).rejects.toThrow();
    });

    test("should generate different wrapped data each time", async () => {
      const wrapped1 = await wrapAccountKey(accountKey, derivedKey);
      const wrapped2 = await wrapAccountKey(accountKey, derivedKey);

      const ivBuffer = new Uint8Array(wrapped1.iv);
      const dataBuffer = new Uint8Array(wrapped1.data);
      const ivBuffer2 = new Uint8Array(wrapped2.iv);
      const dataBuffer2 = new Uint8Array(wrapped2.data);

      expect(ivBuffer).not.toEqual(ivBuffer2);
      expect(dataBuffer).not.toEqual(dataBuffer2);
    });
  });
});

describe("Integration Tests", () => {
  test("should complete full E2EE workflow", async () => {
    // 1. Generate account key
    const accountKey = await generateAccountKey();

    // 2. Create check value
    const checkValue = await generateAccountKeyCheckValue(accountKey);
    expect(await checkAccountKey(accountKey, checkValue)).toBe(true);

    // 3. Encrypt some data
    const originalText = "Secret message for E2EE test";
    const encryptedText = await encryptText(accountKey, originalText);

    // 4. Derive key from passphrase
    const passphrase = "MySecurePassphrase123!";
    const salt = crypto.getRandomValues(new Uint8Array(32)).buffer;
    const derivedKey = await deriveDataPassphraseDerivedKey(passphrase, {
      salt,
    });

    // 5. Wrap account key
    const wrappedKey = await wrapAccountKey(accountKey, derivedKey);

    // 6. Simulate key recovery: derive key again and unwrap
    const recoveredDerivedKey = await deriveDataPassphraseDerivedKey(
      passphrase,
      { salt },
    );
    const recoveredAccountKey = await unwrapAccountKey(
      wrappedKey,
      recoveredDerivedKey,
    );

    // 7. Decrypt data with recovered key
    const decryptedText = await decryptText(recoveredAccountKey, encryptedText);

    expect(decryptedText).toBe(originalText);
  });

  test("should handle export/import in E2EE workflow", async () => {
    // Generate and export account key
    const accountKey = await generateAccountKey();
    const exportedKey = await exportAccountKey(accountKey);
    const importedKey = await importAccountKey(exportedKey);

    // Use imported key in E2EE workflow
    const passphrase = "TestPassphrase456!";
    const salt = crypto.getRandomValues(new Uint8Array(32)).buffer;
    const derivedKey = await deriveDataPassphraseDerivedKey(passphrase, {
      salt,
    });

    const wrappedKey = await wrapAccountKey(importedKey, derivedKey);
    const recoveredKey = await unwrapAccountKey(wrappedKey, derivedKey);

    // Test encryption/decryption with recovered key
    const testMessage = "Test message with exported key";
    const encrypted = await encryptText(importedKey, testMessage);
    const decrypted = await decryptText(recoveredKey, encrypted);

    expect(decrypted).toBe(testMessage);
  });
});

describe("Edge Cases and Error Handling", () => {
  test("should handle very long passphrases", async () => {
    const longPassphrase = "A".repeat(1000);
    const salt = crypto.getRandomValues(new Uint8Array(32)).buffer;

    const derivedKey = await deriveDataPassphraseDerivedKey(longPassphrase, {
      salt,
    });
    expect(derivedKey).toBeInstanceOf(CryptoKey);
  });

  test("should handle special characters in passphrase", async () => {
    const specialPassphrase = "!@#$%^&*()_+-=[]{}|;:,.<>?`~\"'\\";
    const salt = crypto.getRandomValues(new Uint8Array(32)).buffer;

    const derivedKey = await deriveDataPassphraseDerivedKey(specialPassphrase, {
      salt,
    });
    expect(derivedKey).toBeInstanceOf(CryptoKey);
  });

  test("should handle zero-length salt gracefully", async () => {
    const passphrase = "TestPassphrase";
    const emptySalt = new ArrayBuffer(0);

    // This should still work as PBKDF2 can handle empty salt
    const derivedKey = await deriveDataPassphraseDerivedKey(passphrase, {
      salt: emptySalt,
    });
    expect(derivedKey).toBeInstanceOf(CryptoKey);
  });
});
