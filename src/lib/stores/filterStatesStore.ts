// Used to filter the prayer store via a filter bank and a boolean array
// representing filters that are active

import { writable, derived, type Readable, get } from "svelte/store";
import { PrayerStore } from "./prayerStore";
import PrayerRequest from "../utils/prayer-request";

const FILTER_STATES_KEY = "filterStates";

type Filter = (prayer: PrayerRequest) => boolean;

/*
 * Filters for PrayerStore
 */
const filterBank: Map<string, Filter> = new Map([
  ["hideAnswered", (prayer: PrayerRequest) => !prayer.answered],
]);

function loadFilterStates(): boolean[] {
  try {
    const filterStates = localStorage.getItem(FILTER_STATES_KEY);
    // if no save state, return default states
    if (!filterStates) throw new Error();

    const savedStates = JSON.parse(filterStates);
    if (savedStates.length !== filterBank.size) throw new Error();

    return savedStates;
  } catch (error) {
    console.warn(
      "Error loading localStorage filter states. Initializing defaults",
    );
    return Array(filterBank.size).fill(false);
  }
}

function createFilterStatesStore() {
  const { subscribe, update } = writable<boolean[]>(loadFilterStates());

  subscribe((filterStates) => {
    try {
      localStorage.setItem(FILTER_STATES_KEY, JSON.stringify(filterStates));
    } catch (error) {
      console.error("Error saving filters to localStorage");
    }
  });

  return {
    subscribe,
    setFilterState: (name: string, active: boolean) =>
      update((filterStates) => {
        const filterIndex = Array.from(filterBank.keys()).indexOf(name);
        if (filterIndex === -1) return filterStates;

        filterStates[filterIndex] = active;
        return filterStates;
      }),
    toggleFilterState: (name: string) =>
      update((filterStates) => {
        const filterIndex = Array.from(filterBank.keys()).indexOf(name);
        if (filterIndex === -1) return filterStates;

        filterStates[filterIndex] = !filterStates[filterIndex];
        return filterStates;
      }),
    getFilterState: (name: string): boolean => {
      const filterStates = get(filterStatesStore);
      const filterIndex = Array.from(filterBank.keys()).indexOf(name);
      return filterIndex !== -1 ? filterStates[filterIndex] : false;
    },
    // TODO: If you want to dynamically add a filter
    // setFilterBankFn(name: string, filterFn: (prayer: PrayerRequest) => boolean) => {}
  };
}

export const filterStatesStore = createFilterStatesStore();

/**
 * Combined Filtered and Sorted view of PrayerStore (ONE derived store)
 */
export const sortFilterPrayersView: Readable<PrayerRequest[]> = derived(
  [PrayerStore, filterStatesStore],
  ([$prayers, filterStates]) => {
    // 1. Filtering
    const filteredPrayers = $prayers.filter((prayer) => {
      const filterFns = Array.from(filterBank.values());
      return filterStates.every((isActive, index) => {
        if (!isActive) return true; // skip this filter
        const filterFn = filterFns[index];
        return filterFn(prayer); // apply the filter function
      });
    });

    // 2. Sorting
    const sortedPrayers = [...filteredPrayers].sort(
      (a: PrayerRequest, b: PrayerRequest) => {
        return PrayerRequest.sort(a, b);
      },
    );

    return sortedPrayers;
  },
);
