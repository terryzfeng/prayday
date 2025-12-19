import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "./config";

export const globalStatsRef = doc(db, "global", "stats");

/**
 * Get global prayer count from firebase.
 * @returns global prayer count
 */
export async function getGlobalPrayerCount(): Promise<number> {
  try {
    const globalStatsDoc = await getDoc(globalStatsRef);
    if (globalStatsDoc.exists()) {
      if (globalStatsDoc.data().globalPrayerCount) {
        return globalStatsDoc.data().globalPrayerCount as number;
      }
    }
  } catch {
    console.error("Error retrieving global prayer count");
    return -1;
  }
  return -1;
}

/**
 * Increment the firebase global prayer count.
 */
export async function incrementGlobalPrayerCount() {
  try {
    await updateDoc(globalStatsRef, {
      globalPrayerCount: increment(1),
    });
  } catch (error: unknown) {
    console.error("Error incrementing global prayer count:", error as Error);
  }
}

/**
 * Subtract the firebase global prayer count.
 * @param amount to subtract
 */
export async function subtractGlobalPrayerCount(amount: number) {
  try {
    await updateDoc(globalStatsRef, {
      globalPrayerCount: increment(-amount),
    });
  } catch (error: unknown) {
    console.error("Error decrementing global prayer count:", error as Error);
  }
}

/**
 * Go through every user and manually compute the number of prayers prayed.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function calculateGlobalPrayerCount() {
  try {
    let totalCount = 0;

    // Get all users
    const usersSnapshot = await getDocs(collection(db, "users"));

    // Iterate through each user
    for (const userDoc of usersSnapshot.docs) {
      let userPrayerCount = 0;
      // Get all prayers from this user
      const prayersSnapshot = await getDocs(
        collection(db, "users", userDoc.id, "prayers"),
      );
      // Tally the prayCount from each prayer document
      for (const prayerDoc of prayersSnapshot.docs) {
        const prayerData = prayerDoc.data();
        if (prayerData.prayCount) {
          userPrayerCount += prayerData.prayCount;
        }
      }
      console.log(`User: ${userDoc.id}, Pray Count: ${userPrayerCount}`);

      totalCount += userPrayerCount;
    }
    console.log("Calculated global prayer count:", totalCount);
  } catch (error) {
    console.error("Error calculating global prayer count:", error);
  }
}

// NOTE: When prayer requests are deleted, the global prayer count won't decrement

// CAUTION: READ ALL USERS TO COUNT GLOBAL PRAYER COUNT
// NOTE: NEED TO UPDATE RULES PERMISSION
// calculateGlobalPrayerCount();
