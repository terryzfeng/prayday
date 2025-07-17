import { collection, doc, getDoc, getDocs, onSnapshot, writeBatch } from "firebase/firestore";
import { db } from "lib/utils/firebase/config";
import { PrayerStore } from "lib/stores/prayerStore";
import PrayerRequest from "lib/utils/prayer-request";
import { userHistoryService } from "./userHistoryService";

class PrayerSyncService {
  private unsubscribeFirestore?: () => void;
  private unsubscribeStore?: () => void;
  private syncing = false;
  private initialized = false;
  private initialSnapshot = true;
  private userId: string = "";

  // Track changes that neeed to be synced
  private lastKnownState = new Map<string, PrayerRequest>();
  private pendingChanges = new Set<string>();
  private pendingDeletions = new Set<string>();


  /**
   * Initialize syncing to Firebase
   */
  async initialize(userId: string) {
    if (this.initialized) return;
    this.userId = userId;

    // Load synced data from Firebase
    const firebasePrayers = await this.loadFromFirebase();
    // Merge Firebase and local PrayerStore
    await this.mergeFirebaseAndLocal(firebasePrayers);

    // Set up real-time sync with Firebase
    const prayersRef = collection(db, "users", this.userId, "prayers");
    this.unsubscribeFirestore = onSnapshot(prayersRef, (snapshot) => {
      // Skip initial snapshot load because we manually loaded
      if (this.initialSnapshot) {
        this.initialSnapshot = false;
        return;
      }
      if (this.syncing) return;
      this.syncing = true;
      const changedPrayers: PrayerRequest[] = [];
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        if (change.type === "removed") {
          PrayerStore.deletePrayer(data.uuid);
          this.lastKnownState.delete(data.uuid);
        } else {
          // Added or modified
          changedPrayers.push(
            new PrayerRequest(
              data.prayer,
              data.uuid,
              data.prayCount,
              new Date(data.date),
              new Date(data.lastPrayed),
              data.answered,
            ),
          );
        }
      });

      // Batch merge all changed prayers
      if (changedPrayers.length > 0) {
        PrayerStore.mergePrayers(changedPrayers);
      }

      // Update lastKnownState with new prayer changes
      changedPrayers.forEach((prayer) => {
        this.lastKnownState.set(prayer.uuid, prayer);
      })

      this.syncing = false;
    });

    // Subscribe to local changes to sync to Firebase
    this.unsubscribeStore = PrayerStore.subscribe(
      async ($prayers: PrayerRequest[]) => {
        if (this.syncing) return;
        this.trackChanges($prayers);
        // If we have changes and a userId, sync them
        if (
          this.userId &&
          (this.pendingChanges.size > 0 || this.pendingDeletions.size > 0)
        ) {
          this.syncing = true;
          try {
            await this.syncToFirebase($prayers);
          } catch (error) {
            console.error("Error syncing to Firebase:", error);
          } finally {
            this.syncing = false;
          }
        }
      },
    );

    userHistoryService.initialize(this.userId);

    this.initialized = true;
  }

  /**
   * Track pending changes to Prayer Request array for sync later
   */
  private trackChanges(currentPrayers: PrayerRequest[]) {
    const currentIds = new Set(currentPrayers.map((p) => p.uuid));
    // Check deletions
    for (const [uuid] of this.lastKnownState) {
      if (!currentIds.has(uuid)) {
        this.pendingDeletions.add(uuid);
        this.pendingChanges.delete(uuid);
        this.lastKnownState.delete(uuid);
      }
    }
    // Check for changes or additions
    for (const prayer of currentPrayers) {
      const lastKnown = this.lastKnownState.get(prayer.uuid);
      if (!lastKnown || this.hasPrayerChanged(prayer, lastKnown)) {
        this.pendingChanges.add(prayer.uuid);
        this.lastKnownState.set(prayer.uuid, prayer);
      }
    }
  }

  /**
   * Check if prayer has been updated
   * @param current new prayer
   * @param last old prayer
   * @returns boolean if new is different than old
   */
  private hasPrayerChanged(
    current: PrayerRequest,
    last: PrayerRequest,
  ): boolean {
    return (
      current.prayCount !== last.prayCount || current.answered !== last.answered
    );
  }

  /**
   * Uninitialize prayer sync to firebase
   */
  uninitialize() {
    if (!this.initialized) {
      return;
    }

    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
    }

    if (this.unsubscribeStore) {
      this.unsubscribeStore();
    }

    userHistoryService.uninitialize();

    this.pendingChanges.clear();
    this.pendingDeletions.clear();
    this.lastKnownState.clear();
    this.userId = "";
    this.initialized = false;
    this.syncing = false;
  }

  /**
   * Sync prayer changes to firebase
   * @param prayers to sync
   */
  private async syncToFirebase(prayers: PrayerRequest[]) {
    if (this.pendingChanges.size === 0 && this.pendingDeletions.size === 0) {
      return; // Nothing to sync
    }

    const batch = writeBatch(db);

    // Handle deletions of prayers
    for (const uuid of this.pendingDeletions) {
      const prayerRef = doc(db, "users", this.userId, "prayers", uuid);
      batch.delete(prayerRef);
    }

    // Handle changes to prayers
    for (const uuid of this.pendingChanges) {
      const prayer = prayers.find((p) => p.uuid === uuid);
      if (prayer) {
        const prayerRef = doc(db, "users", this.userId, "prayers", prayer.uuid);
        batch.set(prayerRef, {
          prayer: prayer.prayer,
          uuid: prayer.uuid,
          prayCount: prayer.prayCount,
          date: prayer.date.toISOString(),
          lastPrayed: prayer.lastPrayed.toISOString(),
          answered: prayer.answered,
        });
      }
    }

    const lastUpdated = PrayerStore.getLastUpdated();
    if (lastUpdated) {
      batch.update(doc(db, "users", this.userId), {
        lastUpdated: lastUpdated.toISOString(),
      });
    }

    try {
      await batch.commit();
      // Clear pending changes after successful sync
      this.pendingChanges.clear();
      this.pendingDeletions.clear();
    } catch (error: any) {
      console.error("Error trying to sync to firebase");
    }
  }

  /**
   * Do a clean prayer request load from firebase and return as a PrayerRequest[]
   * @returns Promise<PrayerRequest[]>
   */
  private async loadFromFirebase(): Promise<PrayerRequest[]> {
    const prayersRef = collection(db, "users", this.userId, "prayers");
    const snapshot = await getDocs(prayersRef);

    const prayers: PrayerRequest[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      prayers.push(
        new PrayerRequest(
          data.prayer,
          data.uuid,
          data.prayCount,
          new Date(data.date),
          new Date(data.lastPrayed),
          data.answered,
        ),
      );
    });

    return prayers;
  }

  /**
   * Handle merge conflicts between local and firebase prayer store
   * @param firebasePrayers to merge into local
   */
  async mergeFirebaseAndLocal(firebasePrayers: PrayerRequest[]) {
    const localDate = PrayerStore.getLastUpdated() || new Date(0);

    const userRef = doc(db, "users", this.userId!);
    const userDoc = await getDoc(userRef);
    const firebaseDate = new Date(userDoc.data()?.lastUpdated || 0);

    if (firebaseDate.getTime() > localDate.getTime()) {
      console.warn("Remote newer than local, merging");
      PrayerStore.setPrayers(firebasePrayers);
      PrayerStore.setLastUpdated(firebaseDate);
    } else if (firebaseDate.getTime() < localDate.getTime()) {
      console.warn("Local newer than sync, merging");
      PrayerStore.mergePrayers(firebasePrayers);
    } else {
      // console.log("Prayers are in sync")
    }

    // Snapshot prayers after merge/sync
    this.lastKnownState = new Map(
      PrayerStore.getPrayers().map((p) => [p.uuid, p]),
    )
  }
}

export const prayerSync = new PrayerSyncService();
