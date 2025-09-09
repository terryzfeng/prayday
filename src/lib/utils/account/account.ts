import {
  createKey,
  deserializeKeys,
  serializeKeys,
  syncKeys,
  type Keys,
  type SerializedKeys,
} from "./keys";
import { decodeBase64, encodeBase64, generateDek } from "./encryption";

// Account class for handling keys and syncing to localStorage/cloud
export default class Account {
  private uid: string;
  private keys: Keys;
  private isCloudAccount: boolean;
  private e2ee: boolean;

  // Private Constructor
  constructor(uid: string, keys: Keys, isCloudAccount: boolean = false) {
    this.uid = uid;
    this.keys = keys;
    this.isCloudAccount = isCloudAccount;
    this.e2ee = keys.e_dek !== null;
  }

  static establishKeysForAccount(
    new_user: string,
    isCloudAccount: boolean = false,
    dek_base64: string = "",
    e_dek_base64: string = "",
  ) {
    // Default empty keys
    let initialKeys: Keys = createKey();

    // If we already have local keys for this user (aka refresh)
    const localKeys = loadKeysLocal();
    if (localKeys.user === new_user) {
      initialKeys = localKeys;
    }

    // If we are a cloud account, sync with the cloud
    if (isCloudAccount) {
      const cloudKeys = createKey(
        new_user,
        decodeBase64(dek_base64),
        decodeBase64(e_dek_base64),
      );
      initialKeys = syncKeys(initialKeys, cloudKeys);
    }

    // Initial keys are now synchronized with LocalStorage and Cloud
    // Create an account and initialize
    let account = new Account(new_user, initialKeys, isCloudAccount);

    // If we don't have any prior account keys
    if (account.getKeys().dek === null && account.getKeys().e_dek === null) {
      account.createNewKeysForAccount();
    }

    writeKeysLocal(account.getKeys());
  }

  /**
   * Create new keys for an account
   */
  createNewKeysForAccount() {
    this.keys = {
      user: this.uid,
      dek: generateDek(),
      e_dek: undefined,
    };
    this.e2ee = false;
  }

  getKeys(): Keys {
    return this.keys;
  }
  getIsCloudAccount(): boolean {
    return this.isCloudAccount;
  }
  getE2EE(): boolean {
    return this.e2ee;
  }
}

//------------------------------------------------------------------------------
// LocalStoage Account Management
//------------------------------------------------------------------------------
// LocalStorage key where we store the user's `keys`
const KEYS = "keys";

export function loadKeysLocal(): Keys {
  const localKeysJSON = localStorage.getItem(KEYS);
  if (localKeysJSON) {
    const parsedKeys = JSON.parse(localKeysJSON);
    return deserializeKeys(parsedKeys);
  }
  // No key found in localStorage
  return createKey();
}

/**
 * Takes Keys and serializes them before writing to localStorage
 * @param keys Keys to write to localStorage
 */
export function writeKeysLocal(keys: Keys) {
  if (keys.dek === undefined && keys.e_dek === undefined) {
    return;
  }
  localStorage.setItem(KEYS, JSON.stringify(serializeKeys(keys)));
}
