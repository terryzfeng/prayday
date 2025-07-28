import { writable } from "svelte/store";

/**
 * The number of days to store user prayer history in the user profile
 * contribution graph.
 */
export const USER_HISTORY_SIZE = 35;

/**
 * Array to hold daily prayer counts for the last USER_HISTORY_SIZE days.
 * Used for user profile prayer contribution graph.
 */
export const userHistoryPrayerCounts = writable<number[]>(
  Array(USER_HISTORY_SIZE).fill(0),
);

/**
 * Array to hold the date names (Jan 1) for the last USER_HISTORY_SIZE days.
 * Used for user profile prayer contribution graph.
 */
export const userHistoryDates = writable<string[]>(
  Array(USER_HISTORY_SIZE).fill(""),
);
