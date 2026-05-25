import type {
  AuditLogEntry,
  Condition,
  ConditionDocument,
  Document,
  DocumentVersion,
  Loan,
  Notification,
  UploadSession,
} from "@condition-tracker/shared";
import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface LoanTable {
  id: Generated<string>;
  loanNumber: string;
  borrowerName: string;
  propertyAddress: string;
  status: Loan["status"];
  createdAt: Generated<string>;
  updatedAt: string;
}

export type LoanRow = Selectable<LoanTable>;
export type NewLoanRow = Insertable<LoanTable>;
export type UpdateLoanRow = Updateable<LoanTable>;

export interface ConditionTable {
  id: Generated<string>;
  loanId: string;
  title: string;
  description: string;
  status: Condition["status"];
  dueDate: string | null;
  createdAt: Generated<string>;
  updatedAt: string;
}

export type ConditionRow = Selectable<ConditionTable>;
export type NewConditionRow = Insertable<ConditionTable>;
export type UpdateConditionRow = Updateable<ConditionTable>;

export interface DocumentTable {
  id: Generated<string>;
  loanId: string;
  title: string;
  documentType: string;
  currentVersionId: string | null;
  createdAt: Generated<string>;
  updatedAt: string;
}

export type DocumentRow = Selectable<DocumentTable>;
export type NewDocumentRow = Insertable<DocumentTable>;
export type UpdateDocumentRow = Updateable<DocumentTable>;

export interface DocumentVersionTable {
  id: Generated<string>;
  documentId: string;
  versionNumber: number;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  storageKey: string;
  uploadStatus: DocumentVersion["uploadStatus"];
  reviewStatus: DocumentVersion["reviewStatus"];
  reviewNotes: string | null;
  uploadedBy: string;
  uploadedAt: Generated<string>;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

export type DocumentVersionRow = Selectable<DocumentVersionTable>;
export type NewDocumentVersionRow = Insertable<DocumentVersionTable>;
export type UpdateDocumentVersionRow = Updateable<DocumentVersionTable>;

export interface ConditionDocumentTable {
  id: Generated<string>;
  conditionId: string;
  documentId: string;
  documentVersionId: string;
  status: ConditionDocument["status"];
  createdAt: Generated<string>;
}

export type ConditionDocumentRow = Selectable<ConditionDocumentTable>;
export type NewConditionDocumentRow = Insertable<ConditionDocumentTable>;
export type UpdateConditionDocumentRow = Updateable<ConditionDocumentTable>;

export interface UploadSessionTable {
  id: Generated<string>;
  loanId: string;
  tokenHash: string;
  status: UploadSession["status"];
  expiresAt: string;
  createdAt: Generated<string>;
  usedAt: string | null;
  revokedAt: string | null;
}

export type UploadSessionRow = Selectable<UploadSessionTable>;
export type NewUploadSessionRow = Insertable<UploadSessionTable>;
export type UpdateUploadSessionRow = Updateable<UploadSessionTable>;

export interface AuditLogTable {
  id: Generated<string>;
  loanId: string | null;
  conditionId: string | null;
  documentId: string | null;
  documentVersionId: string | null;
  actorType: AuditLogEntry["actorType"];
  actorName: string;
  action: string;
  message: string;
  metadataJson: string;
  createdAt: Generated<string>;
}

export type AuditLogRow = Selectable<AuditLogTable>;
export type NewAuditLogRow = Insertable<AuditLogTable>;
export type UpdateAuditLogRow = Updateable<AuditLogTable>;

export interface NotificationTable {
  id: Generated<string>;
  recipient: string;
  templateKey: string;
  status: Notification["status"];
  payloadJson: string;
  attemptCount: number;
  createdAt: Generated<string>;
  sentAt: string | null;
}

export type NotificationRow = Selectable<NotificationTable>;
export type NewNotificationRow = Insertable<NotificationTable>;
export type UpdateNotificationRow = Updateable<NotificationTable>;

export interface Database {
  Loan: LoanTable;
  Condition: ConditionTable;
  Document: DocumentTable;
  DocumentVersion: DocumentVersionTable;
  ConditionDocument: ConditionDocumentTable;
  UploadSession: UploadSessionTable;
  AuditLog: AuditLogTable;
  Notification: NotificationTable;
}

export type DbTableName = keyof Database;
