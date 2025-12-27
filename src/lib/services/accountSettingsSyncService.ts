import { account } from "../stores/accountStore";
import { addTask, completeTask } from "../stores/isLoading";
import { importAccountKeys } from "../utils/account/keys";
import type { FirebaseAccountSettingsResult } from "../utils/firebase/users";

/**
 * Asynchronously get account settings from server after cache pull to sync account settings
 * @param getAccountSettingsFromServer Promise<FirebaseAccountSettingsResult>
 */
export async function getAccountSettingsAsync(
  getAccountSettingsFromServer: Promise<FirebaseAccountSettingsResult>,
) {
  try {
    addTask("Async FirebaseAccountSetings Update");
    const firebaseAccountSettingsResult = await getAccountSettingsFromServer;
    if (firebaseAccountSettingsResult.success) {
      // console.log("Account sync'd with server");
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
  } finally {
    completeTask("Async FirebaseAccountSetings Update");
  }
}
