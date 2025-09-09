import {
  computeKeyCheckValue,
  exportAccountKey,
  generateAccountKey,
} from "./encryption-new";
import type { Keys } from "./keys-new";

export default class Account {
  id: string;
  isCloudAccount: boolean;
  private keys: Keys;

  constructor(id: string, isCloudAccount: boolean, keys: Keys) {
    this.id = id;
    this.isCloudAccount = isCloudAccount;
    this.keys = keys;
  }

  static establishAccount(id: string, isCloudAccount: boolean = false) {}

  static async createAccountKeys(id: string): Promise<Keys> {
    let accountKey = await generateAccountKey();
    return {
      key: accountKey,
      keySettings: {
        id: id,
        accountKeyCheckValue: computeKeyCheckValue(accountKey),
        unprotectedAccountKey: JSON.stringify(exportAccountKey(accountKey)),
      },
    };
  }
}

let accounts: Record<string, Account>;

export async function createAccount(
  isCloudAccount: boolean = false,
  id: string = "",
): Promise<string> {
  if (!isCloudAccount) {
    id = "guest";
  }
  let newKeys = await Account.createAccountKeys(id);
  let newAccount = new Account(id, isCloudAccount, newKeys);
  accounts[newAccount.id] = newAccount;
  return newAccount.id;
}

export function accountExist(id: string | null) {
  return id !== null && accounts[id] !== undefined;
}

export function logOutAccount(id: string) {
  delete accounts[id];
}
