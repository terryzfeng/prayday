import { writable, derived } from "svelte/store";
import PrayerRequest from "lib/utils/prayer-request";
import { incrementGlobalPrayerCount } from "../utils/firebase/prayer-stats";

const STORAGE_KEY = "prayers";
const STORAGE_DATE_KEY = "lastUpdated";

/**
 * Load user prayers from localStorage
 * @returns
 */
function loadStoredPrayers(): PrayerRequest[] {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return [];

    const parsedData = JSON.parse(storedData);
    // Convert plain objects back to PrayerRequest instances
    return parsedData.map((p: any) => {
      const prayer = new PrayerRequest(
        p.prayer,
        p.uuid,
        p.prayCount,
        new Date(p.date),
        new Date(p.lastPrayed),
        p.answered,
      );
      return prayer;
    });
  } catch (error) {
    console.error("Error loading prayers from localStorage:", error);
    return [];
  }
}

/**
 * Create prayer request array store
 */
function createPrayerStore() {
  // Initialize with data from localStorage
  const { subscribe, set, update } =
    writable<PrayerRequest[]>(loadStoredPrayers());

  // Subscribe to changes and update localStorage
  subscribe((prayers) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prayers));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  });

  return {
    subscribe,
    addPrayer: (prayer: string) =>
      update((prayers) => {
        const newPrayer = new PrayerRequest(prayer);
        localStorage.setItem(STORAGE_DATE_KEY, new Date().toISOString());
        return [...prayers, newPrayer];
      }),
    incrementPrayCount: (uuid: string) =>
      update((prayers) =>
        prayers.map((p) => {
          if (p.uuid === uuid) {
            incrementGlobalPrayerCount();
            localStorage.setItem(STORAGE_DATE_KEY, new Date().toISOString());
            return { ...p, prayCount: p.prayCount + 1, lastPrayed: new Date() };
          }
          return p;
        }),
      ),
    toggleAnswered: (uuid: string) => {
      update((prayers) =>
        prayers.map((p) =>
          p.uuid === uuid ? { ...p, answered: !p.answered } : p,
        ),
      );
      localStorage.setItem(STORAGE_DATE_KEY, new Date().toISOString());
    },
    deletePrayer: (uuid: string) => {
      update((prayers) => {
        let updatedPrayers = prayers.filter((p) => {
          if (p.uuid === uuid) {
            return false; // Exclude the matched prayer
          }
          return true; // Keep other prayers
        });
        return updatedPrayers;
      });

      localStorage.setItem(STORAGE_DATE_KEY, new Date().toISOString());
    },
    mergePrayers: (prayers: PrayerRequest[]) =>
      update((existingPrayers) => {
        const prayerMap = new Map(existingPrayers.map((p) => [p.uuid, p]));
        prayers.forEach((prayer) =>
          prayerMap.set(
            prayer.uuid,
            PrayerRequest.resolveConflict(prayerMap.get(prayer.uuid), prayer),
          ),
        );
        return Array.from(prayerMap.values());
      }),
    setPrayers: (prayers: PrayerRequest[]) => {
      set(prayers);
    },
    setLastUpdated(newDate: Date) {
      localStorage.setItem(STORAGE_DATE_KEY, newDate.toISOString());
    },
    getLastUpdated: () => {
      const lastUpdated = localStorage.getItem(STORAGE_DATE_KEY);
      return lastUpdated ? new Date(lastUpdated) : null;
    },
    // Optional: Method to clear localStorage, DANGEROUS
    clearStorage: () => {
      // localStorage.removeItem(STORAGE_KEY);
      set([]);
    },
  };
}

export const PrayerStore = createPrayerStore();

// Derived stores
export const sortedPrayersStore = derived(PrayerStore, (prayers) => {
  return prayers.slice().sort((a: PrayerRequest, b: PrayerRequest) => {
    return PrayerRequest.sort(a, b);
  });
});
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
