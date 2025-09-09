/**
 * Generate a random 32 lenghth Uint8Array DEK
 * @returns Uint8Array
 */
export function generateDek(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

/**
 * Encodes a Uint8Array into a Base64 string, handling potential errors.
 * @param bytes The Uint8Array to encode.
 * @returns A Base64 string if encoding is successful, otherwise an empty string.
 */
export function encodeBase64(bytes: Uint8Array): string {
  try {
    const binaryString = String.fromCharCode(...bytes);
    return btoa(binaryString);
  } catch (error) {
    console.error("Failed to encode Uint8Array to Base64:", error);
    return "";
  }
}

/**
 * Decodes a Base64 string into a Uint8Array, handling potential errors.
 * @param base64String The Base64 string to decode.
 * @returns A Uint8Array if decoding is successful, otherwise undefined
 */
export function decodeBase64(base64String: string): Uint8Array | undefined {
  try {
    const binaryString = atob(base64String);
    return Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
  } catch (error) {
    console.error("Failed to decode Base64 string:", error);
    return undefined;
  }
}
