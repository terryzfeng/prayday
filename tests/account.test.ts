import Account, {
  loadKeysLocal,
  writeKeysLocal,
} from "../src/lib/utils/account/account";
import { createKey, type Keys } from "../src/lib/utils/account/keys";
import {
  generateDek,
  decodeBase64,
  encodeBase64,
} from "../src/lib/utils/account/encryption";

// Mock LocalStorage
const localStorageMock = (function () {
  let store: { [key: string]: string } = {};
  return {
    getItem: function (key: string) {
      return store[key] || undefined;
    },
    setItem: function (key: string, value: string) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
    removeItem: function (key: string) {
      delete store[key];
    },
  };
})();
Object.defineProperty(global, "localStorage", { value: localStorageMock });

// Mock encode and decode functions
jest.mock("../src/lib/utils/account/encryption", () => ({
  generateDek: jest.fn(() => new Uint8Array([1, 2, 3])), // Mocked DEK
  encodeBase64: jest.fn((uint8Array: Uint8Array) => {
    if (uint8Array === new Uint8Array([1, 2, 3])) return "mocked_dek_base64";
    if (uint8Array === new Uint8Array([4, 5, 6])) return "mocked_edek_base64";
  }),
  decodeBase64: jest.fn((base64String: string) => {
    if (base64String === "") return new Uint8Array();
    if (base64String === "mocked_dek_base64") return new Uint8Array([1, 2, 3]);
    if (base64String === "mocked_edek_base64") return new Uint8Array([4, 5, 6]);
    return undefined;
  }),
}));
const mockGenerateDek = generateDek as jest.Mock;
const mockDecodeBase64 = decodeBase64 as jest.Mock;

// Globals
const myDek = new Uint8Array([1, 2, 3]);
const myEDek = new Uint8Array([4, 5, 6]);
const myDekBase64 = "mocked_dek_base64";
const myEDekBase64 = "mocked_e_dek_base64";

