import { account } from "../stores/accountStore";
import type { FirebaseAccountSettings } from "../utils/account/account";

/**
 * Asynchonously get account settings from server after cache pull to sync account settings
 * @param getAccountSettingsFromServer Promise<Box<FirebaseAccountSettings>>
 */
export async function getAccountSettingsAsync(
  getAccountSettingsFromServer: Promise<
    | { success: boolean; data: FirebaseAccountSettings; fromCache: boolean }
    | { success: boolean; error: string }
  >,
) {
  try {
    const serverDocResponse = await getAccountSettingsFromServer;
    if (serverDocResponse.success && "data" in serverDocResponse) {
      const firebaseAccountSettings = serverDocResponse.data;
      account.updateName(firebaseAccountSettings.name);
      account.updateEmail(firebaseAccountSettings.email);
    } else {
      throw new Error();
    }
  } catch (_: unknown) {
    console.warn("Failed to get account settings from server, may be offline");
  }
}
