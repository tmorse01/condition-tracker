export type LoanStatus = "Active" | "Closed" | "OnHold";

export type ConditionStatus =
  | "PendingUpload"
  | "PendingReview"
  | "NeedsMoreInfo"
  | "Satisfied"
  | "Waived";

export type DocumentReviewStatus = "Pending" | "Approved" | "Rejected";

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
