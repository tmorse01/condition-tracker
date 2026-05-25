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
import type { AuditLogEntry, Condition, ConditionDocument, Document, DocumentVersion, Loan, Notification, UploadSession } from "@condition-tracker/shared";

export type DemoState = {
  loans: Loan[];
  conditions: Condition[];
  documents: Document[];
  conditionDocuments: ConditionDocument[];
  documentVersions: DocumentVersion[];
  uploadSessions: UploadSession[];
  auditLog: AuditLogEntry[];
  notifications: Notification[];
};

export const state: DemoState = structuredClone({
  loans: demoLoans,
  conditions: demoConditions,
  documents: demoDocuments,
  conditionDocuments: demoConditionDocuments,
  documentVersions: demoVersions,
  uploadSessions: demoUploadSessions,
  auditLog: demoAuditLog,
  notifications: demoNotifications,
});
