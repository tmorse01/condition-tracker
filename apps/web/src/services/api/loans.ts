import { requestJson } from "./client";
import type { DocumentDetail, LoanBundle } from "../../lib/api-types";
import type { Loan } from "@condition-tracker/shared";

export const getLoans = () => requestJson<Loan[]>("/api/loans");
export const getLoan = (loanId: string) => requestJson<LoanBundle>(`/api/loans/${loanId}`);
export const getLoanConditions = (loanId: string) => requestJson<LoanBundle["conditions"]>(`/api/loans/${loanId}/conditions`);
export const getLoanDocuments = (loanId: string) => requestJson<LoanBundle["documents"]>(`/api/loans/${loanId}/documents`);
export const getLoanAuditLog = (loanId: string) => requestJson<LoanBundle["auditLog"]>(`/api/loans/${loanId}/audit-log`);
export const getDocument = (documentId: string) => requestJson<DocumentDetail>(`/api/documents/${documentId}`);
