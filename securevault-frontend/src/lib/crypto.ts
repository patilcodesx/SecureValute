// AES-256-GCM Encryption utilities using Web Crypto API
// - Exports array/base64 helpers so other modules can reuse them
// - Provides encryptFile/decryptFile for raw binary encryption of files

export async function generateEncryptionKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported);
}

export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(keyString);
  return crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(
  data: string,
  key: CryptoKey
): Promise<{ encrypted: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedData
  );

  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
  };
}

export async function decryptData(
  encrypted: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const encryptedBuffer = base64ToArrayBuffer(encrypted);
  const ivBuffer = base64ToArrayBuffer(iv);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
    key,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Encrypt a File (binary) -> returns ArrayBuffer (encrypted) and base64 iv
export async function encryptFile(
  file: File,
  key: CryptoKey
): Promise<{ encrypted: ArrayBuffer; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const fileBuffer = await file.arrayBuffer();

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    fileBuffer
  );

  return {
    encrypted,
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
  };
}

// Decrypt raw encrypted ArrayBuffer using base64 iv
export async function decryptFile(
  encrypted: ArrayBuffer,
  iv: string,
  key: CryptoKey
): Promise<ArrayBuffer> {
  const ivBuffer = base64ToArrayBuffer(iv);

  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
    key,
    encrypted
  );
}

// ------------------------
// Utility functions
// ------------------------
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  // safer chunked conversion to avoid call-stack issues on large files
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ------------------------
// Password-based key derivation (if you need it)
// ------------------------
export async function deriveKeyFromPassword(
  password: string,
  existingSalt?: string
): Promise<{ key: CryptoKey; salt: string }> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  let saltBuffer: ArrayBuffer;
  if (existingSalt) {
    saltBuffer = base64ToArrayBuffer(existingSalt);
  } else {
    const newSalt = crypto.getRandomValues(new Uint8Array(16));
    saltBuffer = newSalt.buffer as ArrayBuffer;
  }

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(saltBuffer),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  return {
    key,
    salt: arrayBufferToBase64(saltBuffer),
  };
}

// Helpers
export function generateId(): string {
  return crypto.randomUUID();
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
