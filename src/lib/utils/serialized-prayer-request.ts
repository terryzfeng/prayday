import PrayerRequest from "./prayer-request";

// To serialize prayer requests to Firebase
export interface SerializedPrayerRequest {
  prayer: string;
  uuid: string;
  prayCount: number;
  date: string;
  lastPrayed: string;
  answered: boolean;
}

// To serialize prayer requests to indexedDB
export interface SerializedPrayerRequestWithAccount
  extends SerializedPrayerRequest {
  accountId: string;
}

/**
 * Check that data is well-formed and cast to SerializedPrayerRequest
 * @param data
 * @returns SerializedPrayerRequest
 */
export function validateSerializedPrayer(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): data is SerializedPrayerRequest {
  return (
    data &&
    typeof data.prayer === "string" &&
    typeof data.uuid === "string" &&
    typeof data.prayCount === "number" &&
    typeof data.date === "string" &&
    typeof data.lastPrayed === "string" &&
    typeof data.answered === "boolean"
  );
}

/**
 * Convert SerializedPrayerRequest to PrayerRequest
 * @param data
 * @returns PrayerRequest
 */
export function createPrayerFromSerializedPrayer(
  data: unknown,
): PrayerRequest | null {
  if (!validateSerializedPrayer(data)) {
    console.error("Invalid Firebase prayer data");
    return null;
  }
  return new PrayerRequest(
    data.prayer,
    data.uuid,
    data.prayCount,
    new Date(data.date),
    new Date(data.lastPrayed),
    data.answered,
  );
}

/**
 * Serialize a PrayerRequest to a SerializedPrayerRequest
 * @param prayer PrayerRequest to serialize
 * @returns SerializedPrayerRequest
 */
export function serializePrayer(
  prayer: PrayerRequest,
): SerializedPrayerRequest {
  return {
    prayer: prayer.prayer,
    uuid: prayer.uuid,
    prayCount: prayer.prayCount,
    date: prayer.date.toISOString(),
    lastPrayed: prayer.lastPrayed.toISOString(),
    answered: prayer.answered,
  };
}

/**
 * Serialize a PrayerRequest to a SerializedPrayerRequestWithAccount
 * @param accountId Unique identifier for the account
 * @param prayer PrayerRequest to serialize
 * @returns SerializedPrayerRequestWithAccount
 */
export function serializePrayerWithAccountId(
  accountId: string,
  prayer: PrayerRequest,
): SerializedPrayerRequestWithAccount {
  return {
    accountId,
    uuid: prayer.uuid,
    prayer: prayer.prayer,
    prayCount: prayer.prayCount,
    date: prayer.date.toISOString(),
    lastPrayed: prayer.lastPrayed.toISOString(),
    answered: prayer.answered,
  };
}
