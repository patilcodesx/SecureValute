// src/contexts/NotesContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { EncryptedNote } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  generateId,
  generateEncryptionKey,
  exportKey,
  importKey,
  encryptData,
  decryptData,
} from "@/lib/crypto";

interface NotesContextType {
  notes: EncryptedNote[];
  isLoading: boolean;

  createNote: (title: string, content: string, tags?: string[]) => Promise<EncryptedNote>;
  getNote: (id: string) => EncryptedNote | undefined;
  getUserNotes: () => EncryptedNote[];
  updateNote: (id: string, updates: any) => Promise<void>;
  deleteNote: (id: string) => Promise<boolean>;
  decryptNoteContent: (note: EncryptedNote) => Promise<string>;
  reloadNotes: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);
const STORAGE_KEYS = { NOTE_KEY: "securevault_note_key" };

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<EncryptedNote[]>([]);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user, addActivityLog } = useAuth();

  // Init encryption key + notes
  useEffect(() => {
    (async () => {
      try {
        let stored = localStorage.getItem(STORAGE_KEYS.NOTE_KEY);
        if (!stored) {
          const key = await generateEncryptionKey();
          stored = await exportKey(key);
          localStorage.setItem(STORAGE_KEYS.NOTE_KEY, stored);
          setEncryptionKey(key);
        } else {
          setEncryptionKey(await importKey(stored));
        }

        await reloadNotes();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const normalizeNotes = list =>
    list.map(n => ({ ...n, tags: Array.isArray(n.tags) ? n.tags : JSON.parse(n.tags || "[]") }));

  const reloadNotes = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/notes");
      const raw = res?.data || res || [];
      setNotes(normalizeNotes(raw));
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- CREATE NOTE ----------------
  const createNote = async (title: string, content: string, tags: string[] = []) => {
    if (!encryptionKey) throw new Error("Encryption key missing");

    const enc = await encryptData(content, encryptionKey);
    const tempId = generateId();

    const optimistic: EncryptedNote = {
      id: tempId,
      title,
      encryptedContent: enc.encrypted,
      iv: enc.iv,
      createdBy: user?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags,
    };

    setNotes(prev => [...prev, optimistic]);
    addActivityLog("note_create", `Created note: ${title}`);

    try {
      const res = await apiFetch("/notes", {
        method: "POST",
        body: JSON.stringify({
          title,
          encryptedContent: enc.encrypted,
          iv: enc.iv,
          tags: JSON.stringify(tags),
        }),
      });

      const saved = res?.data || res;
      if (saved?.id) {
        const normalized = normalizeNotes([saved])[0];
        setNotes(prev => prev.map(n => (n.id === tempId ? normalized : n)));
        return normalized;
      }
    } catch {}

    return optimistic;
  };

  const getNote = id => notes.find(n => String(n.id) === String(id));

  const getUserNotes = () => notes.filter(n => String(n.createdBy) === String(user?.id));

  // ---------------- UPDATE NOTE ----------------
  const updateNote = async (id: string, updates: any) => {
    if (!encryptionKey) throw new Error("Encryption key missing");

    const updatedList = await Promise.all(
      notes.map(async n => {
        if (String(n.id) !== String(id)) return n;

        let encryptedContent = n.encryptedContent;
        let iv = n.iv;

        if (updates.content) {
          const enc = await encryptData(updates.content, encryptionKey);
          encryptedContent = enc.encrypted;
          iv = enc.iv;
        }

        return {
          ...n,
          title: updates.title ?? n.title,
          encryptedContent,
          iv,
          tags: updates.tags ?? n.tags,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    setNotes(updatedList);

    const saved = updatedList.find(n => String(n.id) === String(id));

    await apiFetch(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...saved,
        tags: JSON.stringify(saved.tags),
      }),
    });
  };

  // ---------------- DELETE NOTE ----------------
  const deleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => String(n.id) !== String(id)));

    try {
      const r = await apiFetch(`/notes/${id}`, { method: "DELETE" });
      return Boolean(r?.success || r?.ok);
    } catch {
      return false;
    }
  };

  const decryptNoteContent = async (note: EncryptedNote) => {
    if (!encryptionKey) return "[Key missing]";
    try {
      return await decryptData(note.encryptedContent, note.iv, encryptionKey);
    } catch {
      return "[Decryption failed]";
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        isLoading,
        createNote,
        getNote,
        getUserNotes,
        updateNote,
        deleteNote,
        decryptNoteContent,
        reloadNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used inside NotesProvider");
  return ctx;
}
