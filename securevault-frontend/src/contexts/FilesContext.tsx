// src/contexts/FilesContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { EncryptedFile } from "@/types";
import { useAuth } from "./AuthContext";
import { apiFetch } from "@/lib/api";
import {
  generateEncryptionKey,
  exportKey,
  encryptFile,
  arrayBufferToBase64,
} from "@/lib/crypto";

/* ----------------------------------------------------------
   TYPES
---------------------------------------------------------- */
interface CreateSharePayload {
  fileId: number | string;
  expiresInHours: number;
  maxOpens?: number | null;
  password?: string | null;
}

interface ShareResponse {
  id: number;
  token: string;
  fileId: number;
  createdAt: string;
  expiresAt: string;
  maxOpens: number | null;
}

interface FilesContextType {
  files: EncryptedFile[];
  isLoading: boolean;

  uploadFile: (
    file: File,
    teamId?: number | null,
    onProgress?: (percent: number) => void
  ) => Promise<EncryptedFile>;

  deleteFile: (id: number) => Promise<boolean>;

  getUserFiles: () => EncryptedFile[];
  getFile: (id: string | number) => EncryptedFile | undefined;
  reloadFiles: () => Promise<void>;

  createShareLink: (payload: CreateSharePayload) => Promise<ShareResponse>;
  openSharedFile: (token: string, password?: string) => Promise<any>;
  getFileVersions: (id: string | number) => Promise<any[]>;

  getFilesByTeam: (teamId: number) => Promise<EncryptedFile[]>;
  getCachedTeamFiles: (teamId: number) => EncryptedFile[];
}

const FilesContext = createContext<FilesContextType | undefined>(undefined);

/* ----------------------------------------------------------
   PROVIDER
---------------------------------------------------------- */
export function FilesProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<EncryptedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { addActivityLog } = useAuth();

  useEffect(() => {
    loadFiles();
  }, []);

  /* ----------------------------------------------------------
     LOAD ALL USER FILES
  ---------------------------------------------------------- */
  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/files");
      const list = res?.data || res || [];
      setFiles(Array.isArray(list) ? list : []);
    } catch {
      setFiles([]);
    }
    setIsLoading(false);
  };

  /* ----------------------------------------------------------
     UPLOAD FILE
  ---------------------------------------------------------- */
  const uploadFile = async (
    file: File,
    teamId: number | null = null,
    onProgress?: (percent: number) => void
  ): Promise<EncryptedFile> => {
    const key = await generateEncryptionKey();
    const exportedKey = await exportKey(key);

    const { encrypted, iv } = await encryptFile(file, key);
    const encryptedBase64 = arrayBufferToBase64(encrypted);

    const body = {
      name: file.name,
      size: file.size,
      type: file.type,
      encryptedData: encryptedBase64,
      iv,
      encryptionKey: exportedKey,
    };

    const endpoint = teamId ? `/files/upload?teamId=${teamId}` : `/files/upload`;

    const saved = await apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const newFile = saved?.data || saved;

    setFiles((prev) => [...prev, newFile]);

    addActivityLog("file_upload", `Uploaded file: ${file.name}${teamId ? " to team " + teamId : ""}`);

    return newFile;
  };

  /* ----------------------------------------------------------
     DELETE FILE
  ---------------------------------------------------------- */
  const deleteFile = async (id: number) => {
    const res = await apiFetch(`/files/${id}`, { method: "DELETE" });

    if (res?.success || res?.ok) {
      setFiles((prev) => prev.filter((f) => Number(f.id) !== Number(id)));
      addActivityLog("file_delete", `Deleted file ID ${id}`);
      return true;
    }
    return false;
  };

  /* ----------------------------------------------------------
     GETTERS & HELPERS
  ---------------------------------------------------------- */
  const getUserFiles = () => files;

  const getFile = (id: string | number) =>
    files.find((f) => String(f.id) === String(id));

  const reloadFiles = async () => loadFiles();

  /* ----------------------------------------------------------
     SHARING
  ---------------------------------------------------------- */
  const createShareLink = async (payload: CreateSharePayload): Promise<ShareResponse> => {
    const res = await apiFetch("/share/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return res?.data || res;
  };

  const openSharedFile = async (token: string, password?: string) => {
    const url = password ? `/share/${token}?password=${password}` : `/share/${token}`;
    const res = await apiFetch(url);
    return res?.data || res;
  };

  const getFileVersions = async () => [
    {
      id: "v1",
      version: 1,
      size: 1024,
      uploadedAt: new Date().toISOString(),
    },
  ];

  /* ----------------------------------------------------------
     TEAM FILES (FETCH FROM BACKEND)
  ---------------------------------------------------------- */
  const getFilesByTeam = async (teamId: number) => {
    const r = await apiFetch(`/files?teamId=${teamId}`);
    const list = r?.data || r || [];
    return Array.isArray(list) ? list : [];
  };

  /* ----------------------------------------------------------
     TEAM FILES (LOCAL CACHE)
  ---------------------------------------------------------- */
  const getCachedTeamFiles = (teamId: number) => {
    return files.filter((f) => Number(f.teamId) === Number(teamId));
  };

  /* ----------------------------------------------------------
     CONTEXT VALUE
  ---------------------------------------------------------- */
  return (
    <FilesContext.Provider
      value={{
        files,
        isLoading,
        uploadFile,
        deleteFile,
        getUserFiles,
        getFile,
        reloadFiles,
        createShareLink,
        openSharedFile,
        getFileVersions,
        getFilesByTeam,
        getCachedTeamFiles,
      }}
    >
      {children}
    </FilesContext.Provider>
  );
}

export function useFiles() {
  const ctx = useContext(FilesContext);
  if (!ctx) throw new Error("useFiles must be used inside FilesProvider");
  return ctx;
}
