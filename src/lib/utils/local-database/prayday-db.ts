/**
 * IndexedDB Database Configuration for Prayday
 *
 * This singleton local database instance is shared across the application for
 * local key storage and prayer data.
 */

const DB_NAME = "praydayDB";
const DB_VERSION = 2;
export const DB_STORES = {
  KEYS: {
    name: "keys",
  },
  PRAYERS: {
    name: "prayers",
    keyPath: ["accountId", "uuid"],
  },
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

      // Create KEYS store
      if (!db.objectStoreNames.contains(DB_STORES.KEYS.name)) {
        db.createObjectStore(DB_STORES.KEYS.name);
      }

      // Create PRAYERS store with indexes
      if (!db.objectStoreNames.contains(DB_STORES.PRAYERS.name)) {
        const prayersStore = db.createObjectStore(DB_STORES.PRAYERS.name, {
          keyPath: DB_STORES.PRAYERS.keyPath,
        });

        // Add indexes for efficient querying
        prayersStore.createIndex("accountId", "accountId", { unique: false });
        // prayersStore.createIndex('answered', ['accountId', 'answered'], { unique: false });
      }
    };
  });
}

export const praydayDB: Promise<IDBDatabase> = initializeDB();
