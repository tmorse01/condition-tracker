import type { AuditLogEntry, Document, DocumentVersion } from "@condition-tracker/shared";
import { state } from "../data.js";
import { storageService } from "./storage.js";
import { enqueueNotification } from "./jobs.js";

const now = () => new Date().toISOString();

const newId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const pushAudit = (entry: Omit<AuditLogEntry, "id" | "createdAt">) => {
  state.auditLog.unshift({ id: newId("audit"), createdAt: now(), ...entry });
};

export const getLoans = () => structuredClone(state.loans);

export const getLoanBundle = (loanId: string) => {
  const loan = state.loans.find((item) => item.id === loanId);
  if (!loan) return null;
  return structuredClone({
    loan,
    conditions: state.conditions.filter((item) => item.loanId === loanId),
    documents: state.documents.filter((item) => item.loanId === loanId),
    documentVersions: state.documentVersions.filter((item) =>
      state.documents.some((document) => document.id === item.documentId && document.loanId === loanId),
    ),
    conditionDocuments: state.conditionDocuments.filter((item) =>
      state.conditions.some((condition) => condition.id === item.conditionId && condition.loanId === loanId),
    ),
    auditLog: state.auditLog.filter((item) => item.loanId === loanId),
    notifications: state.notifications,
  });
};

export const getConditions = (loanId: string) => structuredClone(state.conditions.filter((item) => item.loanId === loanId));
export const getDocuments = (loanId: string) => structuredClone(state.documents.filter((item) => item.loanId === loanId));
export const getDocument = (documentId: string) => structuredClone(state.documents.find((item) => item.id === documentId) ?? null);
export const getDocumentVersion = (versionId: string) =>
  structuredClone(state.documentVersions.find((item) => item.id === versionId) ?? null);
export const getDocumentVersions = (documentId: string) =>
  structuredClone(state.documentVersions.filter((item) => item.documentId === documentId).sort((a, b) => b.versionNumber - a.versionNumber));
export const getAuditLogForLoan = (loanId: string) => structuredClone(state.auditLog.filter((item) => item.loanId === loanId));
export const getAuditLogForDocument = (documentId: string) => structuredClone(state.auditLog.filter((item) => item.documentId === documentId));
export const getSession = (sessionId: string) => structuredClone(state.uploadSessions.find((item) => item.id === sessionId) ?? null);

export const getConditionDetail = (conditionId: string) => {
  const condition = state.conditions.find((item) => item.id === conditionId);
  if (!condition) return null;
  const loan = state.loans.find((item) => item.id === condition.loanId) ?? null;
  const conditionLinks = state.conditionDocuments.filter((item) => item.conditionId === conditionId);
  const documents = state.documents
    .filter((item) => conditionLinks.some((link) => link.documentId === item.id))
    .map((document) => {
      const versions = state.documentVersions
        .filter((version) => version.documentId === document.id)
        .sort((a, b) => b.versionNumber - a.versionNumber);
      return {
        ...document,
        versions,
        latestVersion: versions[0] ?? null,
      };
    });
  const latestDocument = documents[0] ?? null;
  const latestVersion = latestDocument?.latestVersion ?? null;

  return structuredClone({
    condition,
    loan,
    latestDocument,
    latestVersion,
    documents,
    versionHistory: latestDocument?.versions ?? [],
    notifications: state.notifications.filter((item) => item.payloadJson.includes(`"${conditionId}"`)),
    auditLog: state.auditLog.filter((item) => item.conditionId === conditionId || item.documentVersionId === latestVersion?.id),
  });
};

export const validateSession = (sessionId: string, token?: string) => {
  const session = state.uploadSessions.find((item) => item.id === sessionId);
  if (!session) return { session: null, valid: false, reason: "Invalid Link" as const };
  if (token && session.tokenHash !== token) return { session: structuredClone(session), valid: false, reason: "Invalid Link" as const };
  if (session.status === "Revoked") return { session: structuredClone(session), valid: false, reason: "Revoked Link" as const };
  if (session.status === "Used") return { session: structuredClone(session), valid: false, reason: "Upload Complete" as const };
  if (new Date(session.expiresAt).getTime() <= Date.now()) return { session: structuredClone(session), valid: false, reason: "Expired Link" as const };
  return { session: structuredClone(session), valid: true, reason: "Ready" as const };
};

export const validateUploadPayload = (sessionId: string, conditionId: string, token: string) => {
  const session = state.uploadSessions.find((item) => item.id === sessionId);
  if (!session) return { ok: false as const, status: 404, message: "Upload session not found" };
  if (session.tokenHash !== token) return { ok: false as const, status: 401, message: "Invalid token" };
  if (session.status === "Revoked") return { ok: false as const, status: 400, message: "Upload session revoked" };
  if (session.status === "Used") return { ok: false as const, status: 400, message: "Upload session already used" };
  if (new Date(session.expiresAt).getTime() <= Date.now()) return { ok: false as const, status: 400, message: "Upload session expired" };

  const condition = state.conditions.find((item) => item.id === conditionId && item.loanId === session.loanId);
  if (!condition) return { ok: false as const, status: 400, message: "Condition does not belong to this loan" };

  return { ok: true as const, session, condition };
};

