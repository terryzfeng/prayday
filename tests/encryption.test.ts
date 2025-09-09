import {
  generateDek,
  encodeBase64,
  decodeBase64,
} from "../src/lib/utils/account/encryption";

const HelloUint8Array = new Uint8Array([72, 101, 108, 108, 111]);
const HelloBase64 = "SGVsbG8=";

describe("Encryption", () => {
  test("GenerateDekLength", () => {
    const dek = generateDek();
    expect(dek).toBeInstanceOf(Uint8Array);
    expect(dek.length).toBe(32);
  });

  // Encode
  describe("Encode", () => {
    test("Encode Uint8Array", () => {
      const bytes = HelloUint8Array; // "Hello"
      expect(encodeBase64(bytes)).toBe(HelloBase64);
    });

    test("EncodeEmpty", () => {
      const bytes = new Uint8Array([]);
      expect(encodeBase64(bytes)).toBe("");
    });
  });

  // Decode
  describe("Decode", () => {
    test("DecodeBase64", () => {
      const base64String = HelloBase64; // "Hello"
      expect(decodeBase64(base64String)).toEqual(HelloUint8Array);
    });

    test("DecodeInvalidString", () => {
      expect(decodeBase64("invalid base64")).toBeUndefined();
    });

    test("DecodeEmpty", () => {
      expect(decodeBase64("")).toEqual(new Uint8Array([]));
    });
  });

  // Encode & Decode
  describe("Combo Encode & Decode", () => {
    test("Encode & Decode Empty", () => {
      const bytes = new Uint8Array([]);
      const base64String = encodeBase64(bytes);
      const decodedBytes = decodeBase64(base64String);
      expect(decodedBytes).toEqual(bytes);
    });

    test("Encode & Decode String", () => {
      const bytes = HelloUint8Array; // "Hello"
      const base64String = encodeBase64(bytes);
      const decodedBytes = decodeBase64(base64String);
      expect(decodedBytes).toEqual(bytes);
    });
  });
});
