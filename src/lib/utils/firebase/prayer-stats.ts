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

export async function incrementGlobalPrayerCount() {
  try {
    await updateDoc(globalStatsRef, {
      globalPrayerCount: increment(1),
    });
  } catch (error: any) {
    console.error("Error incrementing global prayer count:", error);
  }
}

export async function subtractGlobalPrayerCount(amount: number) {
  try {
    await updateDoc(globalStatsRef, {
      globalPrayerCount: increment(-amount),
    });
  } catch (error: any) {
    console.error("Error decrementing global prayer count:", error);
  }
}

// NOTE: When prayer requests are deleted, the global prayer count won't decrement

// TODO: Calculate through every user and compute the number of prayers prayed
async function calculateGlobalPrayerCount(): Promise<number> {
  try {
    let totalCount = 0;

    // Get all users
    const usersSnapshot = await getDocs(collection(db, "users"));

    // Iterate through each user
    for (const userDoc of usersSnapshot.docs) {
      // Get all prayers for this user
      const prayersSnapshot = await getDocs(
        collection(db, "users", userDoc.id, "prayers"),
      );
      console.log(userDoc.id)

      // Sum up pray counts from each prayer document
      for (const prayerDoc of prayersSnapshot.docs) {
        const prayerData = prayerDoc.data();
        if (prayerData.prayCount) {
          totalCount += prayerData.prayCount;
          console.log("counts", prayerData.prayCount);
        }
      }
    }

    console.log("Calculated global prayer count:", totalCount)

    return totalCount;
  } catch (error) {
    console.error("Error calculating global prayer count:", error);
    return -1;
  }
}

// DANGEROUS: CALCULATE GLOBAL PRAYER COUNT
// NOTE: NEED TO UPDATE PERMISSION
// calculateGlobalPrayerCount();