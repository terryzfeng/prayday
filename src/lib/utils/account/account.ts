import type { User as FirebaseAuthUser } from "firebase/auth";
import { prayerSync } from "lib/services/prayerSync/prayerSyncManager";
import { PrayerStore } from "lib/stores/prayerStore";
import { getAccountSettingsAsync } from "lib/services/accountSettingsSyncService";
import {
  uploadKeySettings,
  type FirebaseAccountSettings,
  type FirebaseAccountSettingsBox,
} from "../firebase/users";
import { establishKeys, type Keys, type KeySettings } from "./keys";

const LOCAL_ACCOUNT_KEY = "account";

export default class Account {
  id: string; // Firebase UID or Local ID
  isCloudAccount: boolean;
  name: string;
  private keys: Keys;
  // If the account is synced with server and keys.key is set.
  isReady: boolean;

  private firebaseAuthUser: FirebaseAuthUser | undefined;
  private email: string | undefined;

  constructor(
    id: string,
    isCloudAccount: boolean,
    name: string,
    keys: Keys,
    isReady: boolean,
    firebaseAuthUser?: FirebaseAuthUser,
    email?: string,
  ) {
    this.id = id;
    this.isCloudAccount = isCloudAccount;
    this.name = name;
    this.keys = keys;
    this.isReady = isReady;

    // Optional
    this.firebaseAuthUser = firebaseAuthUser;
    this.email = email;
  }

  setName(name: string) {
    this.name = name;
  }

  setEmail(email: string) {
    this.email = email;
  }

  setKeys(keys: Keys) {
    this.keys = keys;
    this.isReady = this.keys.key !== undefined;
  }

  setKeysAndPull(keys: Keys) {
    this.setKeys(keys);
    if (this.isReady) {
      // Decrypt prayers here
      PrayerStore.setPrayers(prayerSync.pull());
    }
  }

  async deriveAndUnwrapAccountKey(dataPassphrase: string) {
    const { keys, isNew } = await establishKeys(
      this.keys.keySettings,
      dataPassphrase,
    );
    if (isNew) {
      // TODO: Write to local storage
    }
    this.setKeysAndPull(keys);
  }

  static createCloudAccount(
    firebaseAuthUser: FirebaseAuthUser,
    firebaseAccountSettings: FirebaseAccountSettings,
    keys: Keys,
    fromCache: boolean = false,
  ) {
    return new Account(
      firebaseAuthUser.uid,
      /*isCloudAccount=*/ true,
      firebaseAccountSettings.name,
      keys,
      !fromCache,
      firebaseAuthUser,
      firebaseAccountSettings.email,
    );
  }

  static async createLocalAccount(id: string) {
    const { keys, isNew } = await establishKeys();
    if (isNew) {
      // TODO: Write keys to local storage
    }
    return new Account(id, /*isCloudAccount=*/ false, "Guest", keys, true);
  }

  static clearAccount() {
    prayerSync.uninitialize();
    PrayerStore.clearStorage();
  }

  static async establishAccount(
    isCloudAccount: boolean,
    firebaseAuthUser?: FirebaseAuthUser,
    firebaseAccountSettings?: FirebaseAccountSettings,
    keySettings?: KeySettings,
    fromCache?: boolean,
    getAccountSettingsFromServer?: Promise<FirebaseAccountSettingsBox>,
  ): Promise<Account | undefined> {
    // No cloud account exists
    let account = null;
    if (isCloudAccount) {
      if (
        firebaseAuthUser === undefined ||
        firebaseAccountSettings === undefined ||
        keySettings === undefined
      ) {
        console.error("No cloud account exists");
        return undefined;
      }
      const { keys, isNew } = await establishKeys(keySettings);
      if (isNew) {
        uploadKeySettings(firebaseAuthUser.uid, keys.keySettings);
        // TODO: Also write these keys to LocalStorage
        // This needs to be a member function (after account is created)
        // or a static function with more fields, aka isCloudAccount, uid, etc.
      }
      account = Account.createCloudAccount(
        firebaseAuthUser,
        firebaseAccountSettings,
        keys,
        fromCache,
      );
      console.log("account keys", account.keys);
      // If we loaded from cache, will need to sync account from server later
      if (fromCache && getAccountSettingsFromServer) {
        getAccountSettingsAsync(getAccountSettingsFromServer);
      }
    } else {
      account = await loadLocalAccount();
      if (account === null) {
        account = await Account.createLocalAccount(crypto.randomUUID());
      }
    }
    // Establish Services and Keys
    if (prayerSync.isInitialized()) {
      prayerSync.uninitialize();
    }
    await prayerSync.initialize(account);
    if (account.isReady) {
      PrayerStore.setPrayers(prayerSync.pull());
    }
    return account;
  }
}

/**
 * Load guest account from localStorage
 * @returns local guest account
 */
async function loadLocalAccount(): Promise<Account | null> {
  const localAccountId = localStorage.getItem(LOCAL_ACCOUNT_KEY);
  if (localAccountId === null) {
    return null;
  }
  return await Account.createLocalAccount(localAccountId);
}
