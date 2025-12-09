import { get, writable } from "svelte/store";
import { auth } from "lib/utils/firebase/config";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  getAccountSettings,
  type FirebaseAccountSettings,
  type FirebaseAccountSettingsResult,
} from "../utils/firebase/users";
import Account from "../utils/account/account";
import type { Keys, KeySettings } from "../utils/account/keys";
import {
  e2eeEnabledStore,
  showDataPassphraseModalStore,
} from "./e2eeEnabledStore";

let loggedIntoCloudAccount = false;

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
    | Promise<FirebaseAccountSettingsResult>
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
  loggedIntoCloudAccount = true;
  if (account && account.requiresDataPassphrase()) {
    showDataPassphraseModalStore.set(true);
  }
  return account;
}

/**
 * Create store for storing user credentials and handling log in/out
 * @returns user auth store
 */
function createAccountStore() {
  const { subscribe, set, update } = writable<Account | undefined>(undefined);

  // Initialize the store with the current auth state
  onAuthStateChanged(auth, async (firebaseAuthUser: User | null) => {
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
      } else {
        // Failed to load user account settings. Please contact Prayday support.
        console.error(firebaseAccountSettingsPromise.error);
        // Fallback to guest account
        account = await Account.establishAccount(/*isCloudAccount=*/ false);
      }
    } else {
      // Switching from logged in to log out
      if (loggedIntoCloudAccount) {
        console.log("Log out");
        Account.uninitializeServices();
        loggedIntoCloudAccount = false;
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
    updateAccount: (name: string, email: string, newKeys: Keys) => {
      update((account) => {
        if (account === undefined) return;
        account.setName(name);
        account.setEmail(email);
        Account.asyncInitializeServices(account, newKeys);
        e2eeEnabledStore.set(account.isE2EEEnabled());
        return account;
      });
    },
    async enableE2EE(dataPassphrase: string): Promise<boolean> {
      const account = get(this);
      if (account === undefined) {
        return false;
      }
      const success = await account.changeDataPassphrase(dataPassphrase);
      if (success) {
        e2eeEnabledStore.set(account.isE2EEEnabled());
        // set(account)
      }
      return success;
    },
    async disableE2EE(dataPassphrase: string): Promise<boolean> {
      const account = get(this);
      if (account === undefined) {
        return false;
      }
      const success = await account.removeDataPassphrase(dataPassphrase);
      if (success) {
        e2eeEnabledStore.set(account.isE2EEEnabled());
        // set(account)
      }
      return success;
    },
    async inputDataPassphrase(dataPassphrase: string): Promise<boolean> {
      const account = get(this);
      if (account === undefined) {
        return false;
      }
      const success = await account.deriveAndUnwrapAccountKey(dataPassphrase);
      if (success) {
        set(account);
      }
      return success;
    },
  };
}

export const account = createAccountStore();
