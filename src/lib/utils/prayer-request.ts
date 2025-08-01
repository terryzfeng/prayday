/**
 * Define a Prayer Request Object
 */
import { getDaysFromToday } from "./date-utils";

export default class PrayerRequest {
  public prayer: string;
  public uuid: string;
  public prayCount: number;
  public date: Date;
  public lastPrayed: Date;
  public answered: boolean;

  /**
   * Construct a Prayer Request
   * @param prayer prayer text
   * @param uuid for prayer
   * @param prayCount number of times prayer has been prayed
   * @param date date created
   * @param lastPrayed date last prayed
   * @param answered boolean is prayer has been answered
   */
  constructor(
    prayer: string,
    uuid: string = crypto.randomUUID(),
    prayCount: number = 0,
    date: Date = new Date(),
    lastPrayed: Date = date,
    answered: boolean = false,
  ) {
    this.prayer = prayer;
    this.uuid = uuid;
    this.prayCount = prayCount;
    this.date = date;
    this.lastPrayed = lastPrayed;
    this.answered = answered;
  }

  /**
   * Algorithm to sort PrayerRequests.
   * @param a PrayerRequest A
   * @param b PrayerRequest B
   * @returns (+) if A > B, (-) if A < B
   */
  static sort(a: PrayerRequest, b: PrayerRequest): number {
    // Answered
    // Sort answered prayers to the bottom
    if (a.answered !== b.answered) {
      return a.answered ? 1 : -1;
    }
    // Sort answered prayers newest to oldest
    if (a.answered && b.answered) {
      return b.lastPrayed.getTime() - a.lastPrayed.getTime();
    }

    // Unanswered
    // If haven't prayed, sort by recency
    if (a.prayCount === 0 && b.prayCount === 0) {
      return b.date.getTime() - a.date.getTime();
    }

    if (a.prayCount !== 0 && b.prayCount !== 0) {
      const aDays = getDaysFromToday(a.lastPrayed);
      const bDays = getDaysFromToday(b.lastPrayed);
      // Sort oldest (least recently prayed) to the top
      if (aDays !== bDays) {
        return bDays - aDays;
      }
      if (aDays === bDays) {
        // Sort by prayCount, low to high
        if (a.prayCount !== b.prayCount) {
          return a.prayCount - b.prayCount;
        }
      }
    }

    if (a.prayCount === 0) return -1;
    if (b.prayCount === 0) return 1;

    // Sort by newest
    return b.date.getTime() - a.date.getTime();
  }

  /**
   * Return the merge of two conflicting prayer requests.
   * @returns a merged PrayerRequest
   */
  static resolveConflict(
    localPrayer: PrayerRequest | undefined,
    remotePrayer: PrayerRequest,
  ): PrayerRequest {
    if (localPrayer === undefined) {
      return remotePrayer;
    }
    return {
      ...localPrayer,
      prayCount: Math.max(localPrayer.prayCount, remotePrayer.prayCount),
      lastPrayed: new Date(
        Math.max(
          localPrayer.lastPrayed.getTime(),
          remotePrayer.lastPrayed.getTime(),
        ),
      ),
      answered: remotePrayer.answered,
    };
  }
}
