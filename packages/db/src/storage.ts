import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const resolveStorageRoot = () => {
  const root = process.env.STORAGE_ROOT_PATH ?? path.resolve(process.cwd(), ".storage");
  const bucket = process.env.STORAGE_BUCKET_NAME ?? "condition-tracker-dev";
  return path.join(root, bucket);
};

export const resolveStorageObjectPath = (storageKey: string) =>
  path.join(resolveStorageRoot(), ...storageKey.split("/"));

export const persistStorageObject = async (storageKey: string, bytes: Uint8Array) => {
  const objectPath = resolveStorageObjectPath(storageKey);
  await mkdir(path.dirname(objectPath), { recursive: true });
  await writeFile(objectPath, bytes);
};

export const readStorageObject = async (storageKey: string) => {
  const objectPath = resolveStorageObjectPath(storageKey);
  try {
    return await readFile(objectPath);
  } catch {
    return null;
  }
};

export const deleteStorageObject = async (storageKey: string) => {
  const objectPath = resolveStorageObjectPath(storageKey);
  await rm(objectPath, { force: true });
};
