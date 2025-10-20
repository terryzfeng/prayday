/**
 * IndexedDB Database Configuration for Prayday
 *
 * This singleton local database instance is shared across the application for
 * local key storage and prayer data.
 */

const DB_NAME = "praydayDB";
const DB_VERSION = 1;
export const DB_STORES = {
  KEYS: "keys",
  PRAYERS: "prayers",
};

/**
 * Initialize the database and create object stores
 * This is called once and the result is cached as a singleton
 */
function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error(`Failed to open praydayDB: ${request.error}`);
      reject(new Error(`Failed to open praydayDB: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create all object stores if they don't exist
      for (const storeName of Object.values(DB_STORES)) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      }
    };
  });
}

export const praydayDB: Promise<IDBDatabase> = initializeDB();
