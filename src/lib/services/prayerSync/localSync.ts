/**
 * Sync and save prayers for a local account (guest) to Local (indexedDB)
 */
import {
  PrayerOperation,
  PrayerUpdateType,
  type PrayerSyncService,
} from "./prayerSyncService";
import {
  deletePrayerRequestFromLocal,
  getAllPrayerRequestsFromLocal,
  writePrayerRequestToLocal,
} from "lib/utils/local-database/prayer-db";
import PrayerRequest from "lib/utils/prayer-request";
import { PrayerStore } from "lib/stores/prayerStore";

export class LocalSyncService implements PrayerSyncService {
  private userId: string;
  private accountKey: CryptoKey;
  private incomingPrayers: PrayerRequest[] = [];

  constructor(userId: string, accountKey: CryptoKey) {
    this.userId = userId;
    this.accountKey = accountKey;
  }

  async initialize(): Promise<void> {
    try {
      this.incomingPrayers = await getAllPrayerRequestsFromLocal(this.userId);
    } catch {
      this.incomingPrayers = [];
    }
    this.writeToPrayerStore();
    return Promise.resolve();
  }

  /**
   * Write a PrayerRequest to IndexedDB
   * @param prayerOperation
   * @param prayerRequest
   * @param updateType
   */
  update(
    prayerOperation: PrayerOperation,
    prayerRequest: PrayerRequest,
    updateType: PrayerUpdateType | undefined,
  ): void {
    switch (prayerOperation) {
      case PrayerOperation.CREATE:
        // Mutates prayerRequest adding protectedPrayer
        prayerRequest
          .encrypt(this.accountKey)
          .then(() => writePrayerRequestToLocal(this.userId, prayerRequest));
        break;
      case PrayerOperation.UPDATE:
        if (updateType === PrayerUpdateType.PRAYER_TEXT) {
          // Mutates prayerRequest adding protectedPrayer
          prayerRequest.encrypt(this.accountKey).then(() => {
            writePrayerRequestToLocal(this.userId, prayerRequest);
          });
        }
        writePrayerRequestToLocal(this.userId, prayerRequest);
        break;
      case PrayerOperation.DELETE:
        deletePrayerRequestFromLocal(prayerRequest.uuid);
        break;
      default:
        console.warn("Invalid prayer change.");
    }
  }

  async writeToPrayerStore() {
    // Wait until all prayers decrypted, or decrypt was attempted
    await Promise.all(
      this.incomingPrayers.map((prayer) => prayer.decrypt(this.accountKey)),
    );

    const decrypted: PrayerRequest[] = [];
    const stillEncrypted: PrayerRequest[] = [];

    for (const prayer of this.incomingPrayers) {
      // If successfully decrypted, prayer field should now be filled.
      if (prayer.prayer !== undefined) {
        decrypted.push(prayer);
      } else {
        stillEncrypted.push(prayer);
      }
    }
    // Add decrypted prayers to PrayerStore
    PrayerStore.mergePrayers(decrypted);
    // Update incoming prayers with what is remaining
    this.incomingPrayers = stillEncrypted;
  }
}
