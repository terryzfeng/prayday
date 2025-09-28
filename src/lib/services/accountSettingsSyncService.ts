import { account } from "../stores/accountStore";
import { importUnprotectedAccountKey } from "../utils/account/keys";
import type { FirebaseAccountSettingsBox } from "../utils/firebase/users";

/**
 * Asynchonously get account settings from server after cache pull to sync account settings
 * @param getAccountSettingsFromServer Promise<Box<FirebaseAccountSettings>>
 */
export async function getAccountSettingsAsync(
  getAccountSettingsFromServer: Promise<FirebaseAccountSettingsBox>,
) {
  try {
    const firebaseAccountSettingsBox = await getAccountSettingsFromServer;
    console.log("Account settings sync");
    if (
      firebaseAccountSettingsBox.success &&
      firebaseAccountSettingsBox.data !== undefined
    ) {
      const firebaseAccountSettings =
        firebaseAccountSettingsBox.data.firebaseAccountSettings;
      account.updateName(firebaseAccountSettings.name);
      account.updateEmail(firebaseAccountSettings.email);
      const keys = await importUnprotectedAccountKey(
        firebaseAccountSettingsBox.data.keySettings,
      );
      account.updateKeys(keys);
    } else {
      throw new Error();
    }
  } catch (_: unknown) {
    console.warn("Failed to get account settings from server, may be offline");
  }
}
