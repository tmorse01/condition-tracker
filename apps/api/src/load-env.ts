import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const parseEnvLine = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const equalsIndex = trimmed.indexOf("=");
  if (equalsIndex === -1) return null;
  const key = trimmed.slice(0, equalsIndex).trim();
  const value = trimmed.slice(equalsIndex + 1).trim().replace(/^["']|["']$/g, "");
  if (!key || process.env[key] !== undefined) return null;
  return { key, value };
};

const loadEnvFile = (filePath: string) => {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const entry = parseEnvLine(line);
    if (entry) process.env[entry.key] = entry.value;
  }
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../");
loadEnvFile(path.join(root, ".env"));
