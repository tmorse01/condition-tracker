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
    "(ConditionFlow document preview) Tj",
    "0 -24 Td",
    `(${escapePdfText(fileName)}) Tj`,
    "0 -36 Td",
    "(Prepared for internal review) Tj",
    "ET",
  ].join("\n");

  const objectBodies = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  const chunks = [Buffer.from("%PDF-1.4\n", "ascii")];
  const offsets = [0];
  for (let index = 0; index < objectBodies.length; index += 1) {
    const header = Buffer.from(`${index + 1} 0 obj\n`, "ascii");
    const body = Buffer.from(`${objectBodies[index]}\nendobj\n`, "ascii");
    offsets.push(Buffer.concat(chunks).byteLength);
    chunks.push(header, body);
  }
  const xrefOffset = Buffer.concat(chunks).byteLength;
  const xrefParts = [
    Buffer.from(`xref\n0 ${objectBodies.length + 1}\n0000000000 65535 f \n`, "ascii"),
    ...offsets.slice(1).map((offset) => Buffer.from(`${String(offset).padStart(10, "0")} 00000 n \n`, "ascii")),
    Buffer.from(`trailer\n<< /Size ${objectBodies.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`, "ascii"),
  ];
  return Buffer.concat([...chunks, ...xrefParts]);
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
