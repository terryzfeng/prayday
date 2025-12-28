import { GUEST_ID } from "lib/utils/account/account";
import { account } from "lib/stores/accountStore";
import { PrayerStore } from "lib/stores/prayerStore";
import { clearAllPrayerRequestsForLocal } from "lib/utils/local-database/prayer-db";
import type PrayerRequest from "lib/utils/prayer-request";
import { ConfirmManager } from "lib/stores/confirmManager";

/**
 * Migrate prayers from guest account to newly created cloud account.
 * This is called from signUp, and will prompt user to confirm migration.
 * If migrate, prayers will be copied to new cloud account and deleted from local.
 */
export async function migrateGuestPrayersToCloudAccount(
  guestPrayers: PrayerRequest[],
): Promise<void> {
  // Check guest prayers and confirm migration
  if (guestPrayers.length === 0) {
    return;
  }
  const shouldMigrate = await ConfirmManager.confirm(
    `It looks like you previously had ${guestPrayers.length} prayer request${guestPrayers.length === 1 ? "" : "s"} saved locally. Would you like to import these prayer requests over to your new account?`,
    { title: "Import Local Prayers", confirmText: "Import" },
  );
  if (!shouldMigrate) {
    return;
  }

  // Wait until new cloud account is signed in, then merge in and delete
  const unsubscribe = account.subscribe((newAccount) => {
    if (newAccount?.id && newAccount.id !== GUEST_ID) {
      PrayerStore.mergePrayersSync(guestPrayers);
      clearAllPrayerRequestsForLocal(GUEST_ID);
      unsubscribe();
    }
  });
}
