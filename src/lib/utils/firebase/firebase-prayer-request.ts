import type { Bytes } from "firebase/firestore";
import { bytesToEncryptedData, encryptedDataToBytes } from "./bytes";
import type { Result } from "../result";
import PrayerRequest from "../prayer-request";

// Firebase representation of a PrayerRequest
export interface FirebasePrayerRequest {
  uuid: string;
  prayer: string;
  prayCount: number;
  date: string;
  lastPrayed: string;
  answered: boolean;
  protectedPrayerIV: Bytes;
  protectedPrayerData: Bytes;
}

/**
 * Check that arbitrary data is well-formed and cast to FirebasePrayerRequest
 * @param data
 * @returns FirebasePrayerRequest
 */
export function validateFirebasePrayerRequest(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): data is FirebasePrayerRequest {
  return (
    data &&
    typeof data.uuid === "string" &&
    typeof data.prayer === "string" &&
    typeof data.prayCount === "number" &&
    typeof data.date === "string" &&
    typeof data.lastPrayed === "string" &&
    typeof data.answered === "boolean"
    // data.protectedPrayerIV instanceof Uint8Array &&
    // data.protectedPrayerData instanceof Uint8Array
  );
}

/**
 * Deserialize a FirebasePrayerRequest to a PrayerRequest
 * @param data arbitrary data
 * @returns PrayerRequest
 */
export function deserializeFirebasePrayerRequest(
  data: unknown,
): Result<PrayerRequest> {
  if (!validateFirebasePrayerRequest(data)) {
    return { success: false, error: "Invalid firebase prayer request." };
  }
  return {
    success: true,
    data: new PrayerRequest(
      data.prayer,
      data.uuid,
      data.prayCount,
      new Date(data.date),
      new Date(data.lastPrayed),
      data.answered,
      data.protectedPrayerIV &&
        data.protectedPrayerData &&
        bytesToEncryptedData(data.protectedPrayerIV, data.protectedPrayerData),
    ),
  };
}

/**
 * Serialize a PrayerRequest to a FirebasePrayerRequest
 * @param prayerRequest PrayerRequest to serialize
 * @returns FirebasePrayerRequest
 */
export function serializePrayerRequest(
  prayerRequest: PrayerRequest,
): Result<FirebasePrayerRequest> {
  if (!prayerRequest.prayer || !prayerRequest.protectedPrayer) {
    return {
      success: false,
      error: "Failed to serialize prayerRequest to FirebasePrayerRequest",
    };
  }
  const [protectedPrayerIV, protectedPrayerData] = encryptedDataToBytes(
    prayerRequest.protectedPrayer,
  );
  return {
    success: true,
    data: {
      uuid: prayerRequest.uuid,
      prayer: prayerRequest.prayer,
      prayCount: prayerRequest.prayCount,
      date: prayerRequest.date.toISOString(),
      lastPrayed: prayerRequest.lastPrayed.toISOString(),
      answered: prayerRequest.answered,
      protectedPrayerIV,
      protectedPrayerData,
    },
  };
}
