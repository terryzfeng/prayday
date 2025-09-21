import Account from "../../utils/account/account";
import type PrayerRequest from "../../utils/prayer-request";
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

  async initialize(account: Account) {
    if (this.syncService !== null) {
      console.error("Prayer sync service already initialized");
      return;
    }

    const prayerSyncServiceType = account.isCloudAccount
      ? SyncServiceType.FIREBASE
      : SyncServiceType.LOCAL;

    if (prayerSyncServiceType === SyncServiceType.FIREBASE) {
      const firebaseSyncService = new FirebaseSyncService();
      await firebaseSyncService.initialize(account.id);
      if (this.syncService === null) {
        this.syncService = firebaseSyncService;
        this.syncType = SyncServiceType.FIREBASE;
      }
    } else if (prayerSyncServiceType === SyncServiceType.LOCAL) {
      const localSyncService = new LocalSyncService();
      await localSyncService.initialize(account.id);
      if (this.syncService === null) {
        this.syncService = localSyncService;
        this.syncType = SyncServiceType.LOCAL;
      }
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
    this.syncService.uninitialize();
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

  pull(): PrayerRequest[] {
    return this.syncService?.pull() ?? [];
  }

  isInitialized() {
    return this.syncService !== null;
  }

  getSyncType() {
    return this.syncType;
  }
}

export const prayerSync = new PrayerSyncManager();
