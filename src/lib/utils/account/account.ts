import type { User as FirebaseAuthUser } from "firebase/auth";
import { prayerSync } from "lib/services/prayerSync/prayerSyncManager";
import { PrayerStore } from "lib/stores/prayerStore";
import { getAccountSettingsAsync } from "lib/services/accountSettingsSyncService";
import {
  uploadKeySettings,
  type FirebaseAccountSettings,
  type FirebaseAccountSettingsBox,
} from "../firebase/users";
import {
  generateNewKeys,
  type Keys,
  type KeySettings,
  importUnprotectedAccountKey,
  loadAccountKeyFromLocal,
} from "./keys";

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

  // Firebase Auth fields
  private firebaseAuthUser: FirebaseAuthUser | undefined;
  private email: string | undefined;

  constructor(
    id: string,
    isCloudAccount: boolean,
    name: string,
    keys: Keys,
    firebaseAuthUser?: FirebaseAuthUser,
    email?: string,
  ) {
    this.id = id;
    this.isCloudAccount = isCloudAccount;
    this.name = name;
    this.keys = keys;

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
  }

  getFullId(): string {
    return this.id + (this.isCloudAccount ? "@cloud" : "@local");
  }

  async setKeysAndSyncPrayers(keys: Keys) {
    this.setKeys(keys);
    if (keys.key) {
      // Decrypt prayers here
      await prayerSync.initialize(this);
      PrayerStore.mergePrayers(prayerSync.pull());
    }
  }

  // async deriveAndUnwrapAccountKey(dataPassphrase: string) {
  //   const { keys, isNew } = await establishKeys(
  //     this.keys.keySettings,
  //     dataPassphrase,
  //   );
  //   if (isNew) {
  //     // TODO: Write to local storage
  //   }
  //   this.setKeysAndSyncPrayers(keys);
  // }

  /**
   * Write the account keys to firebase if cloud account
   * Write Account.keys to localStorage
   */
  async saveKeys() {
    if (this.isCloudAccount) {
      await uploadKeySettings(this.id, this.keys.keySettings);
    }
    // TODO: Persist Account.keys to localStorage
    return;
  }

  async loadPrayers() {
    await prayerSync.initialize(this);
    PrayerStore.setPrayers(prayerSync.pull());
  }

  //----------------------------------------------------------------------------
  // Static functions
  //----------------------------------------------------------------------------
  static initializeCloudAccount(
    firebaseAuthUser: FirebaseAuthUser,
    firebaseAccountSettings: FirebaseAccountSettings,
    keys: Keys,
  ) {
    return new Account(
      firebaseAuthUser.uid,
      /*isCloudAccount=*/ true,
      firebaseAccountSettings.name,
      keys,
      firebaseAuthUser,
      firebaseAccountSettings.email,
    );
  }

  static async createNewLocalAccount(id: string) {
    const keys = await generateNewKeys();
    const guestAccount = new Account(
      id,
      /*isCloudAccount=*/ false,
      "Guest",
      keys,
    );
    guestAccount.saveKeys();
    return guestAccount;
  }

  static uninitializePrayers() {
    prayerSync.uninitialize();
    PrayerStore.clearStorage();
  }

  /**
   * Handles log-in behavior and establishes an account for Prayday.
   * Handles both cloud accounts and local account (load or create).
   * @param isCloudAccount
   * @param firebaseAuthUser
   * @param firebaseAccountSettings
   * @param keySettings
   * @param fromCache
   * @param getAccountSettingsFromServer
   * @returns
   */
  static async establishAccount(
    isCloudAccount: boolean,
    firebaseAuthUser?: FirebaseAuthUser,
    firebaseAccountSettings?: FirebaseAccountSettings,
    keySettings?: KeySettings,
    fromCache?: boolean,
    getAccountSettingsFromServer?: Promise<FirebaseAccountSettingsBox>,
  ): Promise<Account | undefined> {
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
      const key = await importUnprotectedAccountKey(keySettings);
      account = Account.initializeCloudAccount(
        firebaseAuthUser,
        firebaseAccountSettings,
        key,
      );
      // If we loaded from cache, will need to sync account from server later
      if (fromCache && getAccountSettingsFromServer) {
        getAccountSettingsAsync(getAccountSettingsFromServer);
      }
    } else {
      account = await loadLocalAccount();
      if (account === null) {
        account = await Account.createNewLocalAccount(crypto.randomUUID());
      }
    }
    // Establish Services and Keys
    if (prayerSync.isInitialized()) {
      Account.uninitializePrayers();
    }

    if (account.keys.key) {
      account.loadPrayers();
    } else {
      // Don't have keys.key, this means e2ee is turned on
      const loadedLocalKey = await loadAccountKeyFromLocal(account.getFullId());
      if (loadedLocalKey) {
        account.keys.key = loadedLocalKey;
        account.loadPrayers();
      } else {
        // account.requestDataPassphrase();
      }
    }
    return account;
  }
}

/**
 * Load guest account from localStorage
 * @returns local guest account
 */
async function loadLocalAccount(): Promise<Account | null> {
  // TODO: Load actual keys
  const localAccountId = localStorage.getItem(LOCAL_ACCOUNT_KEY);
  if (localAccountId === null) {
    return null;
  }
  return await Account.createNewLocalAccount(localAccountId);
}
