import { writable } from "svelte/store";
import { auth } from "lib/utils/firebase/config";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  getAccountSettings,
  type FirebaseAccountSettings,
  type FirebaseAccountSettingsBox,
} from "../utils/firebase/users";
import Account from "../utils/account/account";
import type { Keys, KeySettings } from "../utils/account/keys";

let cloudAccountLoggedIn = false;

/**
 * Estblish a cloud account. This is used in onAuthStateChanged for log-in,
 * or manually called after sign up.
 */
export async function establishCloudAccount(
  firebaseAuthUser: User,
  firebaseAccountSettings: FirebaseAccountSettings,
  keySettings: KeySettings,
  fromCache: boolean = false,
  getAccountSettingsFromServer:
    | Promise<FirebaseAccountSettingsBox>
    | undefined = undefined,
) {
  const account = await Account.establishAccount(
    /*isCloudAccount=*/ true,
    firebaseAuthUser,
    firebaseAccountSettings as FirebaseAccountSettings,
    keySettings as KeySettings,
    fromCache,
    getAccountSettingsFromServer,
  );
  cloudAccountLoggedIn = true;
  return account;
}

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
        account = await establishCloudAccount(
          firebaseAuthUser,
          firebaseAccountSettingsPromise.data
            ?.firebaseAccountSettings as FirebaseAccountSettings,
          firebaseAccountSettingsPromise.data?.keySettings as KeySettings,
          firebaseAccountSettingsPromise.data?.fromCache,
          firebaseAccountSettingsPromise.data?.getAccountSettingsFromServer,
        );
        cloudAccountLoggedIn = true;
      } else {
        // Failed to load user account settings. Please contact Prayday support.
        console.error(firebaseAccountSettingsPromise.error);
        account = await Account.establishAccount(/*isCloudAccount=*/ false);
      }
    } else {
      // Switching from logged in to log out
      if (cloudAccountLoggedIn) {
        console.log("Log out");
        Account.uninitializePrayers();
        cloudAccountLoggedIn = false;
      }

      // Establish guest account
      account = await Account.establishAccount(/*isCloudAccount=*/ false);
    }

    set(account);
  });

  return {
    subscribe,
    setAccount: (account: Account) => {
      set(account);
    },
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
          account.setKeysAndSyncPrayers(newKeys);
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
