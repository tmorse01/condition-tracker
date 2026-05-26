import "../load-env.js";
import { createHash } from "node:crypto";
import { createKyselyClient } from "../client/create-kysely-client.js";
import { persistStorageObject } from "../storage.js";
import {
  demoAuditLog,
  demoConditions,
  demoConditionDocuments,
  demoDocuments,
  demoLoans,
  demoNotifications,
  demoUploadSessions,
  demoVersions,
} from "./demo-fixtures.js";

const getDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  return databaseUrl;
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const createDemoPdf = (title: string, fileName: string) => {
  const content = [
    "BT",
    "/F1 22 Tf",
    "72 716 Td",
    `(${title.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)")}) Tj`,
    "0 -34 Td",
    "/F1 12 Tf",
    "(ConditionFlow document preview) Tj",
    "0 -24 Td",
    `(${fileName.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)")}) Tj`,
    "0 -36 Td",
    "(Prepared for internal review) Tj",
    "ET",
  ].join("\n");
  return Buffer.from(`%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n0\n%%EOF`, "ascii");
};

const main = async () => {
  const { db, pool } = createKyselyClient({ databaseUrl: getDatabaseUrl() });
  try {
    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom("Notification").execute();
      await trx.deleteFrom("AuditLog").execute();
      await trx.deleteFrom("UploadSession").execute();
      await trx.deleteFrom("ConditionDocument").execute();
      await trx.deleteFrom("DocumentVersion").execute();
      await trx.deleteFrom("Document").execute();
      await trx.deleteFrom("Condition").execute();
      await trx.deleteFrom("Loan").execute();

      await trx.insertInto("Loan").values(demoLoans).execute();
      await trx.insertInto("Condition").values(demoConditions).execute();
      await trx.insertInto("Document").values(demoDocuments).execute();
      await trx.insertInto("DocumentVersion").values(demoVersions).execute();
      await trx.insertInto("ConditionDocument").values(demoConditionDocuments).execute();
      await trx.insertInto("UploadSession").values(demoUploadSessions).execute();
      await trx.insertInto("AuditLog").values(demoAuditLog).execute();
      await trx.insertInto("Notification").values(demoNotifications).execute();
    });

    for (const version of demoVersions) {
      if (version.contentType !== "application/pdf") continue;
      await persistStorageObject(version.storageKey, createDemoPdf(`Document ${version.documentId}`, version.fileName));
    }

    console.log(
      `Seeded ${demoLoans.length} loans, ${demoConditions.length} conditions, ${demoDocuments.length} documents, ${demoVersions.length} versions.`,
    );
  } finally {
    await pool.end();
  }
};

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
