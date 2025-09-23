import PrayerRequest from "../prayer-request";

export interface FirebasePrayerData {
  prayer: string;
  uuid: string;
  prayCount: number;
  date: string;
  lastPrayed: string;
  answered: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateFirebasePrayerData(
  data: any,
): data is FirebasePrayerData {
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

export function createPrayerFromFirebaseData(
  data: unknown,
): PrayerRequest | null {
  if (!validateFirebasePrayerData(data)) {
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
