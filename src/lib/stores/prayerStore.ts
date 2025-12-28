import { writable, derived, get } from "svelte/store";
import PrayerRequest from "lib/utils/prayer-request";
import { incrementGlobalPrayerCount } from "../utils/firebase/prayer-stats";
import { prayerSyncManager } from "../services/prayerSync/prayerSyncManager";
import {
  PrayerOperation,
  PrayerUpdateType,
} from "../services/prayerSync/prayerSyncService";
const STORAGE_DATE_KEY = "lastUpdated";

/**
 * Create prayer request array store
 */
function createPrayerStore() {
  // Initialize with data from localStorage
  const { subscribe, set, update } = writable<PrayerRequest[]>([]);

  return {
    subscribe,
    addPrayer: (prayer: string) =>
      update((prayers) => {
        const newPrayer = new PrayerRequest(prayer);
        prayerSyncManager.update(PrayerOperation.CREATE, newPrayer);
        return [...prayers, newPrayer];
      }),
    incrementPrayCount: (uuid: string) =>
      update((prayers) =>
        prayers.map((p) => {
          if (p.uuid === uuid) {
            incrementGlobalPrayerCount();
            p.prayCount++;
            p.lastPrayed = new Date();
            prayerSyncManager.update(
              PrayerOperation.UPDATE,
              p,
              PrayerUpdateType.PRAY_COUNT,
            );
          }
          return p;
        }),
      ),
    toggleAnswered: (uuid: string) => {
      update((prayers) =>
        prayers.map((p) => {
          if (p.uuid === uuid) {
            p.answered = !p.answered;
            prayerSyncManager.update(
              PrayerOperation.UPDATE,
              p,
              PrayerUpdateType.ANSWERED_STATE,
            );
          }
          return p;
        }),
      );
      localStorage.setItem(STORAGE_DATE_KEY, new Date().toISOString());
    },
    deletePrayer: (uuid: string) => {
      update((prayers) => {
        const updatedPrayers = prayers.filter((p) => {
          if (p.uuid === uuid) {
            prayerSyncManager.update(PrayerOperation.DELETE, p);
            return false; // Exclude the matched prayer
          }
          return true; // Keep other prayers
        });
        return updatedPrayers;
      });
      localStorage.setItem(STORAGE_DATE_KEY, new Date().toISOString());
    },
    mergePrayers: (incomingPrayers: PrayerRequest[]) =>
      // Will merge in incomingPrayers into memory, they are SOT
      update((existingPrayers) => {
        // Get current prayers in prayerStore
        const currentPrayerMap = new Map(
          existingPrayers.map((p) => [p.uuid, p]),
        );
        // Add or resolve incoming prayers to map for merge
        incomingPrayers.forEach((incomingPrayer) =>
          currentPrayerMap.set(
            incomingPrayer.uuid,
            PrayerRequest.resolveConflict(
              currentPrayerMap.get(incomingPrayer.uuid),
              incomingPrayer,
            ),
          ),
        );
        return Array.from(currentPrayerMap.values());
      }),
    mergePrayersSync(incomingPrayers: PrayerRequest[]) {
      // Merge in prayers into client and write incoming prayers to cloud
      PrayerStore.mergePrayers(incomingPrayers);
      for (const prayer of incomingPrayers) {
        prayerSyncManager.update(PrayerOperation.CREATE, prayer);
      }
    },
    setPrayers: (prayers: PrayerRequest[]) => {
      set(prayers);
    },
    getPrayers: () => {
      return get(PrayerStore);
    },
    clearPrayers: () => {
      set([]);
    },
  };
}

export const PrayerStore = createPrayerStore();

//-----------------------------------------------------------------------------
// Derived stores
//-----------------------------------------------------------------------------
// User profile stats
export const prayerCount = derived(PrayerStore, ($prayers) =>
  $prayers.reduce((total, prayer) => total + prayer.prayCount, 0),
);
export const answeredCount = derived(
  PrayerStore,
  ($prayers) => $prayers.filter((p) => p.answered).length,
);
export const unansweredCount = derived(
  PrayerStore,
  ($prayers) => $prayers.filter((p) => !p.answered).length,
);
