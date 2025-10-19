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

export interface EstablishKeysBox {
  keys: Keys;
  isNew?: boolean;
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

// /**
//  * Establish keys from keySettings if they are valid. Can be called at any time.
//  * @param keySettings KeySettings
//  * @returns Keys
//  */
// export async function establishKeys(
//   keySettings?: KeySettings,
//   dataPassphrase?: string,
// ): Promise<EstablishKeysBox> {
//   if (keySettings !== undefined && Object.keys(keySettings).length !== 0) {
//     let key: CryptoKey | undefined = undefined;
//     if (keySettings.unprotectedAccountKey) {
//       // If we have unprotected account key
//       const importKey = await importAccountKey(
//         keySettings.unprotectedAccountKey,
//       );
//       if (await checkAccountKey(importKey, keySettings.accountKeyCheckValue)) {
//         key = importKey;
//       } else {
//         // Key is invalid, this should never happen
//         console.error(
//           "Account keys are invalid. Please contact Prayday support.",
//         );
//       }
//     } else if (loadKeysFromLocal()) {
//       // TODO: Load keys from local storage
//     } else if (
//       dataPassphrase &&
//       keySettings.protectedAccountKey &&
//       keySettings.dataPassphraseDerivedKeyDerivationParams
//     ) {
//       // E2EE is on, unwrap protected account key with data passphrase derived key
//       const dataPassphraseDerivedKey = await deriveDataPassphraseDerivedKey(
//         dataPassphrase,
//         keySettings.dataPassphraseDerivedKeyDerivationParams,
//       );
//       key = await unwrapAccountKey(
//         keySettings.protectedAccountKey,
//         dataPassphraseDerivedKey,
//       );
//     }
//     return { keys: createKeysFromKeySettings(keySettings, key) };
//   } else {
//     // We have no key settings, generate new Keys
//     return { keys: await generateNewKeys(), isNew: true };
//   }
// }

// TODO: Write keys to local
/**
 * Load an account key from local storage
 * @param accountFullId Account id ending in @cloud or @local
 * @returns
 */
export function loadAccountKeyFromLocal(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  accountFullId: string,
): Promise<CryptoKey | undefined> {
  return Promise.resolve(undefined);
}

// TODO: Implement write keys to local
/**
 * Write account keys to local storage
 * @param accountFullId Full account id to write to local Storage
 * @param Keys
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function writeAccountKeysToLocal(accountFullId: string, Keys: Keys) {
  return;
}
