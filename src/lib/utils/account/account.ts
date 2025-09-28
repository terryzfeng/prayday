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
  // Firebase UID or Guest Local ID
  id: string;
  // If account is cloud account
  isCloudAccount: boolean;
  // Account User first name
  name: string;
  // Account Keys for encryption/decryption
  private keys: Keys;
  // If the account is synced with server and keys.key is set.
  isReady: boolean;

  // Firebase Auth fields
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

  async setKeysAndSyncPrayers(keys: Keys) {
    this.setKeys(keys);
    if (this.isReady) {
      // Decrypt prayers here
      await prayerSync.initialize(this);
      PrayerStore.mergePrayers(prayerSync.pull());
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
    this.setKeysAndSyncPrayers(keys);
  }

  static createCloudAccount(
    firebaseAuthUser: FirebaseAuthUser,
    firebaseAccountSettings: FirebaseAccountSettings,
    keys: Keys,
  ) {
    return new Account(
      firebaseAuthUser.uid,
      /*isCloudAccount=*/ true,
      firebaseAccountSettings.name,
      keys,
      /*isReady*/ keys.key !== undefined,
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
      );
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
    if (account.isReady) {
      await prayerSync.initialize(account);
      PrayerStore.mergePrayers(prayerSync.pull());
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
