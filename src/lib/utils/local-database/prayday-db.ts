/**
 * IndexedDB Database Configuration for Prayday
 *
 * This singleton local database instance is shared across the application for
 * local key storage and prayer data.
 */
const DB_NAME = "praydayDB";
const DB_VERSION = 1;
export const DB_STORES = {
  KEYS: {
    name: "keys",
  },
  PRAYERS: {
    name: "prayers",
    keyPath: "uuid",
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

      // Create PRAYERS store with uuid as primary key
      if (!db.objectStoreNames.contains(DB_STORES.PRAYERS.name)) {
        const prayersStore = db.createObjectStore(DB_STORES.PRAYERS.name, {
          keyPath: "uuid",
        });

        // Index for querying prayers by account
        prayersStore.createIndex("accountId", "accountId", { unique: false });
        // Optional: Add more indexes based on your query patterns
        // prayersStore.createIndex("answered", ["accountId", "answered"], { unique: false });
      }
    };
  });
}

export const praydayDB: Promise<IDBDatabase> = initializeDB();
