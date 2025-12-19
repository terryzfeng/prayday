import type PrayerRequest from "lib/utils/prayer-request";
import { FirebaseSyncService } from "./firebaseSync";
import { LocalSyncService } from "./localSync";
import type {
  PrayerOperation,
  PrayerSyncService,
  PrayerUpdateType,
} from "./prayerSyncService";

enum SyncServiceType {
  FIREBASE = "firebase",
  LOCAL = "local",
}

class PrayerSyncManager {
  private syncService: PrayerSyncService | null;
  private syncType: SyncServiceType | null;

  constructor() {
    this.syncService = null;
    this.syncType = null;
  }

  async initialize(
    userId: string,
    isCloudAccount: boolean,
    accountKey: CryptoKey,
  ): Promise<void> {
    if (this.syncService !== null) {
      console.error("Prayer sync service already initialized");
      return;
    }

    const prayerSyncServiceType = isCloudAccount
      ? SyncServiceType.FIREBASE
      : SyncServiceType.LOCAL;

    if (prayerSyncServiceType === SyncServiceType.FIREBASE) {
      const firebaseSyncService = new FirebaseSyncService(userId, accountKey);
      await firebaseSyncService.initialize();
      this.syncService = firebaseSyncService;
      this.syncType = SyncServiceType.FIREBASE;
    } else if (prayerSyncServiceType === SyncServiceType.LOCAL) {
      const localSyncService = new LocalSyncService(userId, accountKey);
      await localSyncService.initialize();
      this.syncService = localSyncService;
      this.syncType = SyncServiceType.LOCAL;
    }
    // Ensure service initialized
    if (this.syncService === null) {
      console.error("Prayer sync service not initialized");
    }
  }

  uninitialize() {
    if (this.syncService === null) {
      console.error("Prayer sync service not initialized");
      return;
    }
    this.syncService = null;
    this.syncType = null;
  }

  update(
    prayerOperation: PrayerOperation,
    prayerRequest: PrayerRequest,
    updateType: PrayerUpdateType | undefined = undefined,
  ) {
    this.syncService?.update(prayerOperation, prayerRequest, updateType);
  }

  isInitialized() {
    return this.syncService !== null;
  }

  getSyncType() {
    return this.syncType;
  }
}

export const prayerSyncManager = new PrayerSyncManager();
