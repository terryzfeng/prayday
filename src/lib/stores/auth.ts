import { writable } from "svelte/store";
import type { User } from "firebase/auth";
import { auth } from "lib/utils/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { getUserData } from "../utils/firebase/users";
import { prayerSync as PrayerSync } from "../services/prayerSync";
import { PrayerStore } from "lib/stores/prayerStore";

interface UserData {
  name: string;
  email: string;
}

interface AuthStore {
  user: User | null;
  userData: UserData | null;
}

let userLoggedIn = false;

/**
 * Create store for storing user credentials and handling log in/out
 * @returns user auth store
 */
function createAuthStore() {
  const { subscribe, set } = writable<AuthStore>({
    user: null,
    userData: null,
  });

  // Initialize the store with the current auth state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Log In
      const userData = await getUserData(user.uid);
      set({
        user,
        userData: userData.success ? (userData.data as UserData) : null,
      });
      await PrayerSync.initialize(user.uid);
      userLoggedIn = true;
      console.log("logged in", userData.data?.name);
    } else {
      // Log Out
      // stop syncing before deleting everything
      PrayerSync.uninitialize();
      set({ user: null, userData: null });

      // Make sure guests don't get prayers cleared
      if (userLoggedIn) {
        PrayerStore.clearStorage();
        userLoggedIn = false;
      }
      console.log("log out");
    }
  });

  return {
    subscribe,
  };
}

export const user = createAuthStore();
