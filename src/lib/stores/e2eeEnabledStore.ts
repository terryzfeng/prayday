import { writable } from "svelte/store";

function createE2eeEnabledStore() {
  const { subscribe, set } = writable(false);

  return {
    subscribe,
    set: (enabled: boolean) => set(enabled),
  };
}

export const e2eeEnabledStore = createE2eeEnabledStore();
