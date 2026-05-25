import type {
  AuditLogEntry,
  Condition,
  Document,
  DocumentVersion,
  Loan,
  Notification,
  UploadSession,
} from "@condition-tracker/shared";

export type { AuditLogEntry, Condition, Document, DocumentVersion, Loan, Notification, UploadSession };

export interface DatabaseSchema {
  loans: Loan[];
  conditions: Condition[];
  documents: Document[];
  documentVersions: DocumentVersion[];
  uploadSessions: UploadSession[];
  auditLog: AuditLogEntry[];
  notifications: Notification[];
}

export const storageKeyForVersion = (loanId: string, documentId: string, versionId: string, fileName: string) =>
  `loans/${loanId}/documents/${documentId}/versions/${versionId}/${fileName}`;
