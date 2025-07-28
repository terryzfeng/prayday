import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./config";
import { midnight as midnight } from "../date-utils";
import { USER_HISTORY_SIZE } from "lib/stores/userHistoryStore";

export interface PrayHistoryItem {
  timestamp: Timestamp;
  prayCount: number;
}

/**
 * Fetch user information from firebase.
 * @param userId userId
 * @returns success and data for user document
 */
export async function getUserData(userId: string) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

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
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Add a prayer history entry on a specific day. Default date is today.
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
