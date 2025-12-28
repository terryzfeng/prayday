import { writable } from "svelte/store";

export type ConfirmRequest = {
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  warning?: boolean;
  resolve: (value: boolean) => void;
};

function createConfirmManager() {
  const queue = writable<ConfirmRequest[]>([]);

  return {
    subscribe: queue.subscribe,
    confirm: (message: string, options = {}) => {
      console.log("confirm");
      return new Promise<boolean>((resolve) => {
        queue.update((q) => [...q, { message, ...options, resolve }]);
      });
    },
    resolve: (value: boolean) => {
      queue.update((q) => {
        const [current, ...rest] = q;
        if (current) current.resolve(value);
        return rest;
      });
    },
  };
}

export const ConfirmManager = createConfirmManager();
