import type { AuditLogEntry, Condition, Document, DocumentVersion, Loan, UploadSession } from "@condition-tracker/shared";

export type ApiResponse<T> = {
  data: T;
};

export type LoanBundle = {
  loan: Loan;
  conditions: Condition[];
  documents: Document[];
  documentVersions: DocumentVersion[];
  conditionDocuments: Array<{
    id: string;
    conditionId: string;
    documentId: string;
    documentVersionId: string;
    status: string;
    createdAt: string;
  }>;
  auditLog: AuditLogEntry[];
  notifications: Array<{ id: string; templateKey: string; status: string; createdAt: string }>;
};

export type DocumentDetail = {
  document: Document;
  loan: Loan | null;
  versions: DocumentVersion[];
  auditLog: AuditLogEntry[];
  conditionLinks: Array<{
    id: string;
    conditionId: string;
    documentId: string;
    documentVersionId: string;
    status: string;
    createdAt: string;
  }>;
  associatedConditions: Condition[];
};

export type ConditionDetail = {
  condition: Condition;
  loan: Loan | null;
  latestDocument: Document | null;
  latestVersion: DocumentVersion | null;
  documents: Array<Document & { versions: DocumentVersion[]; latestVersion: DocumentVersion | null }>;
  versionHistory: DocumentVersion[];
  auditLog: AuditLogEntry[];
  notifications: Array<{ id: string; templateKey: string; status: string; createdAt: string }>;
};

export type UploadSessionValidationResponse = {
  sessionId: string;
  valid: boolean;
  reason?: string;
  session: Pick<UploadSession, "loanId" | "status"> | null;
};
