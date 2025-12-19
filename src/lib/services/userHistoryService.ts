import {
  USER_HISTORY_SIZE,
  userHistoryPrayerCounts,
  userHistoryDates,
} from "../stores/userHistoryStore";
import {
  dateToShortName,
  recentDayDates,
  timestampToDay,
} from "../utils/date-utils";
import {
  addPrayHistoryEntry,
  queryPrayerHistory,
  type PrayHistoryItem,
} from "../utils/firebase/users";

class UserHistoryService {
  public userId: string = "";

  /**
   * Initialize Prayer History tracking
   * @param userId
   */
  async initialize(userId: string) {
    this.userId = userId;

    // Get user's prayerHistory map from firebase
    const prayerHistory = await queryPrayerHistory(this.userId);
    if (prayerHistory.success && prayerHistory.data) {
      // Set the store with latest contribution graph
      const [dates, counts] = UserHistoryService.parsePrayerHistory(
        prayerHistory.data,
      );
      userHistoryPrayerCounts.set(counts);
      userHistoryDates.set(dates);
    } else {
      console.error("Error fetching prayer history:", prayerHistory.error);
    }
  }

  /**
   * Disconnect prayer history tracking from firebase
   */
  async uninitialize() {
    this.userId = "";
    userHistoryPrayerCounts.set(Array(USER_HISTORY_SIZE).fill(0));
  }

  /**
   * Actions to take when user hits "pray" for history tracking
   */
  pray() {
    if (!this.userId) {
      return;
    }

    // Update store
    userHistoryPrayerCounts.update((counts) => {
      counts[USER_HISTORY_SIZE - 1]++;
      return counts;
    });

    // Add entry
    addPrayHistoryEntry(this.userId);
  }

  /**
   * Parse user prayer history map from into an array of pray counts
   * and dates. The dates will be from today to the last USER_HISTORY_SIZE
   * days.
   * @param prayerHistory Array of PrayHistoryItems of dates and pray counts
   * @returns last USER_HISTORY_SIZE days of pray counts and dates
   */
  static parsePrayerHistory(
    prayerHistory: PrayHistoryItem[],
  ): [string[], number[]] {
    const prayerHistoryCounts: number[] = Array(USER_HISTORY_SIZE).fill(0);

    // Get recent dates
    const recentDates = recentDayDates(USER_HISTORY_SIZE);
    // Get date names
    const recentDateNames = recentDates.map((date) => dateToShortName(date));
    // Get date timestamps for indexing
    const dateTimestamps = recentDates.map((date) => date.getTime());

    // Convert Pray History Items to array of prayer counts
    for (const prayerHistoryItem of prayerHistory) {
      const date = timestampToDay(prayerHistoryItem.timestamp);
      const time = date.getTime();
      prayerHistoryCounts[dateTimestamps.indexOf(time)] =
        prayerHistoryItem.prayCount;
    }

    return [recentDateNames, prayerHistoryCounts];
  }
}

export const userHistoryService = new UserHistoryService();
