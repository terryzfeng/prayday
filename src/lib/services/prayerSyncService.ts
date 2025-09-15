import type PrayerRequest from "../utils/prayer-request";

export enum PrayerOperation {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
}

export enum PrayerUpdateType {
  PRAY_COUNT = "prayCount",
  ANSWERED_STATE = "answeredState",
  PRAYER_TEXT = "prayerText",
}

export interface PrayerChange {
  operation: PrayerOperation;
  updateType?: PrayerUpdateType;
  prayerRequest: PrayerRequest;
}

export interface PrayerSyncService {
  initialize(userId: string): Promise<void>;
  uninitialize(): void;
  update(
    prayerOperation: PrayerOperation,
    prayerRequest: PrayerRequest,
    updateType: PrayerUpdateType | undefined,
  ): void;
  pull(): PrayerRequest[];
}
