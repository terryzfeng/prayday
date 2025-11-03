import type { User as FirebaseAuthUser } from "firebase/auth";
import { prayerSyncManager } from "lib/services/prayerSync/prayerSyncManager";
import { PrayerStore } from "lib/stores/prayerStore";
import { getAccountSettingsAsync } from "lib/services/accountSettingsSyncService";
import {
  uploadKeySettings,
  type FirebaseAccountSettings,
  type FirebaseAccountSettingsResult,
} from "../firebase/users";
import {
  generateNewKeys,
  type Keys,
  type KeySettings,
  importAccountKeys,
  quickCompareKeySettings,
  extractKeysWithDataPassphrase,
} from "./keys";
import {
  deriveDataPassphraseDerivedKey,
  exportAccountKey,
  generateAccountKeyCheckValue,
  generateDataPassphraseDerivedKeyDerivationParams,
  wrapAccountKey,
} from "./encryption";
import {
  writeKeysToLocal,
  loadKeysFromLocal,
  loadAccountKeyFromLocal,
} from "../local-database/keys-db";

const GUEST_ID = "guest";

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

  //----------------------------------------------------------------------------
  // Setters
  //----------------------------------------------------------------------------
  setName(name: string) {
    this.name = name;
  }

  setEmail(email: string) {
    this.email = email;
  }

  //----------------------------------------------------------------------------
  // Getters
  //----------------------------------------------------------------------------
  getAccountKey(): CryptoKey | undefined {
    return this.keys.key;
  }

  getFullId(): string {
    return this.id + (this.isCloudAccount ? "@cloud" : "@local");
  }

  isE2EEEnabled(): boolean {
    return this.keys.keySettings.unprotectedAccountKey === undefined;
  }

  requiresDataPassphrase(): boolean {
    return this.keys.key === undefined && this.isE2EEEnabled();
  }

  //----------------------------------------------------------------------------
  // Member Functions
  //----------------------------------------------------------------------------
  /**
   * Change the data passphrase for an account. Can be used to set a new data
   * passphrase or change an existing one. Will enable E2EE.
   * @param dataPassphrase new data passphrase to wrap account key
   */
  async changeDataPassphrase(dataPassphrase: string): Promise<boolean> {
    if (this.keys.key === undefined) {
      return false;
    }

    // Create Data Passphrase Derived Key to wrap account key for E2EE
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

    // Generate new Account Key Check Value for Account Key
    // Prevent observers without Account Key from confirming Account Key changes
    const accountKeyCheckValue = await generateAccountKeyCheckValue(
      this.keys.key,
    );

    // Create temporary updated keySettings, removing unprotectedAccountKey
    const newKeySettings: KeySettings = {
      accountKeyCheckValue,
      protectedAccountKey,
      dataPassphraseDerivedKeyDerivationParams,
    };

    return this.saveAndSetKeys({
      key: this.keys.key,
      keySettings: newKeySettings,
    });
  }

  /**
   * Remove the data passphrase for an account. Will disable E2EE.
   * @param dataPassphrase Use data passphrase to unwrap protected key.
   */
  async removeDataPassphrase(dataPassphrase: string): Promise<boolean> {
    if (
      this.keys.keySettings.protectedAccountKey === undefined ||
      this.keys.keySettings.dataPassphraseDerivedKeyDerivationParams ===
        undefined
    ) {
      return false;
    }
    const extractedKeys = await extractKeysWithDataPassphrase(
      this.keys.keySettings,
      dataPassphrase,
    );
    if (extractedKeys.key === undefined) {
      return false;
    }

    // The data passphrase was correct, update key state disabling E2EE
    const newKeySettings: KeySettings = {
      accountKeyCheckValue: extractedKeys.keySettings.accountKeyCheckValue,
      unprotectedAccountKey: await exportAccountKey(extractedKeys.key),
    };
    const saveSuccess = await this.saveAndSetKeys({
      key: extractedKeys.key,
      keySettings: newKeySettings,
    });
    if (!saveSuccess) {
      return false;
    }

    // If account wasn't initialized yet, initialize services
    if (!this.initialized) {
      this.initialized = await Account.initializeServices(this);
      return this.initialized;
    }

    return true;
  }

  /**
   * Derive an account keys.key using data passphrase to unlock prayers
   * If successfull, initialize account services. Otherwise do nothing.
   * @param dataPassphrase To unlock account key
   * @returns if unwrap account key was successful and services were initialized
   */
  async deriveAndUnwrapAccountKey(dataPassphrase: string): Promise<boolean> {
    // Use data passphrase to unwrap account key, setting newKeys.key if successful
    // If data passphrase is incorrect, newKeys.key remains undefined.
    const newKeys = await extractKeysWithDataPassphrase(
      this.keys.keySettings,
      dataPassphrase,
    );
    if (newKeys.key === undefined) {
      return false;
    }

    this.keys = newKeys;
    Account.saveKeysToLocal(this);
    this.initialized = await Account.initializeServices(this);
    return this.initialized;
  }

  /**
   * Save keys to external firebase (if cloud account) and local storage always
   * If successful external save, set in memory
   */
  async saveAndSetKeys(keys: Keys): Promise<boolean> {
    try {
      if (this.isCloudAccount) {
        await uploadKeySettings(this.id, keys.keySettings);
      }
      Account.saveKeysToLocal(this);
      this.keys = keys;
      return true;
    } catch (error: unknown) {
      console.error("Failed to sync keys with server", error);
    }
    return false;
  }

  //----------------------------------------------------------------------------
  // Static Functions
  //----------------------------------------------------------------------------
  /**
   * Save all of keys to local storage
   */
  static async saveKeysToLocal(account: Account): Promise<boolean> {
    try {
      await writeKeysToLocal(account.getFullId(), account.keys);
      return true;
    } catch (error: unknown) {
      console.log("Failed to save keys to local:", (error as Error).message);
    }
    return false;
  }

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
  static async createNewLocalAccount(): Promise<Account> {
    const id = crypto.randomUUID();
    const keys = await generateNewKeys();
    return new Account(id, /*isCloudAccount=*/ false, "Guest", keys);
  }

  /**
   * Connect an account to prayer sync services and do an initial pull
   * Load protected prayers and save them to the account prayer buffer (encrypted)
   * Decrypt them and load them into the prayer store
   * TODO: Check if we need to await on this (await initializePrayers),
   *       might be able to spin off on a new thread
   * @param account
   */
  static async initializePrayers(account: Account) {
    // Don't re-initialize on async initial, if already done on cache initialize
    if (account.keys.key === undefined || account.initialized) {
      return;
    }
    await prayerSyncManager.initialize(
      account.id,
      account.isCloudAccount,
      account.keys.key,
    );
  }

  /**
   * Disconnect account from services like prayer sync
   */
  static uninitializeServices() {
    if (prayerSyncManager.isInitialized()) {
      prayerSyncManager.uninitialize();
      PrayerStore.clearStorage();
    }
  }

  /**
   * Use Firebase account pulled from server to initialize services that weren't
   * able to be initialized during the initial cache load.
   * Don't do anything if keys are the same.
   * @param account account pulled from server
   * @param keys keys pulled from server, potentially new
   * @returns a boolean if account was initialized
   */
  static async asyncInitializeServices(account: Account, keys: Keys) {
    const isSameKeysSettings = quickCompareKeySettings(
      account.keys.keySettings,
      keys.keySettings,
    );
    if (!isSameKeysSettings) {
      account.keys = keys;
      Account.saveKeysToLocal(account);
      account.initialized = await Account.initializeServices(account);
      return account.initialized;
    }
  }

  /**
   * Take in a new account and initialize relevant services with keys.key
   * If no keys.key, load from local database or intialized = false;
   */
  static async initializeServices(account: Account): Promise<boolean> {
    let initialized = false;
    // Account is ready to be initialized, start up services
    // If we have an account key, we're good to initialize services
    if (account.keys.key) {
      await Account.initializePrayers(account);
      initialized = true;
    } else {
      // Don't have an account key, e2ee is on, try to pull key from local
      const loadedLocalKey = await loadAccountKeyFromLocal(account.getFullId());
      if (loadedLocalKey) {
        console.log("Loaded key from local");
        account.keys.key = loadedLocalKey;
        Account.initializePrayers(account);
        initialized = true;
      }
      // Otherwise we don't have keys.key thus need to request data passphrase
    }
    return initialized;
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
    getAccountSettingsFromServer?: Promise<FirebaseAccountSettingsResult>,
  ): Promise<Account | undefined> {
    let account = null;

    // ESTABLISH CLOUD ACCOUNT
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
      // If cloud account was loaded from cache, we also start a server pull
      if (fromCache && getAccountSettingsFromServer) {
        getAccountSettingsAsync(getAccountSettingsFromServer);
      }
    } else {
      // ESTABLISH GUEST (local) ACCOUNT
      account = (await loadGuestAccount()) ?? (await createNewGuestAccount());
    }

    // Uninitialize past services, initialize new services with new keys
    Account.uninitializeServices();
    account.initialized = await Account.initializeServices(account);
    return account;
  }
}

//------------------------------------------------------------------------------
// GUEST ACCOUNT FUNCTIONS
//------------------------------------------------------------------------------
/**
 * Create and return a new local guest account
 * @param id
 * @returns Promise<Account>
 */
async function createNewGuestAccount(): Promise<Account> {
  const keys = await generateNewKeys();
  const guest = new Account(GUEST_ID, /*isCloudAccount=*/ false, "Guest", keys);
  Account.saveKeysToLocal(guest);
  return guest;
}

/**
 * Load guest account from local database.
 * Always use "guest@local" as the local guest acount full id.
 * @returns Account local guest account
 */
async function loadGuestAccount(): Promise<Account | null> {
  try {
    const guestKeys = await loadKeysFromLocal(GUEST_ID + "@local");
    if (guestKeys === null) {
      return null;
    }
    return new Account(GUEST_ID, /*isCloudAccount=*/ false, "Guest", guestKeys);
  } catch (_: unknown) {
    return null;
  }
}
