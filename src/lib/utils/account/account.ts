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
  extractKeysWithDataPassphrase,
} from "./keys";
import {
  e2eeEnabledStore,
  showDataPassphraseModalStore,
} from "lib/stores/e2eeEnabledStore";
import {
  deriveDataPassphraseDerivedKey,
  generateDataPassphraseDerivedKeyDerivationParams,
  wrapAccountKey,
} from "./encryption";

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
   * Request the data passphrase (UI)
   */
  requestDataPassphrase() {
    showDataPassphraseModalStore.set(true);
  }

  /**
   * Change the data passphrase for an account. Can be used to set a new data
   * passphrase or change an existing one. Will enable E2EE.
   * @param dataPassphrase
   */
  async changeDataPassphrase(dataPassphrase: string): Promise<boolean> {
    if (this.keys.key === undefined) {
      return false;
    }
    // Create Data Passphrase Derived Key to wrap account key
    const dataPassphraseDerivedKeyDerivationParams =
      generateDataPassphraseDerivedKeyDerivationParams();
    const dataPassphraseDerivedKey = await deriveDataPassphraseDerivedKey(
      dataPassphrase,
      dataPassphraseDerivedKeyDerivationParams,
    );
    const protectedAccountKey = await wrapAccountKey(
      this.keys.key,
      dataPassphraseDerivedKey,
    );

    // Create temporary updated keySettings, removing unprotectAccountKey
    const updatedKeySettings: KeySettings = {
      accountKeyCheckValue: this.keys.keySettings.accountKeyCheckValue,
      protectedAccountKey,
      dataPassphraseDerivedKeyDerivationParams,
    };

    const saveSuccess = await this.saveAndSetKeys({
      key: this.keys.key,
      keySettings: updatedKeySettings,
    });

    if (saveSuccess) {
      e2eeEnabledStore.set(true);
    }

    return saveSuccess;
  }

  /**
   * Derived and unwrap account key with data passphrase.
   * If successful, will also set account.keys.key and initialize prayers
   * @param dataPassphrase
   */
  async deriveAndUnwrapAccountKey(dataPassphrase: string) {
    const newKeys = await extractKeysWithDataPassphrase(
      this.keys.keySettings,
      dataPassphrase,
    );
    this.keys = newKeys;

    // If we successfully extracted account key, save new keys to local,
    // and initialize prayers for decryption
    if (this.keys.key) {
      this.saveKeysToLocal();
      // We directly initialize services to load prayers now that we have keys.key
      await Account.initializeServices(this);
      return true;
    }
    return false;
  }

  /**
   * Save all of keys to local storage
   */
  saveKeysToLocal(): boolean {
    // TODO: no op for now
    return true;
    // TODO: If no keys.key, don't save the keys
    writeAccountKeyToLocal(this.getFullId(), this.keys);
    return true;
  }

  /**
   * Write the account keys to firebase if cloud account
   * Write Account.keys to localStorage
   */
  async saveAndSetKeys(keys: Keys): Promise<boolean> {
    let saveSuccess = true;
    if (this.isCloudAccount) {
      saveSuccess &&= await uploadKeySettings(this.id, keys.keySettings);
    }

    if (saveSuccess) {
      // TODO: Persist Account.keys to localStorage
      this.saveKeysToLocal();
      this.keys = keys;
    }
    return saveSuccess;
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
    return new Account(id, /*isCloudAccount=*/ false, "Guest", keys);
  }

  /**
   * Connect an account to prayer sync services and do an initial load.
   * Load pulled prayers into view.
   * TODO: Check if we need to await on this (await initializePrayers),
   *       might be able to spin off on a new thread
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
   * Asynchronously initialize services after the initial call has been made
   * Will address any failures if there are new keys.
   * @param keys new keys pulled from server
   * @returns boolean if account is initialized
   */
  static async asyncInitializeServices(account: Account, keys: Keys) {
    const isSameKeysSettings = quickCompareKeySettings(
      account.keys.keySettings,
      keys.keySettings,
    );
    if (!isSameKeysSettings) {
      account.keys = keys;
      account.saveKeysToLocal();
      return await Account.initializeServices(account);
    }
  }

  /**
   * Check and initialize services for account based on keys.
   */
  static async initializeServices(account: Account): Promise<boolean> {
    // Account is ready to be initialized, start up services
    if (account.keys.key) {
      Account.initializePrayers(account);
      account.initialized = true;
    } else {
      // Don't have keys.key, this means e2ee is turned on
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
    // Mark if this account is E2EE encrypted (if they don't have unprotected account key)
    e2eeEnabledStore.set(
      account.keys.keySettings.unprotectedAccountKey === undefined,
    );
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
        // We need to generate a new account
        account = await Account.setUpNewLocalAccount(crypto.randomUUID());
        account.saveKeysToLocal();
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
