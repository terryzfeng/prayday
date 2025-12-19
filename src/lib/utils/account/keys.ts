import {
  type EncryptedData,
  type DataPassphraseDerivedKeyDerivationParams,
  generateAccountKey,
  exportAccountKey,
  generateAccountKeyCheckValue,
  checkAccountKey,
  importAccountKey,
  deriveDataPassphraseDerivedKey,
  unwrapAccountKey,
  assertEqualEncryptedData,
} from "./encryption";

/**
 * Keys for an account. Stored in account settings.
 * - Key is used to encrypt/decrypt data
 * - keySettings is the config for the account key, in exported format.
 */
export interface Keys {
  key?: CryptoKey;
  keySettings: KeySettings;
}

/**
 * Export/Serialized format of an account key. Stored in Firebase.
 */
export interface KeySettings {
  accountKeyCheckValue: EncryptedData;
  unprotectedAccountKey?: ArrayBuffer;
  protectedAccountKey?: EncryptedData;
  dataPassphraseDerivedKeyDerivationParams?: DataPassphraseDerivedKeyDerivationParams;
}

//------------------------------------------------------------------------------
// Keys API
//------------------------------------------------------------------------------
/**
 * Generate new keys for an account.
 * @returns Keys
 */
export async function generateNewKeys(): Promise<Keys> {
  const key = await generateAccountKey();
  return {
    key,
    keySettings: {
      accountKeyCheckValue: await generateAccountKeyCheckValue(key),
      unprotectedAccountKey: await exportAccountKey(key),
    },
  };
}

/**
 * Quick compare if keySettings are equal. Checks for field presence.
 * @param KeySettings
 */
export function quickCompareKeySettings(
  a: KeySettings,
  b: KeySettings,
): boolean {
  // Check e2ee states are the same, if both have unprotected account key
  const aHasUnprotected = a.unprotectedAccountKey !== undefined;
  const bHasUnprotected = b.unprotectedAccountKey !== undefined;
  if (aHasUnprotected !== bHasUnprotected) {
    return false;
  }
  // Quick compare and return if accountKeyCheckValue is the same
  return assertEqualEncryptedData(
    a.accountKeyCheckValue,
    b.accountKeyCheckValue,
  );
}

/**
 * Structure keySettings to Keys
 * @param keySettings KeySettings
 * @returns keys Keys
 */
export function createKeysFromKeySettings(
  keySettings: KeySettings,
  key?: CryptoKey,
): Keys {
  return { key, keySettings };
}

/**
 * Import keySettings to Keys, importing unprotected key to keys.key if possible
 * @param keySettings KeySettings
 * @returns Keys with keys.key if unprotected present
 */
export async function importAccountKeys(
  keySettings: KeySettings,
): Promise<Keys> {
  if (keySettings.unprotectedAccountKey) {
    const importedKey = await importAccountKey(
      keySettings.unprotectedAccountKey,
    );
    if (await checkAccountKey(importedKey, keySettings.accountKeyCheckValue)) {
      return createKeysFromKeySettings(keySettings, importedKey);
    } else {
      // Key is invalid, this should never happen
      console.error(
        "Account keys are invalid. Please contact Prayday support.",
      );
    }
  }
  return createKeysFromKeySettings(keySettings);
}

/**
 * Unwrap protected account key with data passphrase to get Keys
 * @param keySettings account KeySettings
 * @param dataPassphrase user data passphrase
 * @returns Keys
 */
export async function extractKeysWithDataPassphrase(
  keySettings: KeySettings,
  dataPassphrase: string,
): Promise<Keys> {
  // E2EE is on, unwrap protected account key with data passphrase derived key
  if (
    dataPassphrase &&
    keySettings.protectedAccountKey &&
    keySettings.dataPassphraseDerivedKeyDerivationParams
  ) {
    try {
      const dataPassphraseDerivedKey = await deriveDataPassphraseDerivedKey(
        dataPassphrase,
        keySettings.dataPassphraseDerivedKeyDerivationParams,
      );
      const unwrappedKey = await unwrapAccountKey(
        keySettings.protectedAccountKey,
        dataPassphraseDerivedKey,
      );
      if (
        await checkAccountKey(unwrappedKey, keySettings.accountKeyCheckValue)
      ) {
        return createKeysFromKeySettings(keySettings, unwrappedKey);
      } else {
        // Key is invalid, this should never happen
        console.error(
          "Account keys are invalid. Please contact Prayday support.",
        );
      }
    } catch (_: unknown) {
      // Failed to unwrap, wrong data passphrase, gracefully do nothing.
    }
  }
  return createKeysFromKeySettings(keySettings);
}
