import { randomUUID } from "node:crypto";

const storage = new Map<string, { bytes: Uint8Array; contentType: string; fileName: string; createdAt: string }>();

const now = () => new Date().toISOString();

export interface StorageService {
  uploadFile(input: { storageKey: string; bytes: Uint8Array; contentType: string; fileName: string }): Promise<{ storageKey: string }>;
  getDownloadUrl(storageKey: string): Promise<string>;
  deleteFile(storageKey: string): Promise<void>;
  readFile(storageKey: string): Promise<{ bytes: Uint8Array; contentType: string; fileName: string } | null>;
}

const tempTokens = new Map<string, { storageKey: string; expiresAt: number }>();

export const storageService: StorageService = {
  async uploadFile(input) {
    storage.set(input.storageKey, { bytes: input.bytes, contentType: input.contentType, fileName: input.fileName, createdAt: now() });
    return { storageKey: input.storageKey };
  },
  async getDownloadUrl(storageKey) {
    const token = randomUUID();
    tempTokens.set(token, { storageKey, expiresAt: Date.now() + 5 * 60 * 1000 });
    return `/api/storage/download/${encodeURIComponent(token)}`;
  },
  async deleteFile(storageKey) {
    storage.delete(storageKey);
  },
  async readFile(storageKey) {
    const file = storage.get(storageKey);
    if (!file) return null;
    return { bytes: file.bytes, contentType: file.contentType, fileName: file.fileName };
  },
};

export const resolveTemporaryDownload = (token: string) => {
  const entry = tempTokens.get(token);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    tempTokens.delete(token);
    return null;
  }
  return entry.storageKey;
};

