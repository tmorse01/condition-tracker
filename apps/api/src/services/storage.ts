import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { readStorageObject } from "@condition-tracker/db";

const storageRoot = process.env.STORAGE_ROOT_PATH ?? path.resolve(process.cwd(), ".storage");
const storageBucket = process.env.STORAGE_BUCKET_NAME ?? "condition-tracker-dev";
const tempTokens = new Map<string, { storageKey: string; expiresAt: number }>();

export interface StorageService {
  uploadFile(input: { storageKey: string; bytes: Uint8Array; contentType: string; fileName: string }): Promise<{ storageKey: string }>;
  getDownloadUrl(storageKey: string): Promise<string>;
  deleteFile(storageKey: string): Promise<void>;
  readFile(storageKey: string): Promise<{ bytes: Uint8Array; contentType: string; fileName: string } | null>;
}

const objectPath = (storageKey: string) => path.join(storageRoot, storageBucket, ...storageKey.split("/"));

export const storageService: StorageService = {
  async uploadFile(input) {
    const filePath = objectPath(input.storageKey);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, input.bytes);
    return { storageKey: input.storageKey };
  },
  async getDownloadUrl(storageKey) {
    const token = randomUUID();
    tempTokens.set(token, { storageKey, expiresAt: Date.now() + 5 * 60 * 1000 });
    return `/api/storage/download/${encodeURIComponent(token)}`;
  },
  async deleteFile(storageKey) {
    await rm(objectPath(storageKey), { force: true });
  },
  async readFile(storageKey) {
    const bytes = await readStorageObject(storageKey);
    if (!bytes) return null;
    const fileName = storageKey.split("/").at(-1) ?? "document.pdf";
    return { bytes, contentType: "application/pdf", fileName };
  },
};

export const seedDemoDocumentStorage = async (
  versions: Array<{ storageKey: string; contentType: string; fileName: string; documentId: string }>,
) => {
  for (const version of versions) {
    if (version.contentType !== "application/pdf") continue;
    const filePath = objectPath(version.storageKey);
    try {
      await mkdir(path.dirname(filePath), { recursive: true });
      const bytes = await readStorageObject(version.storageKey);
      if (bytes) continue;
      const pdf = Buffer.from(`%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 0 >>\nstream\n\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n0\n%%EOF`, "ascii");
      await writeFile(filePath, pdf);
    } catch {
      // ignore seed storage failures so DB bootstrap can still complete
    }
  }
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