export const uploadDocument = (params: {
  sessionId: string;
  token: string;
  conditionId: string;
  title: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedBy: string;
}) => {
  const validation = validateUploadPayload(params.sessionId, params.conditionId, params.token);
  if (!validation.ok) return validation;

  const session = validation.session;
  const condition = validation.condition;
  const existingDocument = state.documents.find((item) => item.loanId === session.loanId && item.title.toLowerCase() === params.title.toLowerCase());
  const document: Document = existingDocument ?? {
    id: newId("doc"),
    loanId: session.loanId,
    title: params.title,
    documentType: "Borrower Upload",
    currentVersionId: null,
    createdAt: now(),
    updatedAt: now(),
  };

  if (!existingDocument) {
    state.documents.unshift(document);
  }

  const versionsForDocument = state.documentVersions.filter((item) => item.documentId === document.id);
  const nextVersionNumber = versionsForDocument.length + 1;
  const versionId = newId("ver");
  const version: DocumentVersion = {
    id: versionId,
    documentId: document.id,
    versionNumber: nextVersionNumber,
    fileName: params.fileName,
    contentType: params.contentType,
    fileSizeBytes: params.fileSizeBytes,
    storageKey: `loans/${session.loanId}/documents/${document.id}/versions/${versionId}/${params.fileName}`,
    uploadStatus: "Uploaded",
    reviewStatus: "Pending",
    reviewNotes: null,
    uploadedBy: params.uploadedBy,
    uploadedAt: now(),
    reviewedBy: null,
    reviewedAt: null,
  };

  void storageService.uploadFile({
    storageKey: version.storageKey,
    bytes: new TextEncoder().encode(params.fileName),
    contentType: params.contentType,
    fileName: params.fileName,
  });

  state.documentVersions.unshift(version);
  document.currentVersionId = version.id;
  document.updatedAt = now();
  const conditionRecord = state.conditions.find((item) => item.id === condition.id);
  if (conditionRecord) conditionRecord.status = "PendingReview";
  state.conditionDocuments.unshift({
    id: newId("cond_doc"),
    conditionId: condition.id,
    documentId: document.id,
    documentVersionId: version.id,
    status: "Linked",
    createdAt: now(),
  });
  state.uploadSessions.find((item) => item.id === session.id)!.status = "Used";
  state.uploadSessions.find((item) => item.id === session.id)!.usedAt = now();
  pushAudit({
    loanId: session.loanId,
    conditionId: condition.id,
    documentId: document.id,
    documentVersionId: version.id,
    actorType: "Borrower",
    actorName: "Borrower",
    action: "UploadReceived",
    message: `Uploaded ${params.fileName} for ${params.title}`,
    metadataJson: JSON.stringify({
      sessionId: session.id,
      fileName: params.fileName,
      fileSizeBytes: params.fileSizeBytes,
    }),
  });

  return {
    ok: true as const,
    session: structuredClone(session),
    condition: structuredClone(conditionRecord ?? condition),
    document: structuredClone(document),
    version: structuredClone(version),
  };
};

const reviewConditionVersion = (
  conditionId: string,
  outcome: "Approved" | "Rejected",
  notes: string | undefined,
  reviewerName = "Internal User",
) => {
  const condition = state.conditions.find((item) => item.id === conditionId);
  if (!condition) return { ok: false as const, status: 404, message: "Condition not found" };
  const link = state.conditionDocuments
    .filter((item) => item.conditionId === conditionId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (!link) return { ok: false as const, status: 404, message: "Condition is not linked to a document" };
  const version = state.documentVersions.find((item) => item.id === link.documentVersionId);
  if (!version) return { ok: false as const, status: 404, message: "Latest document version not found" };
  if (version.reviewStatus !== "Pending") return { ok: false as const, status: 400, message: "Version already reviewed" };
  if (outcome === "Rejected" && !notes?.trim()) return { ok: false as const, status: 400, message: "Rejection notes are required" };

  version.reviewStatus = outcome;
  version.reviewNotes = outcome === "Rejected" ? notes!.trim() : notes?.trim() ?? version.reviewNotes;
  version.reviewedBy = reviewerName;
  version.reviewedAt = now();

  condition.status = outcome === "Approved" ? "Satisfied" : "NeedsMoreInfo";
  condition.updatedAt = now();

  const document = state.documents.find((item) => item.id === version.documentId);
  if (!document) return { ok: false as const, status: 404, message: "Document not found" };
  document.updatedAt = now();
  document.currentVersionId = version.id;

  pushAudit({
    loanId: condition.loanId,
    conditionId,
    documentId: document.id,
    documentVersionId: version.id,
    actorType: "InternalUser",
    actorName: reviewerName,
    action: outcome === "Approved" ? "DocumentApproved" : "DocumentRejected",
    message: `${outcome} ${document.title}`,
    metadataJson: JSON.stringify({ versionId: version.id, outcome, notes: version.reviewNotes }),
  });

  enqueueNotification({
    recipient: "Borrower",
    templateKey: outcome === "Approved" ? "document-approved" : "document-rejected",
    payloadJson: JSON.stringify({
      conditionId,
      documentId: document.id,
      versionId: version.id,
      outcome,
      notes: version.reviewNotes,
    }),
  });

  return {
    ok: true as const,
    condition: structuredClone(condition),
    document: structuredClone(document),
    version: structuredClone(version),
  };
};

export const reviewVersion = (
  versionId: string,
  outcome: "Approved" | "Rejected",
  reviewerName = "Internal User",
  notes?: string,
) => {
  const version = state.documentVersions.find((item) => item.id === versionId);
  if (!version) return { ok: false as const, status: 404, message: "Document version not found" };
  const linkedCondition = state.conditionDocuments.find((item) => item.documentVersionId === version.id);
  if (!linkedCondition) return { ok: false as const, status: 404, message: "Condition link not found" };
  return reviewConditionVersion(linkedCondition.conditionId, outcome, notes, reviewerName);
};

export const reviewLatestConditionVersion = (conditionId: string, outcome: "Approved" | "Rejected", notes?: string, reviewerName = "Internal User") =>
  reviewConditionVersion(conditionId, outcome, notes, reviewerName);
