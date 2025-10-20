/**
 * Sync and save prayers for a local account (guest) to Local (indexedDB)
 */
import PrayerRequest from "../../utils/prayer-request";
import {
  PrayerOperation,
  type PrayerSyncService,
  type PrayerUpdateType,
} from "./prayerSyncService";
import {
  deletePrayerRequestFromLocal,
  getAllPrayerRequestsFromLocal,
  writePrayerRequestToLocal,
} from "lib/utils/local-database/prayer-db";

export class LocalSyncService implements PrayerSyncService {
  private userId: string | null = null;
  private incomingPrayers: PrayerRequest[] = [];

  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    try {
      this.incomingPrayers = await getAllPrayerRequestsFromLocal(userId);
    } catch {
      this.incomingPrayers = [];
    }
    return Promise.resolve();
  }

  uninitialize(): void {
    this.userId = null;
  }

  /**
   * Writes all PrayerStore prayers to LocalStorage
   *
   * @param prayerOperation
   * @param prayerRequest
   * @param updateType
   */
  update(
    prayerOperation: PrayerOperation,
    prayerRequest: PrayerRequest,
    _updateType: PrayerUpdateType | undefined,
  ): void {
    if (this.userId === null) return;
    switch (prayerOperation) {
      case PrayerOperation.CREATE:
      case PrayerOperation.UPDATE:
        writePrayerRequestToLocal(this.userId, prayerRequest);
        break;
      case PrayerOperation.DELETE:
        deletePrayerRequestFromLocal(this.userId, prayerRequest.uuid);
        break;
      default:
        console.warn("Invalid prayer change.");
    }
  }

  pull(): PrayerRequest[] {
    return this.incomingPrayers;
  }
}
