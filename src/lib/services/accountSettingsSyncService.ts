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
    if (firebaseAccountSettingsResult.success) {
      console.log("Account sync'd with server");
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
      throw new Error(firebaseAccountSettingsResult.error);
    }
  } catch (error: unknown) {
    console.warn((error as Error).message);
  }
}
