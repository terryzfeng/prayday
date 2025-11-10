import {
  DocumentReference,
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./config";
import { midnight } from "../date-utils";
import { USER_HISTORY_SIZE } from "lib/stores/userHistoryStore";
import { type KeySettings } from "../account/keys";
import {
  deserializeFirebaseKeySettings,
  serializeKeySettings,
  type FirebaseKeySettings,
} from "./firebase-key-settings";
import { type Result } from "lib/utils/result";

export type FirebaseAccountSettingsResult = Result<{
  firebaseAccountSettings: FirebaseAccountSettings;
  keySettings: KeySettings;
  fromCache?: boolean;
  getAccountSettingsFromServer?: Promise<FirebaseAccountSettingsResult>;
}>;

// Firebase Firestore User Doc Account Settings
export interface FirebaseAccountSettings {
  name: string;
  email: string;
}

export interface PrayHistoryItem {
  timestamp: Timestamp;
  prayCount: number;
}

//------------------------------------------------------------------------------
// Firebase Key Settings
//------------------------------------------------------------------------------
/**
 * Write key settings to firebase. Will return Promise<void> with resolve if 
 * successful, hang indefinitely if failure.
 * @param userId
 * @param keySettings
 */
export async function uploadKeySettings(
  userId: string,
  keySettings: KeySettings,
): Promise<void> {
  // offline
  return setDoc(
    doc(db, "users", userId, "keys", "keySettings"),
    serializeKeySettings(keySettings),
  );
}

//------------------------------------------------------------------------------
// Firebase Account Settings
//------------------------------------------------------------------------------
/**
 * Get account settings from server asynchronous
 * @param userDocRef user doc reference
 * @returns Box<FirebaseAccountSettings>
 */
async function getAccountSettingsFromServer(
  userDocRef: DocumentReference,
  keySettingsDocRef: DocumentReference,
): Promise<FirebaseAccountSettingsResult> {
  try {
    const serverUserDoc = await getDocFromServer(userDocRef);
    const serverKeySettingsDoc = await getDocFromServer(keySettingsDocRef);
    if (serverUserDoc.exists()) {
      return {
        success: true,
        data: {
          firebaseAccountSettings:
            serverUserDoc.data() as FirebaseAccountSettings,
          keySettings: deserializeFirebaseKeySettings(
            serverKeySettingsDoc.data() as FirebaseKeySettings,
          ),
          fromCache: false,
        },
      };
    }
    throw new Error("User account settings not found");
  } catch (_: unknown) {
    return {
      success: false,
      error: "Failed to sync user account with server, may be offline.",
    };
  }
}

/**
 * Fetch user account settings from firebase
 * @param userId userId
 * @returns success and data for user document
 */
export async function getAccountSettings(
  userId: string,
): Promise<FirebaseAccountSettingsResult> {
  // Try to pull account data settings from Firestore cache
  const userDocRef = doc(db, "users", userId);
  const keySettingsDocRef = doc(db, "users", userId, "keys", "keySettings");

  try {
    // First, try to get from cache only, will throw error if not in cache
    const cachedUserDoc = await getDocFromCache(userDocRef);
    const cachedKeySettingsDoc = await getDocFromCache(keySettingsDocRef);

    if (cachedUserDoc.exists() && cachedKeySettingsDoc.exists()) {
      return {
        success: true,
        data: {
          firebaseAccountSettings:
            cachedUserDoc.data() as FirebaseAccountSettings,
          keySettings: deserializeFirebaseKeySettings(
            cachedKeySettingsDoc.data() as FirebaseKeySettings,
          ),
          fromCache: true,
          getAccountSettingsFromServer: getAccountSettingsFromServer(
            userDocRef,
            keySettingsDocRef,
          ),
        },
      };
    }
    throw new Error("User account settings not in firebase cache");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    // If not in cache, fall back to server
    const serverUserDoc = await getDocFromServer(userDocRef);
    const serverKeySettingsDoc = await getDocFromServer(keySettingsDocRef);

    if (serverUserDoc.exists() && serverKeySettingsDoc.exists()) {
      return {
        success: true,
        data: {
          firebaseAccountSettings:
            serverUserDoc.data() as FirebaseAccountSettings,
          keySettings: deserializeFirebaseKeySettings(
            serverKeySettingsDoc.data() as FirebaseKeySettings,
          ),
          fromCache: false,
        },
      };
    }
    // Otherwise we failed to initialize firebase account settings when we had
    // a firebase account. May be offline
    return {
      success: false,
      error:
        "Failed to get account settings from server, may be offline. Please try again later. If the issue persists, please contact Prayday support.",
    };
  }
}

// Create a firebase user account settings and keys
export async function createFirebaseAccountSettings(
  userId: string,
  firebaseAccountSettings: FirebaseAccountSettings,
  keySettings: KeySettings,
): Promise<boolean> {
  try {
    await setDoc(doc(db, "users", userId), firebaseAccountSettings);
    await uploadKeySettings(userId, keySettings);
    return true;
  } catch (error: unknown) {
    console.log("Unable to contact server:", (error as Error).message);
    return false;
  }
}

//------------------------------------------------------------------------------
// User Pray History
//------------------------------------------------------------------------------
/**
 * Get userId's prayHistory in the last USER_HISTORY_SIZE days, ordered by date.
 * @param userId userId
 * @returns JSON of success, error, and data: Promise<PrayHistoryItem[]>
 */
export async function queryPrayerHistory(userId: string) {
  const results: PrayHistoryItem[] = [];

  try {
    const today = midnight();
    const thirtyFiveDaysAgo = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - USER_HISTORY_SIZE,
    );
    const startTimestamp = Timestamp.fromMillis(thirtyFiveDaysAgo.getTime());

    const q = query(
      collection(db, `users/${userId}/prayHistory`),
      where("timestamp", ">=", startTimestamp),
      orderBy("timestamp", "desc"), // Order by date in descending order (most recent first)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      results.push(doc.data() as PrayHistoryItem);
    });
    return { success: true, data: results };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Add a prayer history entry on a specific day. Default date is today.
 * TODO: This may not work in offline mode. May be broken.
 * @param userId userId
 * @param date date which user prayer, default today
 */
export async function addPrayHistoryEntry(
  userId: string,
  date: Date = new Date(),
) {
  const dateTimestamp = Timestamp.fromDate(midnight(date)); // Store the date as a Firestore Timestamp
  const dateDocRef = doc(
    db,
    `users/${userId}/prayHistory`,
    dateTimestamp.toMillis().toString(),
  ); // Use timestamp as the document ID

  // Get the document for the date
  const todaysPrayHistoryDoc = await getDoc(dateDocRef);

  if (todaysPrayHistoryDoc.exists()) {
    // Document exists, so increment the count
    await updateDoc(dateDocRef, {
      prayCount: increment(1),
    });
  } else {
    // Document doesn't exist, so add a new document
    const prayHistoryItem: PrayHistoryItem = {
      timestamp: dateTimestamp,
      prayCount: 1,
    };
    await setDoc(dateDocRef, prayHistoryItem);
  }
}
