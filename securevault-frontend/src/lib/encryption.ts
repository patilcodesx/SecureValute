// ---------------------------------------------
// AES Encryption Utilities (Frontend)
// ---------------------------------------------

/**
 * Generates a 256-bit AES CryptoKey.
 */
async function getAesKey(): Promise<CryptoKey> {
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  return key;
}

/**
 * Encrypts a plain text message and returns:
 * { encryptedContent: string, iv: string }
 */
export async function encryptMessage(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Generate random IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await getAesKey();

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return {
    encryptedContent: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

/**
 * Decrypts the message using AES-GCM
 */
export async function decryptMessage(encryptedBase64: string, ivBase64: string) {
  try {
    const encryptedBytes = Uint8Array.from(atob(encryptedBase64), (c) =>
      c.charCodeAt(0)
    );
    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));

    const key = await getAesKey(); // ❗ For real projects this key must be stored and shared securely

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedBytes
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.error("Decryption failed:", err);
    return "[Unable to decrypt]";
  }
}
