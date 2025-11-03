import { Bytes } from "firebase/firestore";
import type { EncryptedData } from "lib/utils/account/encryption";

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

export function arrayBufferToBytes(arrayBuffer: ArrayBuffer): Bytes {
  const uint8Array = new Uint8Array(arrayBuffer);
  return Bytes.fromUint8Array(uint8Array);
}

export function bytesToArrayBuffer(bytes: Bytes): ArrayBuffer {
  const uint8Array = bytes.toUint8Array();
  return uint8Array.buffer as ArrayBuffer;
}
