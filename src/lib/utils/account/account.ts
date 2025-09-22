import type { User as FirebaseAuthUser } from "firebase/auth";
import { prayerSync } from "lib/services/prayerSync/prayerSyncManager";
import { PrayerStore } from "lib/stores/prayerStore";
import { getAccountSettingsAsync } from "lib/services/accountSettingsSyncService";

// Firebase Firestore User Doc fields
export interface FirebaseAccountSettings {
  name: string;
  email: string;
}

const LOCAL_ACCOUNT_KEY = "account";

export default class Account {
  id: string; // Firebase UID or Local ID
  isCloudAccount: boolean;
  name: string;

  private firebaseAuthUser: FirebaseAuthUser | undefined;
  private email: string | undefined;
  // private keys: Keys;

  constructor(
    id: string,
    isCloudAccount: boolean,
    name: string,
    firebaseAuthUser?: FirebaseAuthUser | undefined,
    email?: string | undefined,
  ) {
    this.id = id;
    this.isCloudAccount = isCloudAccount;
    this.name = name;

    this.firebaseAuthUser = firebaseAuthUser;
    this.email = email;
  }

  setName(name: string) {
    this.name = name;
  }

  setEmail(email: string) {
    this.email = email;
  }

  static createCloudAccount(
    firebaseAuthUser: FirebaseAuthUser,
    firebaseAccountSettings: FirebaseAccountSettings,
  ) {
    return new Account(
      firebaseAuthUser.uid,
      /*isCloudAccount=*/ true,
      firebaseAccountSettings.name,
      firebaseAuthUser,
      firebaseAccountSettings.email,
    );
  }

  static createLocalAccount(id: string) {
    return new Account(id, /*isCloudAccount=*/ false, "Guest");
  }

  static clearAccount() {
    prayerSync.uninitialize();
    PrayerStore.clearStorage();
  }

  static loadLocalAccount() {
    const localAccountId = localStorage.getItem(LOCAL_ACCOUNT_KEY);
    if (localAccountId === null) {
      return null;
    }
    return Account.createLocalAccount(localAccountId);
  }

  static async establishAccount(
    isCloudAccount: boolean,
    firebaseAuthUser?: FirebaseAuthUser,
    firebaseAccountSettings?: FirebaseAccountSettings,
    fromCache?: boolean,
    getAccountSettingsFromServer?: Promise<unknown>,
  ): Promise<Account | undefined> {
    // No cloud account exists
    let account = null;
    if (isCloudAccount) {
      if (
        firebaseAuthUser === undefined ||
        firebaseAccountSettings === undefined
      ) {
        console.error("No cloud account exists");
        return undefined;
      }
      account = Account.createCloudAccount(
        firebaseAuthUser,
        firebaseAccountSettings,
      );
      // If we loaded from cache, will need to sync account from server later
      if (fromCache && getAccountSettingsFromServer) {
        getAccountSettingsAsync(getAccountSettingsFromServer);
      }
    } else {
      account = loadLocalAccount();
      if (account === null) {
        account = Account.createLocalAccount(crypto.randomUUID());
      }
    }
    // Establish Services and Keys
    if (prayerSync.isInitialized()) {
      prayerSync.uninitialize();
    }
    await prayerSync.initialize(account);
    PrayerStore.setPrayers(prayerSync.pull());

    return account;
  }
}

/**
 * Load guest account from localStorage
 * @returns local guest account
 */
function loadLocalAccount(): Account | null {
  const localAccountId = localStorage.getItem(LOCAL_ACCOUNT_KEY);
  if (localAccountId === null) {
    return null;
  }
  return Account.createLocalAccount(localAccountId);
}
