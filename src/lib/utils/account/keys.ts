export interface Keys {
  user: string;
  dek: Uint8Array | null;
  e_dek: Uint8Array | null;
}

export function createKey(
  user: string = "",
  dek: Uint8Array | null = null,
  e_dek: Uint8Array | null = null,
): Keys {
  return { user: user, dek: dek, e_dek: e_dek };
}

export function isE2EE(keys: Keys) {
  return keys.e_dek !== null;
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
