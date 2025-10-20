import { praydayDB, DB_STORES } from "./prayday-db";
import {
  createPrayerFromSerializedPrayer,
  serializePrayerWithAccountId,
  type SerializedPrayerRequest,
} from "lib/utils/serialized-prayer-request";
import PrayerRequest from "lib/utils/prayer-request";

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

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.put(
      serializePrayerWithAccountId(accountId, prayerRequest),
    );

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
      const serializedPrayers = request.result as SerializedPrayerRequest[];
      // Will ignore accountId in SerializedPrayerRequest as it doesn't get kept
      const prayerRequests = serializedPrayers
        .map(createPrayerFromSerializedPrayer)
        .filter((prayer) => prayer !== null);
      resolve(prayerRequests);
    };
  });
}

/**
 * Delete a PrayerReqest from IndexedDB.
 * @param accountId Unique identifier for the account
 * @param PrayerRequest to delete
 * @returns Promise<void>
 */
export async function deletePrayerRequestFromLocal(
  accountId: string,
  prayerUUID: string,
): Promise<void> {
  const db = await praydayDB;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete([accountId, prayerUUID]);

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
