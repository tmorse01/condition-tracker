import {
  demoAuditLog,
  demoConditions,
  demoDocuments,
  demoLoans,
  demoNotifications,
  demoUploadSessions,
  demoVersions,
} from "@condition-tracker/shared/demo-data";

export const db = {
  loans: demoLoans,
  conditions: demoConditions,
  documents: demoDocuments,
  documentVersions: demoVersions,
  uploadSessions: demoUploadSessions,
  auditLog: demoAuditLog,
  notifications: demoNotifications,
};
