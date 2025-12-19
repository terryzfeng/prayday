// lib/stores/accountStore.ts
// Return true if account prayers are currently locked, need data passphrase to unlock
import { derived } from "svelte/store";
import { account } from "lib/stores/accountStore";

export const accountPrayersLocked = derived(
  account,
  ($account) => $account?.requiresDataPassphrase() ?? false,
);
