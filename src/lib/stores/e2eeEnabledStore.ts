import { writable } from "svelte/store";

function createE2eeEnabledStore() {
  const { subscribe, set } = writable(false);

  return {
    subscribe,
    set: (enabled: boolean) => {
      set(enabled);
    },
  };
}

function createshowDataPassphraseModalStore() {
  const { subscribe, set } = writable(false);
  let currentValue = false;
  return {
    subscribe,
    set: (show: boolean) => {
      if (currentValue !== show) {
        currentValue = show;
        set(show);
      }
    },
  };
}

export const e2eeEnabledStore = createE2eeEnabledStore();
export const showDataPassphraseModalStore =
  createshowDataPassphraseModalStore();
