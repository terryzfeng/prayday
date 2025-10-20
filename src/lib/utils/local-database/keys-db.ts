import { praydayDB, DB_STORES } from "./prayday-db";
import { type Keys } from "lib/utils/account/keys";

/**
 * IndexedDB Database Configuration
 */
const STORE_NAME = DB_STORES.KEYS;

/**
 * Save Keys object to IndexedDB. Includes account key and key settings.
 * @param accountFullId Unique identifier for the account
 * @param keys Keys object to save
 * @returns Promise<void>
 */
export async function writeKeysToLocal(
  accountFullId: string,
  keys: Keys,
): Promise<void> {
  const db = await praydayDB;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.put(keys, accountFullId);

    request.onerror = () => {
      reject(new Error(`Failed to save keys: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Load Keys from IndexedDB.
 * @param accountFullId Unique identifier for the account
 * @returns Promise<Keys | null> The saved Keys or null if not found
 */
export async function loadKeysFromLocal(
  accountFullId: string,
): Promise<Keys | null> {
  const db = await praydayDB;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.get(accountFullId);

    request.onerror = () => {
      reject(new Error(`Failed to load keys: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve(request.result || null);
    };
  });
}

/**
 * Load Account Key from IndexedDB
 * @param accountFullId Unique identifier for the account
 * @returns Promise<CryptoKey | null> The saved account key from Keys or null if not found
 */
export async function loadAccountKeyFromLocal(
  accountFullId: string,
): Promise<CryptoKey | null> {
  const keys = await loadKeysFromLocal(accountFullId);
  if (keys === null || keys.key === undefined) {
    return null;
  }
  return keys.key;
}

/**
 * Delete Keys from IndexedDB.
 * @param accountFullId Unique identifier for the account
 * @returns Promise<void>
 */
export async function deleteKeysFromLocal(
  accountFullId: string,
): Promise<void> {
  const db = await praydayDB;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete(accountFullId);

    request.onerror = () => {
      reject(new Error(`Failed to delete keys: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Check if Keys exist in IndexedDB.
 * @param accountFullId Unique identifier for the account
 * @returns Promise<boolean> true if keys exist, false otherwise
 */
export async function keysExistLocal(accountFullId: string): Promise<boolean> {
  const keys = await loadKeysFromLocal(accountFullId);
  return keys !== null;
}

/**
 * Clear all data from the keys store in IndexedDB.
 * @returns Promise<void>
 */
export async function clearAllLocalKeys(): Promise<void> {
  const db = await praydayDB;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.clear();

    request.onerror = () => {
      reject(new Error(`Failed to clear keys store: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}
