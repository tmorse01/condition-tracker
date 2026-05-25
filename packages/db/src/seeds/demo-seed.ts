import {
  demoAuditLog,
  demoConditions,
  demoConditionDocuments,
  demoDocuments,
  demoLoans,
  demoNotifications,
  demoUploadSessions,
  demoVersions,
} from "@condition-tracker/shared/demo-data";
import type { DocumentVersion } from "@condition-tracker/shared";
import { storageKeyForVersion } from "../schema/storage-key.js";

export const demoSeed = {
  loans: demoLoans,
  conditions: demoConditions,
  documents: demoDocuments,
  conditionDocuments: demoConditionDocuments,
  documentVersions: demoVersions.map((version: DocumentVersion) => ({
    ...version,
    storageKey: storageKeyForVersion(
      "loan_1001",
      version.documentId,
      version.id,
      version.fileName,
    ),
  })),
  uploadSessions: demoUploadSessions,
  auditLog: demoAuditLog,
  notifications: demoNotifications,
};

console.log(
  `Seed prepared: ${demoSeed.loans.length} loans, ${demoSeed.conditions.length} conditions, ${demoSeed.documentVersions.length} versions, ${demoSeed.uploadSessions.length} upload sessions, ${demoSeed.auditLog.length} audit entries, ${demoSeed.notifications.length} notifications.`,
);
