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
  importAccountKeys,
  loadAccountKeyFromLocal,
  writeAccountKeyToLocal,
  quickCompareKeySettings,
} from "./keys";
import { e2eeEnabledStore, showPassphraseModalStore } from "lib/stores/e2eeEnabledStore";

const LOCAL_ACCOUNT_KEY = "account";

export default class Account {
  // Firebase UID or Guest Local ID
  id: string;
  // If account is a cloud account
  isCloudAccount: boolean;
  // Account first name
  name: string;
  // Are account services initialized
  initialized: boolean;
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
    this.initialized = false;
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

  getFullId(): string {
    return this.id + (this.isCloudAccount ? "@cloud" : "@local");
  }

  /**
   * Asynchronously initialize services after the initial call has been made
   * Will address any failures if there are new keys.
   * @param keys new keys pulled from server
   * @returns boolean if account is initialized
   */
  async asyncInitializeServices(keys: Keys) {
    const isSameKeysSettings = quickCompareKeySettings(this.keys.keySettings, keys.keySettings);
    if (!isSameKeysSettings) {
      this.keys = keys;
      this.saveKeys();
      return await Account.initializeServices(this);
    }
  }

  requestDataPassphrase() {
    // If account can't find keys.key, this means e2ee is turned on
    showPassphraseModalStore.set(true);
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
  saveKeys() {
    if (this.isCloudAccount) {
      uploadKeySettings(this.id, this.keys.keySettings);
    }
    // TODO: Persist Account.keys to localStorage
    writeAccountKeyToLocal(this.getFullId(), this.keys);
  }

  //----------------------------------------------------------------------------
  // Static functions
  //----------------------------------------------------------------------------
  /**
   * Construct a new firebase cloud account.
   * @param firebaseAuthUser 
   * @param firebaseAccountSettings
   * @param keys
   * @returns Account
   */
  static setUpCloudAccount(
    firebaseAuthUser: FirebaseAuthUser,
    firebaseAccountSettings: FirebaseAccountSettings,
    keys: Keys,
  ): Account {
    return new Account(
      firebaseAuthUser.uid,
      /*isCloudAccount=*/ true,
      firebaseAccountSettings.name,
      keys,
      firebaseAuthUser,
      firebaseAccountSettings.email,
    );
  }


  /**
   * Create and return a new local guest account
   * @param id 
   * @returns Promise<Account>
   */
  static async setUpNewLocalAccount(id: string): Promise<Account> {
    const keys = await generateNewKeys();
    return new Account(
      id,
      /*isCloudAccount=*/ false,
      "Guest",
      keys,
    );
  }

  /**
   * Connect an account to prayer sync services and do an initial load.
   * Load pulled prayers into view.
   * @param account 
   */
  static async initializePrayers(account: Account) {
    if (!account.initialized) {
      await prayerSync.initialize(account);
      // TODO: Check if it is safe to do this here post encryption
      PrayerStore.setPrayers(prayerSync.pull());
    } else {
      PrayerStore.mergePrayers(prayerSync.pull());
    }
  }

  /**
   * Disconnect account from services like prayer sync
   */
  static uninitializeServices() {
    if (prayerSync.isInitialized()) {
      prayerSync.uninitialize();
      PrayerStore.clearStorage();
    }
  }

  /**
   * Check and initialize services for account based on keys. 
   */
  static async initializeServices(account: Account): Promise<boolean> {
    // Account is ready to be initialized, start up services
    if (account.keys.key) {
      e2eeEnabledStore.set(false);
      Account.initializePrayers(account);
      account.initialized = true;
    } else {
      // Don't have keys.key, this means e2ee is turned on
      e2eeEnabledStore.set(true);
      const loadedLocalKey = await loadAccountKeyFromLocal(account.getFullId());
      if (loadedLocalKey) {
        account.keys.key = loadedLocalKey;
        Account.initializePrayers(account);
        account.initialized = true;
      } else {
        // Will need to request for data passphrase
        account.requestDataPassphrase();
        account.initialized = false;
      }
    }
    return account.initialized;
  }

  /**
   * Handle log-in behavior and establish an account for Prayday application.
   * Handles both cloud accounts and local accounts (load or create).
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
      const keys = await importAccountKeys(keySettings);
      account = Account.setUpCloudAccount(
        firebaseAuthUser,
        firebaseAccountSettings,
        keys,
      );
      // If cloud account comes from cache, we also need a server pull
      if (fromCache && getAccountSettingsFromServer) {
        getAccountSettingsAsync(getAccountSettingsFromServer);
      }
    } else {
      account = await loadLocalAccount();
      if (account === null) {
        account = await Account.setUpNewLocalAccount(crypto.randomUUID());
        account.saveKeys();
      }
    }

    // Uninitialize services if they exist, initialize new services
    Account.uninitializeServices();
    await Account.initializeServices(account);

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
  return await Account.setUpNewLocalAccount(localAccountId);
}
