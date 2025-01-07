import { Timestamp } from "firebase/firestore";

/**
 * Compare day difference from today to date argument, using local timezone
 * @param date date to compare
 */
export function getDaysFromToday(date: Date): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const otherDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diff = today.getTime() - otherDay.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get the local day of the week
 * @returns number 0-6 (Sunday - Saturday)
 */
export function dayOfTheWeek(): number {
  const now = new Date();
  return now.getDay();
}

/**
 * Display date as relative date, within the week or short name
 * @param date to display
 */
export function getRelativeDate(date: Date) {
  const days = getDaysFromToday(date);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Take local date time and convert it to local short date name (e.g. Jan 1)
 * @param Date date to convert
 * @returns short date name string
 */
export function dateToShortName(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get midnight 12AM of date, default today 12AM
 * @param date to convert to 12AM
 * @returns today's date
 */
export function midnight(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Convert firebase timestamp to local timezone day date
 */
export function timestampToDay(timestamp: Timestamp): Date {
  const date = timestamp.toDate();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Generate a list of dates for the last N days, ending with today
 * @param numDays
 */
export function recentDayDates(numDays: number): Date[] {
  const recentDays: Date[] = [];
  const today = midnight();
  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (numDays - i) + 1);
    recentDays.push(date);
  }
  return recentDays;
}
