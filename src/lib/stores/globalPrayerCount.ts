import { writable } from "svelte/store";
import { onSnapshot } from "firebase/firestore";
import {
  globalStatsRef,
  getGlobalPrayerCount,
  incrementGlobalPrayerCount,
} from "../utils/firebase/prayer-stats";

/**
 * Create a writable store for global prayer count.
 */
function createGlobalPrayerStore() {
  const { subscribe, set } = writable<number>(0);

  // Get count from firebase
  getGlobalPrayerCount().then((count) => {
    if (count !== -1) {
      set(count);
    }
  });

  const unsubscribe = onSnapshot(
    globalStatsRef,
    (snapshot) => {
      if (
        snapshot.exists() &&
        snapshot.data().globalPrayerCount !== undefined
      ) {
        set(snapshot.data().globalPrayerCount);
      }
    },
    (error) => {
      console.error("Error getting global prayer count:", error);
    },
  );

  return {
    subscribe,
    increment: async () => await incrementGlobalPrayerCount(),
    destroy: () => unsubscribe(),
  };
}

export const globalPrayerCount = createGlobalPrayerStore();
