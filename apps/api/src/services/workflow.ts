import { data } from "../data.js";

const clone = <T,>(value: T): T => structuredClone(value);

export const getLoans = () => clone(data.loans);

export const getLoanBundle = (loanId: string) => {
  const loan = data.loans.find((item) => item.id === loanId);
  if (!loan) return null;

  const conditions = data.conditions.filter((item) => item.loanId === loanId);
  const documents = data.documents.filter((item) => item.loanId === loanId);
  const documentVersions = data.documentVersions.filter((item) => documents.some((document) => document.id === item.documentId));
  const conditionDocuments = data.conditionDocuments.filter((item) => conditions.some((condition) => condition.id === item.conditionId));
  const auditLog = data.auditLog.filter((item) => item.loanId === loanId);
  const notifications = data.notifications;

  return clone({ loan, conditions, documents, documentVersions, conditionDocuments, auditLog, notifications });
};

export const getConditions = (loanId: string) => clone(data.conditions.filter((item) => item.loanId === loanId));
export const getDocuments = (loanId: string) => clone(data.documents.filter((item) => item.loanId === loanId));
export const getDocument = (documentId: string) => clone(data.documents.find((item) => item.id === documentId) ?? null);
export const getDocumentVersion = (versionId: string) =>
  clone(data.documentVersions.find((item) => item.id === versionId) ?? null);
export const getDocumentVersions = (documentId: string) =>
  clone(data.documentVersions.filter((item) => item.documentId === documentId).sort((a, b) => b.versionNumber - a.versionNumber));
export const getAuditLogForLoan = (loanId: string) => clone(data.auditLog.filter((item) => item.loanId === loanId));
export const getAuditLogForDocument = (documentId: string) => clone(data.auditLog.filter((item) => item.documentId === documentId));
export const getSession = (sessionId: string) => clone(data.uploadSessions.find((item) => item.id === sessionId) ?? null);

export const validateSession = (sessionId: string) => {
  const session = data.uploadSessions.find((item) => item.id === sessionId);
  const now = Date.now();
  const valid = Boolean(session) && session?.status === "Active" && new Date(session.expiresAt).getTime() > now;
  return { session: clone(session ?? null), valid };
};

export const validateUploadPayload = (sessionId: string, conditionId: string) => {
  const session = data.uploadSessions.find((item) => item.id === sessionId);
  if (!session) return { ok: false as const, status: 404, message: "Upload session not found" };
  if (session.status !== "Active") return { ok: false as const, status: 400, message: "Upload session is not active" };
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    return { ok: false as const, status: 400, message: "Upload session expired" };
  }

  const condition = data.conditions.find((item) => item.id === conditionId && item.loanId === session.loanId);
  if (!condition) return { ok: false as const, status: 400, message: "Condition does not belong to this loan" };

  return { ok: true as const, session: clone(session), condition: clone(condition) };
};
