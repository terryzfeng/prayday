import { decodeBase64, encodeBase64 } from "./encryption";

export interface Keys {
  user: string;
  dek?: Uint8Array;
  e_dek?: Uint8Array;
}

// dek and e_dek are base64 strings, can be missing if the field was null
export interface SerializedKeys {
  user: string;
  dek?: string;
  e_dek?: string;
}

export function createKey(
  user: string = "",
  dek: Uint8Array | undefined = undefined,
  e_dek: Uint8Array | undefined = undefined,
): Keys {
  return { user: user, dek: dek, e_dek: e_dek };
}

export function isE2EE(keys: Keys) {
  return keys.e_dek !== undefined;
}

/**
 * Serialize keys, convertiong Uint8Array dek and e_dek to base64 strings
 * @param keys to serialize
 * @returns SerializedKeys
 */
export function serializeKeys(keys: Keys): SerializedKeys {
  const serializedKeys: SerializedKeys = { user: keys.user };
  if (keys.dek !== undefined) {
    console.log(encodeBase64(keys.dek));
    serializedKeys.dek = encodeBase64(keys.dek);
  }
  if (keys.e_dek !== undefined) {
    serializedKeys.e_dek = encodeBase64(keys.e_dek);
  }
  console.log("serializedKeys", serializedKeys);
  return serializedKeys;
}

/**
 * Deserialize keys, converint base64 dek and e_dek to Uint8Array
 * @param serializedKeys to deserialize
 * @returns Keys
 */
export function deserializeKeys(serializedKeys: SerializedKeys): Keys {
  const keys: Keys = { user: serializedKeys.user };
  if (serializedKeys.dek !== undefined) {
    keys.dek = decodeBase64(serializedKeys.dek);
  }
  if (serializedKeys.e_dek !== undefined) {
    keys.e_dek = decodeBase64(serializedKeys.e_dek);
  }
  return keys;
}

/**
 * Sync myKeys with remoteKeys, using remote as SOT
 * @param myKeys my keys to sync
 * @param remoteKeys remote keys to sync (aka cloud)
 * @returns synchronized keys
 */
export function syncKeys(myKeys: Keys, remoteKeys: Keys): Keys {
  const thisE2EE = isE2EE(myKeys);
  const remoteE2EE = isE2EE(remoteKeys);
  if (myKeys.user !== remoteKeys.user) {
    // console.warn("local user and cloud user do not match");
    return myKeys;
  }
  // Sync / Merge Keys
  if (thisE2EE !== remoteE2EE) {
    console.warn("local e2ee and cloud e2ee do not match");
    myKeys.dek = remoteKeys.dek;
    myKeys.e_dek = remoteKeys.e_dek;
  } else if (!thisE2EE && myKeys.dek !== remoteKeys.dek) {
    // console.warn("local dek and cloud dek do not match");
    myKeys.dek = remoteKeys.dek;
    myKeys.e_dek = remoteKeys.e_dek; // Should overwrite with null
  } else if (thisE2EE && myKeys.e_dek !== remoteKeys.e_dek) {
    // console.warn("local e_dek and cloud e_dek do not match");
    myKeys.e_dek = remoteKeys.e_dek;
    // WARNING: Assuming we never rotate DEK, updating e_dek is all we need to do.
    // If we rotate dek, we need to also update dek when e_dek changes
    // myKeys.dek = remoteKeys.dek;
  }
  return myKeys;
}
