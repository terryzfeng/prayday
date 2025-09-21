import { PrayerStore } from "../../stores/prayerStore";
import PrayerRequest from "../../utils/prayer-request";
import {
  PrayerOperation,
  type PrayerSyncService,
  type PrayerUpdateType,
} from "./prayerSyncService";

const LOCAL_ACCOUNT_KEY = "account";
const LOCAL_PRAYERS_KEY = "prayers";

export class LocalSyncService implements PrayerSyncService {
  private userId: string | null = null;

  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    localStorage.setItem(LOCAL_ACCOUNT_KEY, this.userId);
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
    updateType: PrayerUpdateType | undefined,
  ): void {
    let prayers = PrayerStore.getPrayers();
    let updatedPrayers: PrayerRequest[] = [];
    if (prayerOperation === PrayerOperation.CREATE) {
      updatedPrayers = [...prayers, prayerRequest];
    } else if (prayerOperation === PrayerOperation.UPDATE) {
      updatedPrayers = prayers.map((p) => {
        if (p.uuid === prayerRequest.uuid) {
          return prayerRequest;
        }
        return p;
      });
    } else if (prayerOperation === PrayerOperation.DELETE) {
      updatedPrayers = prayers.filter((p) => p.uuid !== prayerRequest.uuid);
    }
    try {
      localStorage.setItem(LOCAL_PRAYERS_KEY, JSON.stringify(updatedPrayers));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  pull(): PrayerRequest[] {
    try {
      const storedData = localStorage.getItem(LOCAL_PRAYERS_KEY);
      if (!storedData) return [];

      const parsedData = JSON.parse(storedData);
      // Convert array of plain objects to array of PrayerRequest
      return parsedData.map((p: any) => {
        const prayer = new PrayerRequest(
          p.prayer,
          p.uuid,
          p.prayCount,
          new Date(p.date),
          new Date(p.lastPrayed),
          p.answered,
        );
        return prayer;
      });
    } catch (error) {
      console.error("Error loading prayers from localStorage:", error);
      return [];
    }
  }
}
