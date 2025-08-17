import { createKey, isE2EE, syncKeys } from "utils/account/keys";

describe("Key Management", () => {
  test("CreateKey", () => {
    const key = createKey();
    expect(key.user).toBe("");
    expect(key.dek).toBeNull();
    expect(key.e_dek).toBeNull();
  });

  test("IsE2EE", () => {
    const key = createKey();
    expect(isE2EE(key)).toBe(false);
    const e2eeKey = createKey("", null, new Uint8Array());
    expect(isE2EE(e2eeKey)).toBe(true);
  });

  test("SyncKeysNull", () => {
    const key1 = createKey();
    const key2 = createKey();
    const syncedKey = syncKeys(key1, key2);
    expect(syncedKey.dek).toBeNull();
    expect(syncedKey.e_dek).toBeNull();
  });

  test("SyncKeysOverwrite", () => {
    const key1 = createKey("user", null, null);
    const key2 = createKey(
      "user",
      new Uint8Array([1, 2, 3]),
      new Uint8Array([1, 2, 3]),
    );
    expect(isE2EE(key1)).toBe(false);
    expect(isE2EE(key2)).toBe(true);
    const syncedKey = syncKeys(key1, key2);
    expect(syncedKey.user).toBe("user");
    expect(syncedKey.dek).toEqual(key2.dek);
    expect(syncedKey.e_dek).toEqual(key2.e_dek);
  });

  test("SyncKeysNullOverwrite", () => {
    const key1 = createKey(
      "user",
      new Uint8Array([1, 2, 3]),
      new Uint8Array([1, 2, 3]),
    );
    const key2 = createKey("user", null, null);
    const syncedKey = syncKeys(key1, key2);
    expect(syncedKey.user).toBe("user");
    expect(syncedKey.dek).toBeNull();
    expect(syncedKey.e_dek).toBeNull();
  });

  test("SyncKeysOverwriteNotE2EE", () => {
    const key1 = createKey("user", new Uint8Array([1, 2, 3]), null);
    const key2 = createKey("user", null, new Uint8Array([1, 2, 3]));
    const syncedKey = syncKeys(key1, key2);
    expect(syncedKey.user).toBe("user");
    expect(syncedKey.dek).toEqual(key2.dek);
    expect(syncedKey.e_dek).toEqual(key2.e_dek);
  });

  test("SyncKeysOverwritePartialE2EE", () => {
    const key1 = createKey(
      "user",
      new Uint8Array([1, 2, 3]),
      new Uint8Array([4, 5, 6]),
    );
    const key2 = createKey("user", null, new Uint8Array([7, 8, 9]));
    const syncedKey = syncKeys(key1, key2);
    expect(syncedKey.user).toBe("user");
    expect(syncedKey.dek).toEqual(key1.dek); // not overwritten
    expect(syncedKey.e_dek).toEqual(key2.e_dek);
  });
});
