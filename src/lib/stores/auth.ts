import { writable } from "svelte/store";
import type { User } from "firebase/auth";
import { auth } from "lib/utils/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { getUserData } from "../utils/firebase/users";
import { prayerSync as PrayerSync } from "../services/prayerSync";
import { PrayerStore } from "lib/stores/prayerStore";
// import { establishUser, generateAndSetDek } from "../utils/encryption";
import { e2eeEnabledStore } from "./e2eeEnabledStore";

// User Doc fields on Firebase
interface UserData {
  name: string;
  email: string;
  // Encryption
  dek: string | null;
  e_dek: string | null;
  e2ee_enabled: boolean;
}

interface AuthStore {
  user: User | null;
  userData: UserData | null;
}

let userLoggedIn = false;
let guestAccountId: string = "guest";

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
      // Site load and user is logged in
      const userData = await getUserData(user.uid);
      // Check if e2ee
      const e2ee = userData.data?.e2ee_enabled ?? false;
      e2eeEnabledStore.set(e2ee);
      // establishUser(
      //   user.uid,
      //   e2ee,
      //   userData.data?.dek_base64,
      //   userData.data?.e_dek_base64,
      // );
      set({
        user,
        userData: userData.success ? (userData.data as UserData) : null,
      });
      console.log("Logged in", userData.data?.name);
      await PrayerSync.initialize(user.uid);
      userLoggedIn = true;
    } else {
      // Switching from logged in to log out
      if (userLoggedIn) {
        console.log("Log out");
        // Disconnect Prayer Sync
        PrayerSync.uninitialize();
        // Clear Auth credential
        set({ user: null, userData: null });
        // Clear memory and local storage
        PrayerStore.clearStorage();
        userLoggedIn = false;
      }
    }
  });

  return {
    subscribe,
  };
}

export const user = createAuthStore();
