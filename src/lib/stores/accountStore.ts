import { writable } from "svelte/store";
import { auth } from "lib/utils/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  getAccountSettings,
  type FirebaseAccountSettings,
} from "../utils/firebase/users";
import Account from "../utils/account/account";
import type { Keys, KeySettings } from "../utils/account/keys";

let cloudAccountLoggedIn = false;

/**
 * Create store for storing user credentials and handling log in/out
 * @returns user auth store
 */
function createAccountStore() {
  const { subscribe, set, update } = writable<Account | undefined>(undefined);

  // Initialize the store with the current auth state
  onAuthStateChanged(auth, async (firebaseAuthUser) => {
    let account = undefined;
    if (firebaseAuthUser) {
      // Site load and user is logged in
      const firebaseAccountSettingsPromise = await getAccountSettings(
        firebaseAuthUser.uid,
      );
      if (firebaseAccountSettingsPromise.success) {
        account = await Account.establishAccount(
          /*isCloudAccount=*/ true,
          firebaseAuthUser,
          firebaseAccountSettingsPromise.data
            ?.firebaseAccountSettings as FirebaseAccountSettings,
          firebaseAccountSettingsPromise.data?.keySettings as KeySettings,
          firebaseAccountSettingsPromise.data?.fromCache,
          firebaseAccountSettingsPromise.data?.getAccountSettingsFromServer,
        );
        cloudAccountLoggedIn = true;
      } else {
        // Firebase failed to log in, fallback to guest account
        console.error(firebaseAccountSettingsPromise.error);
        account = await Account.establishAccount(/*isCloudAccount=*/ false);
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
    updateName: (newName: string) => {
      update((account) => {
        if (account) {
          account.setName(newName);
        }
        return account;
      });
    },
    updateEmail: (newEmail: string) => {
      update((account) => {
        if (account) {
          account.setEmail(newEmail);
        }
        return account;
      });
    },
    updateKeys: (newKeys: Keys) => {
      update((account) => {
        if (account) {
          account.setKeysAndPull(newKeys);
        }
        return account;
      });
    },
    inputDataPassphrase: async (dataPassphrase: string) => {
      // Get current account value
      let currentAccount: Account | undefined;
      const unsubscribe = subscribe((acc) => {
        currentAccount = acc;
      });
      unsubscribe(); // Immediately unsubscribe after getting the value

      if (currentAccount) {
        await currentAccount.deriveAndUnwrapAccountKey(dataPassphrase);
        set(currentAccount); // Update the store with the modified account
      }
    },
  };
}

export const account = createAccountStore();
