import { Bytes } from "firebase/firestore";
import type { KeySettings } from "../account/keys";
import type {
  DataPassphraseDerivedKeyDerivationParams,
  EncryptedData,
} from "../account/encryption";

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

/**
 * Convert an EncryptedData object to a tuple of Bytes objects.
 * @param encryptedData - The EncryptedData object to convert.
 * @returns A tuple of Bytes (iv, data)
 */
export function encryptedDataToBytes(
  encryptedData: EncryptedData,
): [Bytes, Bytes] {
  return [
    arrayBufferToBytes(encryptedData.iv),
    arrayBufferToBytes(encryptedData.data),
  ];
}

/**
 * Convert a tuple of Bytes objects to an EncryptedData object.
 * @param iv - The Bytes object representing the IV.
 * @param data - The Bytes object representing the data.
 * @returns An EncryptedData object.
 */
export function bytesToEncryptedData(iv: Bytes, data: Bytes): EncryptedData {
  return {
    iv: bytesToArrayBuffer(iv),
    data: bytesToArrayBuffer(data),
  };
}

// Helper Functions
function arrayBufferToBytes(arrayBuffer: ArrayBuffer): Bytes {
  const uint8Array = new Uint8Array(arrayBuffer);
  return Bytes.fromUint8Array(uint8Array);
}

function bytesToArrayBuffer(bytes: Bytes): ArrayBuffer {
  const uint8Array = bytes.toUint8Array();
  return uint8Array.buffer as ArrayBuffer;
}
