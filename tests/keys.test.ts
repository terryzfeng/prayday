import {
  createKey,
  deserializeKeys,
  isE2EE,
  serializeKeys,
  syncKeys,
} from "utils/account/keys";

describe("Key Management", () => {
  test("CreateKey", () => {
    const key = createKey();
    expect(key.user).toBe("");
    expect(key.dek).toBeUndefined();
    expect(key.e_dek).toBeUndefined();
  });

  test("IsE2EE", () => {
    const key = createKey();
    expect(isE2EE(key)).toBe(false);
    const e2eeKey = createKey("", undefined, new Uint8Array());
    expect(isE2EE(e2eeKey)).toBe(true);
  });

  test("Serialize and Unserialize Keys", () => {
    const key = createKey("user", new Uint8Array([1]), new Uint8Array([1]));
    const serializedKey = serializeKeys(key);
    expect(serializedKey).toStrictEqual({
      user: "user",
      dek: "AQ==",
      e_dek: "AQ==",
    });

    const deserializedKey = deserializeKeys(serializedKey);
    expect(deserializedKey).toStrictEqual(key);
  });

  test("SyncKeysUndefined", () => {
    const key1 = createKey();
    const key2 = createKey();
    const syncedKey = syncKeys(key1, key2);
    expect(syncedKey.dek).toBeUndefined();
    expect(syncedKey.e_dek).toBeUndefined();
  });

  test("SyncKeysOverwrite", () => {
    const key1 = createKey("user", undefined, undefined);
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

  test("SyncKeysUndefinedOverwrite", () => {
    const key1 = createKey(
      "user",
      new Uint8Array([1, 2, 3]),
      new Uint8Array([1, 2, 3]),
    );
    const key2 = createKey("user", undefined, undefined);
    const syncedKey = syncKeys(key1, key2);
    expect(syncedKey.user).toBe("user");
    expect(syncedKey.dek).toBeUndefined();
    expect(syncedKey.e_dek).toBeUndefined();
  });

  test("SyncKeysOverwriteNotE2EE", () => {
    const key1 = createKey("user", new Uint8Array([1, 2, 3]), undefined);
    const key2 = createKey("user", undefined, new Uint8Array([1, 2, 3]));
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
    const key2 = createKey("user", undefined, new Uint8Array([7, 8, 9]));
    const syncedKey = syncKeys(key1, key2);
    expect(syncedKey.user).toBe("user");
    expect(syncedKey.dek).toEqual(key1.dek); // not overwritten
    expect(syncedKey.e_dek).toEqual(key2.e_dek);
  });
});
