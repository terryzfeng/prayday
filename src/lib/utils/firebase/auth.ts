import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./config";

/**
 * Sign up a new user for Prayday.
 * @param email
 * @param password
 * @param name
 * @returns success/fail
 */
export const signUp = async (email: string, password: string, name: string) => {
  try {
    // Get current guest key
    // const currentKey = getKeys().dek!;
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name: name,
      email: email,
      // dek_base_64: encodeBase64(currentKey),
    });
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
  } catch (error: any) {
    if (error.code === "auth/invalid-credential") {
      return { success: false, error: "Invalid email or password" };
    }
    return { success: false, error: error.message };
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
  } catch (error: any) {
    return { success: false, error: error.message };
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
