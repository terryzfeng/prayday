import type { EncryptedData } from "../account/encryption";
import PrayerRequest from "../prayer-request";
import type { Result } from "../result";

// Local representation (IndexedDB) of a PrayerRequest
// Adds accountId to PrayerRequest
export interface LocalPrayerRequest {
  accountId: string;
  uuid: string;
  prayCount: number;
  date: Date;
  lastPrayed: Date;
  answered: boolean;
  protectedPrayer: EncryptedData;
}

/**
 * Deserialize a LocalPrayerRequest to an accountId PrayerRequest
 * @param accountId Unique identifier for the account
 * @param prayerRequest PrayerRequest to serialize
 * @returns FirebasePrayerRequestWithAccount
 */
export function deserializeLocalPrayerRequest(
  localPrayerRequest: LocalPrayerRequest,
): PrayerRequest {
  return new PrayerRequest(
    undefined,
    localPrayerRequest.uuid,
    localPrayerRequest.prayCount,
    localPrayerRequest.date,
    localPrayerRequest.lastPrayed,
    localPrayerRequest.answered,
    localPrayerRequest.protectedPrayer,
  );
}

/**
 * Serialize a PrayerRequest and accountId to a LocalPrayerRequest
 * @param accountId Unique identifier for the account
 * @param prayerRequest PrayerRequest to serialize
 * @returns FirebasePrayerRequestWithAccount
 */
export function serializePrayerRequest(
  accountId: string,
  prayerRequest: PrayerRequest,
): Result<LocalPrayerRequest> {
  if (!prayerRequest.prayer || !prayerRequest.protectedPrayer) {
    return {
      success: false,
      error: "Failed to serialize prayerRequest to LocalPrayerRequest.",
    };
  }
  return {
    success: true,
    data: {
      accountId,
      uuid: prayerRequest.uuid,
      prayCount: prayerRequest.prayCount,
      date: prayerRequest.date,
      lastPrayed: prayerRequest.lastPrayed,
      answered: prayerRequest.answered,
      protectedPrayer: prayerRequest.protectedPrayer,
    },
  };
}
