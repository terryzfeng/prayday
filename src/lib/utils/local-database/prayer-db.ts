import type PrayerRequest from "../prayer-request";
import {
  deserializeLocalPrayerRequest,
  serializePrayerRequest,
  type LocalPrayerRequest,
} from "./local-prayer-request";
import { praydayDB, DB_STORES } from "./prayday-db";

/**
 * Indexed DB Database Configuration
 */
const STORE_NAME = DB_STORES.PRAYERS.name;

/**
 * Write PrayerRequest to IndexedDB. Will overwrite if already exists.
 * @param accountId Unique identifier for the account
 * @param PrayerRequest to save
 * @returns Promise<void>
 */
export async function writePrayerRequestToLocal(
  accountId: string,
  prayerRequest: PrayerRequest,
): Promise<void> {
  const db = await praydayDB;

  const serialized = serializePrayerRequest(accountId, prayerRequest);
  if (!serialized.success) {
    throw new Error(`Failed to serialize PrayerRequest: ${serialized.error}`);
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Use the serialized data (which is in serialized.data)
    const request = store.put(serialized.data);

    request.onerror = () => {
      reject(new Error(`Failed to save PrayerRequest: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Get all PrayerRequests from IndexedDB.
 * @returns Promise<PrayerRequest[]> All PrayerRequests
 */
export async function getAllPrayerRequestsFromLocal(
  accountId: string,
): Promise<PrayerRequest[]> {
  const db = await praydayDB;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const index = store.index("accountId");
    const request = index.getAll(accountId);

    request.onerror = () => {
      reject(new Error(`Failed to load PrayerRequests: ${request.error}`));
    };

    request.onsuccess = () => {
      const localPrayers = request.result as LocalPrayerRequest[];
      const localPrayerRequests = localPrayers
        .map((localPrayer) => {
          if (localPrayer.accountId === accountId) {
            return deserializeLocalPrayerRequest(localPrayer);
          } else {
            return null;
          }
        })
        .filter((prayerRequest) => prayerRequest !== null);
      resolve(localPrayerRequests);
    };
  });
}

/**
 * Delete a PrayerRequest from IndexedDB.
 * @param PrayerRequest to delete
 * @returns Promise<void>
 */
export async function deletePrayerRequestFromLocal(
  prayerUUID: string,
): Promise<void> {
  const db = await praydayDB;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete(prayerUUID);

    request.onerror = () => {
      reject(new Error(`Failed to delete PrayerRequest: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Clear all PrayerRequests from IndexedDB.
 * @returns Promise<void>
 */
export async function clearAllPrayerRequestsFromLocal(): Promise<void> {
  const db = await praydayDB;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.clear();

    request.onerror = () => {
      reject(new Error(`Failed to clear PrayerRequests: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}
