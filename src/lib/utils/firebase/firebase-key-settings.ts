import { Bytes } from "firebase/firestore";
import type { KeySettings } from "../account/keys";
import type { DataPassphraseDerivedKeyDerivationParams } from "../account/encryption";
import {
  arrayBufferToBytes,
  bytesToArrayBuffer,
  bytesToEncryptedData,
} from "./bytes";

export interface FirebaseKeySettings {
  accountKeyCheckValueIV: Bytes;
  accountKeyCheckValueData: Bytes;
  unprotectedAccountKey?: Bytes;
  protectedAccountKeyIV?: Bytes;
  protectedAccountKeyData?: Bytes;
  dataPassphraseDerivedKeyDerivationParamsSalt?: Bytes;
}

/**
 * Safely serializes a KeySettings object to a FirebaseKeySettings object,
 * handling optional properties with undefined checks.
 *
 * @param keySettings - The source key settings object.
 * @returns A new FirebaseKeySettings object ready for Firestore.
 */
export function serializeKeySettings(
  keySettings: KeySettings,
): FirebaseKeySettings {
  // Start with the required properties that are always present.
  const firebaseSettings: FirebaseKeySettings = {
    accountKeyCheckValueIV: arrayBufferToBytes(
      keySettings.accountKeyCheckValue.iv,
    ),
    accountKeyCheckValueData: arrayBufferToBytes(
      keySettings.accountKeyCheckValue.data,
    ),
  };

  // Conditionally add optional properties if they exist.
  if (keySettings.unprotectedAccountKey) {
    firebaseSettings.unprotectedAccountKey = arrayBufferToBytes(
      keySettings.unprotectedAccountKey,
    );
  }
  if (keySettings.protectedAccountKey) {
    firebaseSettings.protectedAccountKeyIV = arrayBufferToBytes(
      keySettings.protectedAccountKey.iv,
    );
    firebaseSettings.protectedAccountKeyData = arrayBufferToBytes(
      keySettings.protectedAccountKey.data,
    );
  }
  if (keySettings.dataPassphraseDerivedKeyDerivationParams) {
    firebaseSettings.dataPassphraseDerivedKeyDerivationParamsSalt =
      arrayBufferToBytes(
        keySettings.dataPassphraseDerivedKeyDerivationParams.salt,
      );
  }

  return firebaseSettings;
}

/**
 * Deserialize FirebaseKeySettings to KeySettings
 * @param firebaseKeySettings firebaseKeySettings from Firestore
 * @returns KeySettings for user account
 */
export function deserializeFirebaseKeySettings(
  firebaseKeySettings: FirebaseKeySettings,
): KeySettings {
  const keySettings: KeySettings = {
    accountKeyCheckValue: bytesToEncryptedData(
      firebaseKeySettings.accountKeyCheckValueIV,
      firebaseKeySettings.accountKeyCheckValueData,
    ),
  };
  if (firebaseKeySettings.unprotectedAccountKey) {
    keySettings.unprotectedAccountKey = bytesToArrayBuffer(
      firebaseKeySettings.unprotectedAccountKey!,
    );
  }
  if (firebaseKeySettings.protectedAccountKeyData) {
    keySettings.protectedAccountKey = bytesToEncryptedData(
      firebaseKeySettings.protectedAccountKeyIV!,
      firebaseKeySettings.protectedAccountKeyData!,
    );
  }
  if (firebaseKeySettings.dataPassphraseDerivedKeyDerivationParamsSalt) {
    const dataPassphraseDerivedKeyDerivationParams = {
      salt: bytesToArrayBuffer(
        firebaseKeySettings.dataPassphraseDerivedKeyDerivationParamsSalt!,
      ),
    } as DataPassphraseDerivedKeyDerivationParams;
    keySettings.dataPassphraseDerivedKeyDerivationParams =
      dataPassphraseDerivedKeyDerivationParams;
  }
  return keySettings;
}
