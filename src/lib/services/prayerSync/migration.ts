import { GUEST_ID } from "lib/utils/account/account";
import { account } from "lib/stores/accountStore";
import { PrayerStore } from "lib/stores/prayerStore";
import { clearAllPrayerRequestsForLocal } from "lib/utils/local-database/prayer-db";
import type PrayerRequest from "src/lib/utils/prayer-request";

/**
 * Migrate prayers from guest account to newly created cloud account.
 * This is called from signUp, and will prompt user to confirm migration.
 * If migrate, prayers will be copied to new cloud account and deleted from local.
 */
export async function migrateGuestPrayersToCloudAccount(
  guestPrayers: PrayerRequest[]
): Promise<void> {
  // Check guest prayers and confirm migration
  if (guestPrayers.length === 0) {
    return
  }
  const shouldMigrate = confirm(`It looks like you have ${guestPrayers.length} prayers saved locally. Would you like to migrate them to your new account?`);
  if (!shouldMigrate) {
    return;
  }

  // Wait until new cloud account is signed in, then merge in and delete
  const unsubscribe = account.subscribe((newAccount) => {
    if (newAccount?.id && newAccount.id !== GUEST_ID) {
      PrayerStore.mergePrayers(guestPrayers);
      clearAllPrayerRequestsForLocal(GUEST_ID);
      unsubscribe();
    }
  });
}
