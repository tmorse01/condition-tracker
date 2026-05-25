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

const escapePdfText = (value: string) => value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");

const createDemoPdf = (title: string, fileName: string) => {
  const content = [
    "BT",
    "/F1 22 Tf",
    "72 716 Td",
    `(${escapePdfText(title)}) Tj`,
    "0 -34 Td",
    "/F1 12 Tf",
    `(ConditionFlow document preview) Tj`,
    "0 -24 Td",
    `(${escapePdfText(fileName)}) Tj`,
    "0 -36 Td",
    "(Prepared for internal review) Tj",
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let result = "%PDF-1.4\n";
  const offsets: number[] = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(result, "ascii"));
    result += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(result, "ascii");
  result += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    result += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  result += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(result);
};

export const seedDemoDocumentStorage = async (
  versions: Array<{ storageKey: string; contentType: string; fileName: string; documentId: string }>,
) => {
  for (const version of versions) {
    if (storage.has(version.storageKey) || version.contentType !== "application/pdf") continue;
    await storageService.uploadFile({
      storageKey: version.storageKey,
      bytes: createDemoPdf(`Document ${version.documentId}`, version.fileName),
      contentType: version.contentType,
      fileName: version.fileName,
    });
  }
};
