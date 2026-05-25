import type { Condition, Loan, DocumentVersion } from "@condition-tracker/shared";

export type { Condition, Loan, DocumentVersion };

export interface UploadSession {
  id: string;
  loanId: string;
  tokenHash: string;
  status: "Active" | "Expired" | "Revoked" | "Used";
  expiresAt: string;
  createdAt: string;
  usedAt: string | null;
  revokedAt: string | null;
}
