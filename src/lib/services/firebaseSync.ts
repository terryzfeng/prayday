import {
  collection,
  doc,
  increment,
  onSnapshot,
  QuerySnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "lib/utils/firebase/config";
import { PrayerStore } from "lib/stores/prayerStore";
import PrayerRequest from "lib/utils/prayer-request";
import { userHistoryService } from "./userHistoryService";
import { createPrayerFromFirebaseData } from "../utils/firebase/firebase-prayer-request";
import {
  PrayerOperation,
  PrayerUpdateType,
  type PrayerChange,
  type PrayerSyncService,
} from "./prayerSyncService";

/**
 * Service for synchronizing prayer data between the local PrayerStore and Firebase Firestore.
 * It handles both incoming changes from Firestore and outgoing local changes, ensuring data consistency.
 */
export class FirebaseSyncService implements PrayerSyncService {
  private unsubscribeFirestore?: () => void;
  private initialSyncPromise?: Promise<void>;
  private initialSyncResolve?: () => void;

  private syncing = false;
  private initialized = false;
  private initialSync = true;
  private userId: string = "";

  // Queue for handling snapshots during sync operations
  private pendingSnapshots: QuerySnapshot[] = [];
  // Prayers coming from Firestore
  private incomingPrayers: PrayerRequest[] = new Array<PrayerRequest>();
  // Local Prayer changes pending write to Firestore
  private outgoingPrayerChanges = new Map<
    /*prayer.uuid=*/ string,
    PrayerChange
  >();

  private syncTimeout: ReturnType<typeof setTimeout> | null = null;
  private maxRetries = 3;
  private retryDelay = 1000;

  /**
   * Initializes the prayer sync service for a given user.
   * Sets up a real-time listener for prayer data in Firestore and synchronizes
   * it with the local PrayerStore
   * @param userId The ID of the user whose prayers are to be synced.
   */
  async initialize(userId: string) {
    if (this.initialized || userId === "") return;
    this.userId = userId;

    this.initialSyncPromise = new Promise<void>((resolve, reject) => {
      this.initialSyncResolve = resolve;
    });

    // Set up real-time synchronization from Firebase
    // - Do initial load of data from online/cache (all PrayerRequests)
    // - Subsequent snapshots will be individual ch (individual changes)
    const prayersRef = collection(db, "users", this.userId, "prayers");
    this.unsubscribeFirestore = onSnapshot(prayersRef, async (snapshot) => {
      if (this.syncing) {
        this.pendingSnapshots.push(snapshot);
        return;
      }

      this.processSnapshot(snapshot);

      while (this.pendingSnapshots.length > 0) {
        const snapshot = this.pendingSnapshots.shift()!;
        this.processSnapshot(snapshot);
      }
    });

    // Set up User Profile Stats
    userHistoryService.initialize(this.userId);

    await this.initialSyncPromise;

    this.initialized = true;
  }

  /**
   * Processes a Firestore snapshot, updating the local state with changes from the server.
   * @param snapshot The Firestore QuerySnapshot to process.
   */
  private processSnapshot(snapshot: QuerySnapshot) {
    this.syncing = true;

    console.log(
      `Update from ${snapshot.metadata.fromCache ? "cache" : "server"}.`,
      `Pending writes: ${snapshot.metadata.hasPendingWrites}`,
    );

    // On initial sync, we pull all Firebase prayers
    if (this.initialSync) {
      console.log("Initial load", snapshot.docChanges());

      const firebasePrayers = snapshot.docs.map((doc) => {
        const data = doc.data();
        const prayer = createPrayerFromFirebaseData(data)!;
        return prayer;
      });
      this.incomingPrayers.push(...firebasePrayers);
      if (this.initialSyncResolve) {
        this.initialSyncResolve();
        this.initialSyncResolve = undefined;
      }
      this.initialSync = false;
    } else {
      // On subsequent snapshots, we get individually updated prayers
      console.log("Subsequent load", snapshot.docChanges());

      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        if (change.type === "removed") {
          this.removeIncomingPrayer(data.uuid);
          PrayerStore.deletePrayer(data.uuid);
        } else {
          const incomingPrayer = createPrayerFromFirebaseData(data)!;
          this.incomingPrayers.push(incomingPrayer);
          this.mergeFirebaseToPrayerStore();
        }
      });
    }

    this.syncing = false;
  }

  /**
   * Uninitializes the prayer sync service.
   * Detaches the Firestore listener and clears all local prayer data and
   * synchronization state.
   */
  uninitialize() {
    if (!this.initialized) {
      return;
    }
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
      this.unsubscribeFirestore = undefined;
    }
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
    this.initialSyncPromise = undefined;
    this.initialSyncResolve = undefined;

    // Clear arrays and maps
    userHistoryService.uninitialize();
    this.pendingSnapshots.length = 0;
    this.incomingPrayers.length = 0;
    this.outgoingPrayerChanges.clear();

    // Reset state
    this.syncing = false;
    this.initialized = false;
    this.initialSync = true;
    this.userId = "";
  }

  /**
   * Queues a local prayer change to be synced with Firestore.
   * @param prayerOperation The type of operation (create, update, delete).
   * @param prayerRequest The prayer request object.
   * @param updateType The specific type of update, if applicable.
   */
  public update(
    prayerOperation: PrayerOperation,
    prayerRequest: PrayerRequest,
    updateType: PrayerUpdateType | undefined = undefined,
  ) {
    if (!this.initialized) return;
    const prayerChange: PrayerChange = {
      operation: prayerOperation,
      prayerRequest: prayerRequest,
      updateType: updateType,
    };
    this.outgoingPrayerChanges.set(prayerRequest.uuid, prayerChange);
    this.syncToFirebase();
  }

  /**
   * Returns a Firestore document reference for a given prayer UUID.
   * @param prayerUUID The UUID of the prayer.
   * @returns A Firestore DocumentReference.
   */
  private getPrayerRef(prayerUUID: string) {
    return doc(db, "users", this.userId, "prayers", prayerUUID);
  }

  /**
   * Debounces the `syncToFirebase` function to prevent excessive calls.
   */
  private debouncedSyncToFirebase() {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = setTimeout(() => {
      if (this.outgoingPrayerChanges.size > 0) {
        this.syncToFirebase();
      }
    }, 500);
  }

  /**
   * Syncs local prayer changes to Firestore.
   * Implements a retry mechanism with exponential backoff for handling network errors.
   * @param retryCount The current retry attempt number.
   */
  private async syncToFirebase(retryCount = 0) {
    if (this.syncing && retryCount === 0) {
      this.debouncedSyncToFirebase();
      return;
    }

    this.syncing = true;

    try {
      const batch = writeBatch(db);
      const changesCopy = new Map(this.outgoingPrayerChanges);

      for (const [prayerUUID, prayerChange] of changesCopy) {
        const prayerRef = this.getPrayerRef(prayerUUID);
        switch (prayerChange.operation) {
          case PrayerOperation.DELETE:
            batch.delete(prayerRef);
            break;
          case PrayerOperation.CREATE:
            const prayer = prayerChange.prayerRequest;
            batch.set(prayerRef, {
              prayer: prayer.prayer,
              uuid: prayer.uuid,
              prayCount: prayer.prayCount,
              date: prayer.date.toISOString(),
              lastPrayed: prayer.lastPrayed.toISOString(),
              answered: prayer.answered,
            });
            break;
          case PrayerOperation.UPDATE:
            if (prayerChange.updateType === undefined) continue;
            if (prayerChange.updateType === PrayerUpdateType.PRAY_COUNT) {
              batch.update(prayerRef, {
                prayCount: increment(1),
                lastPrayed: prayerChange.prayerRequest.lastPrayed.toISOString(),
              });
            } else if (
              prayerChange.updateType === PrayerUpdateType.ANSWERED_STATE
            ) {
              batch.update(prayerRef, {
                answered: prayerChange.prayerRequest.answered,
              });
            } else if (
              prayerChange.updateType === PrayerUpdateType.PRAYER_TEXT
            ) {
              batch.update(prayerRef, {
                prayer: prayerChange.prayerRequest.prayer,
              });
            }
            break;

          default:
            console.warn("Invalid prayer change");
        }
      }

      await batch.commit();

      // Clear the changes that were successfully synced
      for (const prayerUUID of changesCopy.keys()) {
        this.outgoingPrayerChanges.delete(prayerUUID);
      }
    } catch (error: any) {
      console.error("Error trying to sync to firebase");

      // Retry logic
      if (retryCount < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying sync in ${delay}ms...`);

        setTimeout(() => {
          this.syncToFirebase(retryCount + 1);
        }, delay);
        return;
      } else {
        console.error("Max retries reached. Prayer sync failed.");
      }
    } finally {
      if (retryCount === 0) {
        this.syncing = false;
      }
    }
  }

  /**
   * Merges incoming prayers from Firestore into the local PrayerStore.
   */
  private mergeFirebaseToPrayerStore() {
    PrayerStore.mergePrayers(this.incomingPrayers);
    this.incomingPrayers.length = 0;
  }

  /**
   * Pull incomingPrayers from Firestore
   */
  pull(): PrayerRequest[] {
    return this.incomingPrayers;
  }

  /**
   * Removes a prayer from the `incomingPrayers` array by its UUID.
   * @param prayerUUID The UUID of the prayer to remove.
   */
  private removeIncomingPrayer(prayerUUID: string) {
    const index = this.incomingPrayers.findIndex((p) => p.uuid === prayerUUID);
    if (index !== -1) {
      this.incomingPrayers.splice(index, 1);
    }
  }
}
