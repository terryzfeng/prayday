// lib/stores/accountStore.ts
import { derived } from 'svelte/store';
import { account } from "lib/stores/accountStore";

export const accountRequiresDataPassphrase = derived(
  account,
  $account => $account?.requiresDataPassphrase() ?? false
);