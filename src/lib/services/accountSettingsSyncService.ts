import { account } from "../stores/accountStore";
import { importAccountKeys } from "../utils/account/keys";
import type { FirebaseAccountSettingsResult } from "../utils/firebase/users";

/**
 * Asynchonously get account settings from server after cache pull to sync account settings
 * @param getAccountSettingsFromServer Promise<FirebaseAccountSettingsResult>
 */
export async function getAccountSettingsAsync(
  getAccountSettingsFromServer: Promise<FirebaseAccountSettingsResult>,
) {
  try {
    const firebaseAccountSettingsResult = await getAccountSettingsFromServer;
    console.log("Account sync'd from server");
    if (
      firebaseAccountSettingsResult.success &&
      firebaseAccountSettingsResult.data !== undefined
    ) {
      const firebaseAccountSettings =
        firebaseAccountSettingsResult.data.firebaseAccountSettings;
      const keys = await importAccountKeys(
        firebaseAccountSettingsResult.data.keySettings,
      );
      account.updateAccount(
        firebaseAccountSettings.name,
        firebaseAccountSettings.email,
        keys,
      );
    } else {
      throw new Error();
    }
  } catch (_: unknown) {
    console.warn("Failed to get account settings from server, may be offline");
  }
}
