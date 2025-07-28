import { Timestamp } from "firebase/firestore";

// Compute today globally
const NOW = new Date();
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());

/**
 * Compare day difference from today to inputDate (past), using local timezone.
 * @param inputDate date to compare
 */
export function getDaysFromToday(inputDate: Date): number {
  const otherDay = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
  );
  const diff = TODAY.getTime() - otherDay.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get the local day of the week.
 * @returns number 0 - 6 (Sunday - Saturday)
 */
export function dayOfTheWeek(): number {
  return TODAY.getDay();
}

/**
 * Display date as relative date (e.g. 3 days ago) within the week or short name (e.g. Jan 1, 2025).
 * @param inputDate to display
 * @returns relative date string
 */
export function getRelativeDate(inputDate: Date) {
  const days = getDaysFromToday(inputDate);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(inputDate);
}

/**
 * Take inputDate object and convert it to local short date name (e.g. Jan 1).
 * @param date to convert
 * @returns short date name string
 */
export function dateToShortName(inputDate: Date): string {
  return inputDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get midnight 12AM of specified inputDate, default today midnight.
 * @param inputDate to convert to 12AM
 * @returns date object representing midnight
 */
export function midnight(inputDate: Date = TODAY): Date {
  return new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
  );
}

/**
 * Convert firebase timestamp to local timezone day date.
 * @param timestamp to convert
 * @returns date object
 */
export function timestampToDay(timestamp: Timestamp): Date {
  const date = timestamp.toDate();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Generate a list of dates for the last N days, ending with today
 * @param numDays list of dates to generate
 */
export function recentDayDates(numDays: number): Date[] {
  const recentDays: Date[] = [];
  for (let i = 0; i < numDays; i++) {
    const date = new Date(TODAY);
    date.setDate(TODAY.getDate() - (numDays - i) + 1);
    recentDays.push(date);
  }
  return recentDays;
}
