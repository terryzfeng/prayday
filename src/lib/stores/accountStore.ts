import { writable } from "svelte/store";
import type { User } from "firebase/auth";
import { auth } from "lib/utils/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { getAccountSettings } from "../utils/firebase/users";
import { prayerSync } from "../services/prayerSyncManager";
import { PrayerStore } from "lib/stores/prayerStore";
import { e2eeEnabledStore } from "./e2eeEnabledStore";
import Account, {
  type FirebaseAccountSettings,
} from "../utils/account/account-new";

let cloudAccountLoggedIn = false;

/**
 * Create store for storing user credentials and handling log in/out
 * @returns user auth store
 */
function createAccountStore() {
  const { subscribe, set } = writable<Account | undefined>(undefined);

  // Initialize the store with the current auth state
  onAuthStateChanged(auth, async (firebaseUser) => {
    let account = undefined;
    if (firebaseUser) {
      // Site load and user is logged in
      const firebaseAccountSettingsPromise = await getAccountSettings(
        firebaseUser.uid,
      );
      if (firebaseAccountSettingsPromise.success) {
        account = await Account.establishAccount(
          /*isCloudAccount=*/ true,
          firebaseUser,
          firebaseAccountSettingsPromise.data as FirebaseAccountSettings,
        );
        cloudAccountLoggedIn = true;
      } else {
        console.error("Firebase failed to log in");
      }
    } else {
      // Switching from logged in to log out
      if (cloudAccountLoggedIn) {
        console.log("Log out");
        Account.clearAccount();
        cloudAccountLoggedIn = false;
      }

      // Establish guest account
      account = await Account.establishAccount(/*isCloudAccount=*/ false);
    }

    set(account);
  });

  return {
    subscribe,
  };
}

export const account = createAccountStore();
