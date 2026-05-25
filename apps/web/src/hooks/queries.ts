import { useQuery } from "@tanstack/react-query";
import { getCondition } from "../services/api/conditions";
import { getDocument, getLoan, getLoans } from "../services/api/loans";
import { validateUploadSession } from "../services/api/upload-sessions";
import { queryKeys } from "./queryKeys";

export const useLoansQuery = () => useQuery({ queryKey: queryKeys.loans, queryFn: getLoans });
export const useLoanQuery = (loanId: string) => useQuery({ queryKey: queryKeys.loan(loanId), queryFn: () => getLoan(loanId), enabled: Boolean(loanId) });
export const useConditionQuery = (conditionId: string) =>
  useQuery({ queryKey: queryKeys.condition(conditionId), queryFn: () => getCondition(conditionId), enabled: Boolean(conditionId) });
export const useDocumentQuery = (documentId: string) =>
  useQuery({ queryKey: queryKeys.document(documentId), queryFn: () => getDocument(documentId), enabled: Boolean(documentId) });
export const useUploadSessionValidationQuery = (sessionId: string, token: string) =>
  useQuery({ queryKey: queryKeys.uploadSessionValidation(sessionId, token), queryFn: () => validateUploadSession(sessionId, token), enabled: Boolean(sessionId) });
