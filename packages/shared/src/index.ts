export type LoanStatus = "Active" | "Closed" | "OnHold";

export type ConditionStatus =
  | "PendingUpload"
  | "PendingReview"
  | "NeedsMoreInfo"
  | "Satisfied"
  | "Waived";

export type DocumentReviewStatus = "Pending" | "Approved" | "Rejected";
export type UploadSessionStatus = "Active" | "Expired" | "Revoked" | "Used";
export type NotificationStatus = "Pending" | "Sent" | "Failed";

export interface Loan {
  id: string;
  loanNumber: string;
  borrowerName: string;
  propertyAddress: string;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Condition {
  id: string;
  loanId: string;
  title: string;
  description: string;
  status: ConditionStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  loanId: string;
  title: string;
  documentType: string;
  currentVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  storageKey: string;
  uploadStatus: "Uploaded" | "Failed";
  reviewStatus: DocumentReviewStatus;
  reviewNotes: string | null;
  uploadedBy: string;
  uploadedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

export interface UploadSession {
  id: string;
  loanId: string;
  tokenHash: string;
  status: UploadSessionStatus;
  expiresAt: string;
  createdAt: string;
  usedAt: string | null;
  revokedAt: string | null;
}

export interface AuditLogEntry {
  id: string;
  loanId: string | null;
  conditionId: string | null;
  documentId: string | null;
  documentVersionId: string | null;
  actorType: "Borrower" | "InternalUser" | "System";
  actorName: string;
  action: string;
  message: string;
  metadataJson: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  recipient: string;
  templateKey: string;
  status: NotificationStatus;
  payloadJson: string;
  attemptCount: number;
  createdAt: string;
  sentAt: string | null;
}

export interface ApiResponse<T> {
  data: T;
}
