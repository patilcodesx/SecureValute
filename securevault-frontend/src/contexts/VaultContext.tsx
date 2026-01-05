import React, { createContext, useContext, useState, useEffect } from "react";
import { PasswordEntry } from "@/types";
import { apiFetch } from "@/lib/api";
import {
  generateEncryptionKey,
  encryptData,
  decryptData,
  exportKey,
  importKey,
} from "@/lib/crypto";
import { useAuth } from "@/contexts/AuthContext";

const VaultContext = createContext(null);

export function VaultProvider({ children }) {
  const { user } = useAuth();

  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [isLoading, setLoading] = useState(true);

  // -------------------------------------------------
  // LOAD AES KEY + PASSWORDS
  // -------------------------------------------------
  useEffect(() => {
    (async () => {
      let saved = localStorage.getItem("securevault_password_key");

      if (saved) {
        setKey(await importKey(saved));
      } else {
        const newKey = await generateEncryptionKey();
        const exported = await exportKey(newKey);
        localStorage.setItem("securevault_password_key", exported);
        setKey(newKey);
      }

      await loadPasswords();
      setLoading(false);
    })();
  }, []);

  // -------------------------------------------------
  // LOAD PASSWORDS FROM BACKEND
  // -------------------------------------------------
  const loadPasswords = async () => {
    const res = await apiFetch("/passwords");
    setPasswords(res || []);
  };

  // -------------------------------------------------
  // CREATE PASSWORD
  // -------------------------------------------------
  const createPassword = async ({ title, username, password, url, category }) => {
    if (!key) throw new Error("Key not ready");

    const { encrypted, iv } = await encryptData(password, key);

    const payload = {
      title,
      username,
      encryptedPassword: encrypted,
      iv,
      url,
      category: category || "General",
    };

    const saved = await apiFetch("/passwords", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setPasswords((prev) => [...prev, saved]);
    return saved;
  };

  // -------------------------------------------------
  // UPDATE PASSWORD (NEW)
  // -------------------------------------------------
  const updatePassword = async (id, updated) => {
    if (!key) throw new Error("Key not ready");

    // Encrypt updated password
    const { encrypted, iv } = await encryptData(updated.password, key);

    const payload = {
      title: updated.title,
      username: updated.username,
      url: updated.url,
      category: updated.category,
      encryptedPassword: encrypted,
      iv,
    };

    const saved = await apiFetch(`/passwords/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    // Update UI list
    setPasswords((prev) =>
      prev.map((p) => (p.id === id ? saved : p))
    );

    return saved;
  };

  // -------------------------------------------------
  // DECRYPT
  // -------------------------------------------------
  const decryptPassword = async (entry) => {
    if (!key) throw new Error("Key not ready");
    return decryptData(entry.encryptedPassword, entry.iv, key);
  };

  // -------------------------------------------------
  // DELETE PASSWORD
  // -------------------------------------------------
  const deletePassword = async (id) => {
    await apiFetch(`/passwords/${id}`, { method: "DELETE" });
    setPasswords((prev) => prev.filter((p) => p.id !== id));
  };

  const getUserPasswords = () => passwords;

  return (
    <VaultContext.Provider
      value={{
        passwords,
        isLoading,
        createPassword,
        decryptPassword,
        deletePassword,
        getUserPasswords,
        updatePassword, // ⭐ EXPORTED HERE
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export const useVault = () => useContext(VaultContext);