describe("Account Management", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("LocalStorage Key Tests", () => {
    test("Empty LocalStorage", () => {
      const localKeys = loadKeysLocal();
      expect(localKeys).toStrictEqual({
        user: "",
        dek: undefined,
        e_dek: undefined,
      });
    });

    test("should correctly load keys from localStorage when they exist", () => {
      const storedKeys = createKey("testUser", myDek, undefined);
      writeKeysLocal(storedKeys);
      const localKeys = loadKeysLocal();
      console.log(storedKeys);
      console.log(localKeys);
      expect(localKeys).toStrictEqual(storedKeys);
    });

    test("should return default keys if localStorage contains invalid JSON", () => {
      localStorage.setItem("keys", "invalid json");
      const keys = loadKeysLocal();
      expect(keys).toEqual({ user: "", dek: undefined, e_dek: undefined });
      expect(mockCreateKey).toHaveBeenCalled();
    });
  });

  describe("writeKeysLocal", () => {
    test("should correctly write a Keys object to localStorage", () => {
      const keys: Keys = {
        user: "testUser",
        dek: new Uint8Array([1, 2, 3]),
        e_dek: undefined,
      };
      writeKeysLocal(keys);
      const storedValue = localStorage.getItem("keys");
      expect(storedValue).toBe(
        JSON.stringify({ user: "testUser", dek: [1, 2, 3], e_dek: undefined }),
      );
    });
  });

  describe("Account class", () => {
    test("constructor should set initial state correctly", () => {
      const keys: Keys = {
        user: "testUser",
        dek: new Uint8Array([1, 2, 3]),
        e_dek: undefined,
      };
      const account = new Account("testUser", keys, false);
      expect(account.getKeys()).toBe(keys);
      expect(account.getIsCloudAccount()).toBe(false);
      expect(account.getE2EE()).toBe(false);

      const e2eeKeys: Keys = {
        user: "testUser",
        dek: new Uint8Array([1, 2, 3]),
        e_dek: new Uint8Array([4, 5, 6]),
      };
      const e2eeAccount = new Account("testUser", e2eeKeys, true);
      expect(e2eeAccount.getE2EE()).toBe(true);
    });

    describe("establishKeysForAccount", () => {
      test("should create new keys for a new user with no existing keys", () => {
        mockCreateKey.mockReturnValueOnce({
          user: "",
          dek: undefined,
          e_dek: undefined,
        }); // loadKeysLocal returns default
        mockCreateKey.mockReturnValueOnce({
          user: "newUser",
          dek: undefined,
          e_dek: undefined,
        }); // initialKeys
        mockGenerateDek.mockReturnValue(new Uint8Array([1, 1, 1, 1])); // Mock generated DEK

        Account.establishKeysForAccount("newUser", false, "", "");

        // Check that local storage was checked
        expect(localStorage.getItem("keys")).toBeundefined();

        // Check that new keys were created and written
        const writtenKeys = JSON.parse(localStorage.getItem("keys")!);
        expect(writtenKeys.user).toBe("newUser");
        expect(writtenKeys.dek).toEqual([1, 1, 1, 1]);
        expect(writtenKeys.e_dek).toBeundefined();
      });

      test("should load local keys for an existing user", () => {
        const storedKeys = {
          user: "existingUser",
          dek: [7, 8, 9],
          e_dek: undefined,
        };
        localStorage.setItem("keys", JSON.stringify(storedKeys));
        mockCreateKey.mockReturnValueOnce({
          user: "existingUser",
          dek: new Uint8Array([7, 8, 9]),
          e_dek: undefined,
        }); // loadKeysLocal

        Account.establishKeysForAccount("existingUser", false, "", "");

        // Should not create new keys, just load and rewrite the existing ones (or sync)
        const writtenKeys = JSON.parse(localStorage.getItem("keys")!);
        expect(writtenKeys.user).toBe("existingUser");
        expect(writtenKeys.dek).toEqual([7, 8, 9]);
        expect(writtenKeys.e_dek).toBeundefined();
        expect(mockGenerateDek).not.toHaveBeenCalled(); // Should not generate new keys
      });

      test("should sync with cloud keys for a cloud account", () => {
        const localKeys: Keys = {
          user: "cloudUser",
          dek: new Uint8Array([10, 11, 12]),
          e_dek: undefined,
        };
        localStorage.setItem(
          "keys",
          JSON.stringify({
            user: "cloudUser",
            dek: [10, 11, 12],
            e_dek: undefined,
          }),
        );
        mockCreateKey.mockReturnValueOnce(localKeys); // loadKeysLocal
        mockCreateKey.mockReturnValueOnce({
          user: "cloudUser",
          dek: undefined,
          e_dek: undefined,
        }); // initialKeys
        mockDecodeBase64.mockReturnValueOnce(new Uint8Array([13, 14, 15])); // mocked_dek_base64
        mockDecodeBase64.mockReturnValueOnce(new Uint8Array([16, 17, 18])); // mocked_edek_base64

        Account.establishKeysForAccount(
          "cloudUser",
          true,
          "mocked_dek_base64",
          "mocked_edek_base64",
        );

        // Check that syncKeys was called with correct arguments
        expect(mockSyncKeys).toHaveBeenCalledWith(localKeys, {
          user: "cloudUser",
          dek: new Uint8Array([13, 14, 15]),
          e_dek: new Uint8Array([16, 17, 18]),
        });

        // Check that the synced keys were written
        const writtenKeys = JSON.parse(localStorage.getItem("keys")!);
        // Based on mockSyncKeys, cloud keys prioritize
        expect(writtenKeys.user).toBe("cloudUser");
        expect(writtenKeys.dek).toEqual([13, 14, 15]);
        expect(writtenKeys.e_dek).toEqual([16, 17, 18]);
      });

      test("should sync with cloud keys when local keys exist for a cloud account", () => {
        const localKeys: Keys = {
          user: "syncUser",
          dek: new Uint8Array([20, 21, 22]),
          e_dek: new Uint8Array([23, 24, 25]),
        };
        localStorage.setItem(
          "keys",
          JSON.stringify({
            user: "syncUser",
            dek: [20, 21, 22],
            e_dek: [23, 24, 25],
          }),
        );
        mockCreateKey.mockReturnValueOnce(localKeys); // loadKeysLocal
        mockCreateKey.mockReturnValueOnce({
          user: "syncUser",
          dek: undefined,
          e_dek: undefined,
        }); // initialKeys
        mockDecodeBase64.mockReturnValueOnce(new Uint8Array([26, 27, 28])); // mocked_dek_base64
        mockDecodeBase64.mockReturnValueOnce(undefined); // no e_dek in cloud

        Account.establishKeysForAccount(
          "syncUser",
          true,
          "mocked_dek_base64",
          "",
        );

        // Check that syncKeys was called with correct arguments
        expect(mockSyncKeys).toHaveBeenCalledWith(localKeys, {
          user: "syncUser",
          dek: new Uint8Array([26, 27, 28]),
          e_dek: undefined,
        });

        // Check that the synced keys were written
        const writtenKeys = JSON.parse(localStorage.getItem("keys")!);
        // Based on mockSyncKeys, cloud keys prioritize
        expect(writtenKeys.user).toBe("syncUser");
        expect(writtenKeys.dek).toEqual([26, 27, 28]);
        expect(writtenKeys.e_dek).toBeundefined(); // Cloud had undefined, overwrites local e_dek
      });

      test("should create new keys if no keys exist after sync", () => {
        localStorage.clear(); // No local keys
        mockCreateKey.mockReturnValueOnce({
          user: "",
          dek: undefined,
          e_dek: undefined,
        }); // loadKeysLocal
        mockCreateKey.mockReturnValueOnce({
          user: "noKeysUser",
          dek: undefined,
          e_dek: undefined,
        }); // initialKeys
        mockSyncKeys.mockReturnValueOnce({
          user: "noKeysUser",
          dek: undefined,
          e_dek: undefined,
        }); // Sync results in undefined keys
        mockGenerateDek.mockReturnValue(new Uint8Array([30, 31, 32, 33])); // Mock generated DEK

        Account.establishKeysForAccount("noKeysUser", true, "", "");

        // Check that syncKeys was called
        expect(mockSyncKeys).toHaveBeenCalled();

        // Check that new keys were created and written because sync resulted in undefined keys
        const writtenKeys = JSON.parse(localStorage.getItem("keys")!);
        expect(writtenKeys.user).toBe("noKeysUser");
        expect(writtenKeys.dek).toEqual([30, 31, 32, 33]);
        expect(writtenKeys.e_dek).toBeundefined();
        expect(mockGenerateDek).toHaveBeenCalled();
      });
    });

    test("createNewKeysForAccount should generate a new dek and set e_dek to undefined", () => {
      const initialKeys: Keys = {
        user: "testUser",
        dek: new Uint8Array([1, 2, 3]),
        e_dek: new Uint8Array([4, 5, 6]),
      };
      const account = new Account("testUser", initialKeys, false);
      expect(account.getE2EE()).toBe(true);

      mockGenerateDek.mockReturnValue(new Uint8Array([99, 98, 97]));

      account.createNewKeysForAccount();

      const newKeys = account.getKeys();
      expect(newKeys.user).toBe("testUser");
      expect(newKeys.dek).toEqual(new Uint8Array([99, 98, 97]));
      expect(newKeys.e_dek).toBeundefined();
      expect(account.getE2EE()).toBe(false);
      expect(mockGenerateDek).toHaveBeenCalled();
    });

    test("getKeys should return the current keys", () => {
      const keys: Keys = {
        user: "testUser",
        dek: new Uint8Array([1, 2, 3]),
        e_dek: undefined,
      };
      const account = new Account("testUser", keys, false);
      expect(account.getKeys()).toBe(keys);
    });

    test("getIsCloudAccount should return the cloud account status", () => {
      const keys: Keys = { user: "testUser", dek: undefined, e_dek: undefined };
      const localAccount = new Account("testUser", keys, false);
      expect(localAccount.getIsCloudAccount()).toBe(false);

      const cloudAccount = new Account("testUser", keys, true);
      expect(cloudAccount.getIsCloudAccount()).toBe(true);
    });

    test("getE2EE should return the e2ee status based on e_dek", () => {
      const keysWithEDek: Keys = {
        user: "testUser",
        dek: new Uint8Array([1, 2, 3]),
        e_dek: new Uint8Array([4, 5, 6]),
      };
      const e2eeAccount = new Account("testUser", keysWithEDek, false);
      expect(e2eeAccount.getE2EE()).toBe(true);

      const keysWithoutEDek: Keys = {
        user: "testUser",
        dek: new Uint8Array([1, 2, 3]),
        e_dek: undefined,
      };
      const nonE2eeAccount = new Account("testUser", keysWithoutEDek, false);
      expect(nonE2eeAccount.getE2EE()).toBe(false);
    });
  });
});
