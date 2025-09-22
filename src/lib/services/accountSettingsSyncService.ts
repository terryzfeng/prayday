import { account } from "../stores/accountStore";
import type { FirebaseAccountSettings } from "../utils/account/account";

/**
 * Asynchonously get account settings from server after cache pull to sync account settings
 * @param getAccountSettingsFromServer Promise<Box<firebaseAccountSettings>>
 */
export async function getAccountSettingsAsync(
  getAccountSettingsFromServer: Promise<any>,
) {
  try {
    const serverDocResponse = await getAccountSettingsFromServer;
    if (serverDocResponse.success) {
      const firebaseAccountSettings =
        serverDocResponse.data as FirebaseAccountSettings;
      account.updateName(firebaseAccountSettings.name);
      account.updateEmail(firebaseAccountSettings.email);
    } else {
      throw new Error();
    }
  } catch (_: unknown) {
    console.warn("Failed to get account settings from server, may be offline");
  }
}