import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./config";
import type { FirebaseError } from "firebase/app";
import {
  createFirebaseAccountSettings,
  type FirebaseAccountSettings,
} from "./users";
import { generateNewKeys } from "../account/keys";
import {
  account as accountStore,
  establishCloudAccount,
} from "lib/stores/accountStore";

/**
 * Sign up a new user for Prayday.
 * @param email
 * @param password
 * @param name
 * @returns success/fail
 */
export const signUp = async (email: string, password: string, name: string) => {
  try {
    // Create FirebaseAuthUser
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    // Create new user account & key settings and upload to Firestore
    const firebaseAccountSettings: FirebaseAccountSettings = {
      name,
      email,
    };
    const keys = await generateNewKeys();
    await createFirebaseAccountSettings(
      userCredential.user.uid,
      firebaseAccountSettings,
      keys.keySettings,
    );
    // Manually establish and log in the user
    const newCloudAccount = await establishCloudAccount(
      userCredential.user,
      firebaseAccountSettings,
      keys.keySettings,
    );
    // TODO: Write keys.key to localStorage
    if (newCloudAccount) {
      accountStore.setAccount(newCloudAccount);
    } else {
      throw new Error(
        "Failed to create account. Please contact Prayday support.",
      );
    }
    return { success: true, user: userCredential.user };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).code === "auth/email-already-in-use") {
      return { success: false, error: "Account already exists" };
    }
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Log in to firebase auth.
 * @param email
 * @param password
 * @returns succes/fail
 */
export const logIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    return { success: true, user: userCredential.user };
  } catch (error: unknown) {
    if ((error as FirebaseError).code === "auth/invalid-credential") {
      return { success: false, error: "Invalid email or password" };
    }
    return { success: false, error: (error as FirebaseError).message };
  }
};

/**
 * Log out from firebase auth.
 * @returns {success: boolean, error?: string}
 */
export const logOut = async () => {
  try {
    await signOut(auth);
    // clear store
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Send password reset email.
 */
export const forgotPassword = async (email: string) => {
  try {
    // Note: will never throw an error
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
};
