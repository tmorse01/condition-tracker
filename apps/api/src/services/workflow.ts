import { createHash, randomUUID, randomBytes } from "node:crypto";
import type { Document, DocumentVersion } from "@condition-tracker/shared";
import type { DbExecutor } from "@condition-tracker/db";
import { db } from "./db.js";
import { storageService } from "./storage.js";

const now = () => new Date().toISOString();
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const structured = <T>(value: T) => structuredClone(value);
const compareCreatedAtDesc = (left: { createdAt: string | Date }, right: { createdAt: string | Date }) =>
  new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();

const loanQuery = () => db.selectFrom("Loan").selectAll();
const conditionQuery = () => db.selectFrom("Condition").selectAll();
const documentQuery = () => db.selectFrom("Document").selectAll();
const versionQuery = () => db.selectFrom("DocumentVersion").selectAll();

const auditQuery = () => db.selectFrom("AuditLog").selectAll().orderBy("createdAt", "desc");

export const getLoans = async () => structured(await loanQuery().orderBy("loanNumber", "asc").execute());

export const getLoanBundle = async (loanId: string) => {
  const loan = await loanQuery().where("id", "=", loanId).executeTakeFirst();
  if (!loan) return null;
  const [conditions, documents, auditLog, notifications] = await Promise.all([
    conditionQuery().where("loanId", "=", loanId).execute(),
    documentQuery().where("loanId", "=", loanId).execute(),
    auditQuery().where("loanId", "=", loanId).execute(),
    db.selectFrom("Notification").selectAll().execute(),
  ]);
  const documentVersions = documents.length
    ? await versionQuery().where("documentId", "in", documents.map((item: { id: string }) => item.id)).execute()
    : [];
  const conditionDocuments = conditions.length
    ? await db.selectFrom("ConditionDocument").selectAll().where("conditionId", "in", conditions.map((item: { id: string }) => item.id)).execute()
    : [];

  return structured({ loan, conditions, documents, documentVersions, conditionDocuments, auditLog, notifications });
};

export const getConditions = async (loanId: string) => structured(await conditionQuery().where("loanId", "=", loanId).execute());
export const getDocuments = async (loanId: string) => structured(await documentQuery().where("loanId", "=", loanId).execute());
export const getDocument = async (documentId: string) => structured(await documentQuery().where("id", "=", documentId).executeTakeFirst() ?? null);
export const getDocumentVersion = async (versionId: string) => structured(await versionQuery().where("id", "=", versionId).executeTakeFirst() ?? null);
export const getDocumentVersions = async (documentId: string) => structured(await versionQuery().where("documentId", "=", documentId).orderBy("versionNumber", "desc").execute());
export const getAuditLogForLoan = async (loanId: string) => structured(await auditQuery().where("loanId", "=", loanId).execute());
export const getAuditLogForDocument = async (documentId: string) => structured(await auditQuery().where("documentId", "=", documentId).execute());
export const getSession = async (sessionId: string) => structured(await db.selectFrom("UploadSession").selectAll().where("id", "=", sessionId).executeTakeFirst() ?? null);
export const getEligibleUploadConditions = async (loanId: string) =>
  structured(await conditionQuery().where("loanId", "=", loanId).where("status", "in", ["PendingUpload", "NeedsMoreInfo"]).execute());

export const createUploadSession = async (loanId: string) => {
  const loan = await loanQuery().where("id", "=", loanId).executeTakeFirst();
  if (!loan) return null;
  const sessionId = randomUUID();
  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await db.transaction().execute(async (trx: DbExecutor) => {
    await trx.insertInto("UploadSession").values({
      id: sessionId,
      loanId,
      tokenHash: hashToken(token),
      status: "Active",
      expiresAt,
      createdAt: now(),
      usedAt: null,
      revokedAt: null,
    }).execute();
    await trx.insertInto("AuditLog").values({
      id: randomUUID(),
      loanId,
      conditionId: null,
      documentId: null,
      documentVersionId: null,
      actorType: "InternalUser",
      actorName: "Avery Reviewer",
      action: "UploadSessionCreated",
      message: `Created borrower upload link for ${loan.loanNumber}.`,
      metadataJson: JSON.stringify({ sessionId, expiresAt }),
      createdAt: now(),
    }).execute();
  });
  return { sessionId, token, uploadUrl: `/upload/${sessionId}?token=${encodeURIComponent(token)}`, expiresAt };
};

export const getDocumentDetail = async (documentId: string) => {
  const document = await getDocument(documentId);
  if (!document) return null;
  const [loan, versions, conditionLinks, auditLog] = await Promise.all([
    loanQuery().where("id", "=", document.loanId).executeTakeFirst(),
    getDocumentVersions(documentId),
    db.selectFrom("ConditionDocument").selectAll().where("documentId", "=", documentId).execute(),
    Promise.all([
      db.selectFrom("AuditLog").selectAll().where("documentId", "=", documentId).execute(),
      document.currentVersionId
        ? db.selectFrom("AuditLog").selectAll().where("documentVersionId", "=", document.currentVersionId).execute()
        : Promise.resolve([]),
    ]).then(([a, b]) => [...a, ...b].sort(compareCreatedAtDesc)),
  ]);
  const associatedConditions = conditionLinks.length
    ? await conditionQuery().where("id", "in", conditionLinks.map((item) => item.conditionId)).execute()
    : [];
  return structured({ document, loan: loan ?? null, versions, auditLog, conditionLinks, associatedConditions });
};

export const getConditionDetail = async (conditionId: string) => {
  const condition = await conditionQuery().where("id", "=", conditionId).executeTakeFirst();
  if (!condition) return null;
  const loan = await loanQuery().where("id", "=", condition.loanId).executeTakeFirst();
  const conditionLinks = await db.selectFrom("ConditionDocument").selectAll().where("conditionId", "=", conditionId).execute();
  const documents: Array<Document & { versions: DocumentVersion[]; latestVersion: DocumentVersion | null }> = [];
  for (const link of conditionLinks) {
    const document = await documentQuery().where("id", "=", link.documentId).executeTakeFirst();
    if (!document) continue;
    const versions = await getDocumentVersions(document.id);
    documents.push({ ...document, versions, latestVersion: versions[0] ?? null });
  }
  const latestDocument = documents[0] ?? null;
  const latestVersion = latestDocument?.latestVersion ?? null;
  const notifications = await db.selectFrom("Notification").selectAll().where("payloadJson", "like", `%${conditionId}%`).execute();
  const [byCondition, byVersion] = await Promise.all([
    db.selectFrom("AuditLog").selectAll().where("conditionId", "=", conditionId).execute(),
    latestVersion ? db.selectFrom("AuditLog").selectAll().where("documentVersionId", "=", latestVersion.id).execute() : Promise.resolve([]),
  ]);
  const auditLog = [...byCondition, ...byVersion].sort(compareCreatedAtDesc);
  return structured({ condition, loan: loan ?? null, latestDocument, latestVersion, documents, versionHistory: latestDocument?.versions ?? [], notifications, auditLog });
};

export const validateSession = async (sessionId: string, token?: string) => {
  const session = await getSession(sessionId);
  if (!session) return { session: null, valid: false, reason: "Invalid Link" as const };
  if (!token || session.tokenHash !== hashToken(token)) return { session, valid: false, reason: "Invalid Link" as const };
  if (session.status === "Revoked") return { session, valid: false, reason: "Revoked Link" as const };
  if (session.status === "Used") return { session, valid: false, reason: "Upload Complete" as const };
  if (new Date(session.expiresAt).getTime() <= Date.now()) return { session, valid: false, reason: "Expired Link" as const };
  return { session, valid: true, reason: "Ready" as const };
};

export const getUploadSessionContext = async (sessionId: string, token?: string) => {
  const result = await validateSession(sessionId, token);
  const session = result.session;
  if (!session || !token || session.tokenHash !== hashToken(token)) {
    return { valid: false, reason: "Invalid Link" as const, session: null, loan: null, eligibleConditions: [] };
  }
  const loan = await loanQuery().where("id", "=", session.loanId).executeTakeFirst();
  return {
    valid: result.valid,
    reason: result.reason,
    session: { id: session.id, loanId: session.loanId, status: session.status, expiresAt: session.expiresAt },
    loan: loan ?? null,
    eligibleConditions: await getEligibleUploadConditions(session.loanId),
  };
};

export const validateUploadPayload = async (sessionId: string, conditionId: string, token: string) => {
  const session = await getSession(sessionId);
  if (!session) return { ok: false as const, status: 404, message: "Upload session not found" };
  if (session.tokenHash !== hashToken(token)) return { ok: false as const, status: 401, message: "Invalid token" };
  if (session.status === "Revoked") return { ok: false as const, status: 400, message: "Upload session revoked" };
  if (session.status === "Used") return { ok: false as const, status: 400, message: "Upload session already used" };
  if (new Date(session.expiresAt).getTime() <= Date.now()) return { ok: false as const, status: 400, message: "Upload session expired" };
  const condition = await conditionQuery().where("id", "=", conditionId).where("loanId", "=", session.loanId).executeTakeFirst();
  if (!condition) return { ok: false as const, status: 400, message: "Condition does not belong to this loan" };
  if (condition.status !== "PendingUpload" && condition.status !== "NeedsMoreInfo") {
    return { ok: false as const, status: 400, message: "Condition is not accepting uploads" };
  }
  return { ok: true as const, session, condition };
};

export const uploadDocument = async (params: {
  sessionId: string;
  token: string;
  conditionId: string;
  title: string;
  fileName: string;
  contentType: string;
  fileBytes: Uint8Array;
  fileSizeBytes: number;
  uploadedBy: string;
}) => {
  const validation = await validateUploadPayload(params.sessionId, params.conditionId, params.token);
  if (!validation.ok) return validation;

  const session = validation.session;
  const condition = validation.condition;
  const existingDocument = await documentQuery().where("loanId", "=", session.loanId).where("title", "=", params.title).executeTakeFirst();
  const document: Document = existingDocument ?? {
    id: randomUUID(),
    loanId: session.loanId,
    title: params.title,
    documentType: "Borrower Upload",
    currentVersionId: null,
    createdAt: now(),
    updatedAt: now(),
  };
  const storageKey = `loans/${session.loanId}/documents/${document.id}/versions/${randomUUID()}/${params.fileName}`;
  await storageService.uploadFile({ storageKey, bytes: params.fileBytes, contentType: params.contentType, fileName: params.fileName });
  const version: DocumentVersion = {
    id: randomUUID(),
    documentId: document.id,
    versionNumber: (await versionQuery().where("documentId", "=", document.id).execute()).length + 1,
    fileName: params.fileName,
    contentType: params.contentType,
    fileSizeBytes: params.fileSizeBytes,
    storageKey,
    uploadStatus: "Uploaded",
    reviewStatus: "Pending",
    reviewNotes: null,
    uploadedBy: params.uploadedBy,
    uploadedAt: now(),
    reviewedBy: null,
    reviewedAt: null,
  };

  try {
    await db.transaction().execute(async (trx: DbExecutor) => {
      if (!existingDocument) {
        await trx.insertInto("Document").values(document).execute();
      } else {
        await trx.updateTable("Document").set({ currentVersionId: version.id, updatedAt: now() }).where("id", "=", document.id).execute();
      }
      await trx.insertInto("DocumentVersion").values(version).execute();
      await trx.insertInto("ConditionDocument").values({
        id: randomUUID(),
        conditionId: condition.id,
        documentId: document.id,
        documentVersionId: version.id,
        status: "Linked",
        createdAt: now(),
      }).execute();
      await trx.updateTable("Condition").set({ status: "PendingReview", updatedAt: now() }).where("id", "=", condition.id).execute();
      await trx.updateTable("UploadSession").set({ status: "Used", usedAt: now() }).where("id", "=", session.id).execute();
      await trx.insertInto("AuditLog").values({
        id: randomUUID(),
        loanId: session.loanId,
        conditionId: condition.id,
        documentId: document.id,
        documentVersionId: version.id,
        actorType: "Borrower",
        actorName: "Borrower",
        action: "UploadReceived",
        message: `Uploaded ${params.fileName} for ${params.title}`,
        metadataJson: JSON.stringify({ sessionId: session.id, fileName: params.fileName, fileSizeBytes: params.fileSizeBytes }),
        createdAt: now(),
      }).execute();
    });
  } catch (error) {
    await storageService.deleteFile(storageKey);
    throw error;
  }

  return { ok: true as const, session, condition: { ...condition, status: "PendingReview" as const }, document, version };
};

const reviewConditionVersion = async (conditionId: string, outcome: "Approved" | "Rejected", notes: string | undefined, reviewerName = "Internal User") => {
  const condition = await conditionQuery().where("id", "=", conditionId).executeTakeFirst();
  if (!condition) return { ok: false as const, status: 404, message: "Condition not found" };
  const link = await db.selectFrom("ConditionDocument").selectAll().where("conditionId", "=", conditionId).orderBy("createdAt", "desc").executeTakeFirst();
  if (!link) return { ok: false as const, status: 404, message: "Condition is not linked to a document" };
  const version = await getDocumentVersion(link.documentVersionId);
  if (!version) return { ok: false as const, status: 404, message: "Latest document version not found" };
  if (version.reviewStatus !== "Pending") return { ok: false as const, status: 400, message: "Version already reviewed" };
  if (outcome === "Rejected" && !notes?.trim()) return { ok: false as const, status: 400, message: "Rejection notes are required" };
  const document = await documentQuery().where("id", "=", version.documentId).executeTakeFirst();
  if (!document) return { ok: false as const, status: 404, message: "Document not found" };
  const updatedNotes = outcome === "Rejected" ? notes!.trim() : notes?.trim() ?? version.reviewNotes;

  await db.transaction().execute(async (trx: DbExecutor) => {
    await trx.updateTable("DocumentVersion").set({
      reviewStatus: outcome,
      reviewNotes: updatedNotes,
      reviewedBy: reviewerName,
      reviewedAt: now(),
    }).where("id", "=", version.id).execute();
    await trx.updateTable("Condition").set({
      status: outcome === "Approved" ? "Satisfied" : "NeedsMoreInfo",
      updatedAt: now(),
    }).where("id", "=", conditionId).execute();
    await trx.updateTable("Document").set({ updatedAt: now(), currentVersionId: version.id }).where("id", "=", document.id).execute();
    await trx.insertInto("AuditLog").values({
      id: randomUUID(),
      loanId: condition.loanId,
      conditionId,
      documentId: document.id,
      documentVersionId: version.id,
      actorType: "InternalUser",
      actorName: reviewerName,
      action: outcome === "Approved" ? "DocumentApproved" : "DocumentRejected",
      message: `${outcome} ${document.title}`,
      metadataJson: JSON.stringify({ versionId: version.id, outcome, notes: updatedNotes }),
      createdAt: now(),
    }).execute();
    await trx.insertInto("Notification").values({
      id: randomUUID(),
      recipient: "Borrower",
      templateKey: outcome === "Approved" ? "document-approved" : "document-rejected",
      status: "Pending",
      payloadJson: JSON.stringify({ conditionId, documentId: document.id, versionId: version.id, outcome, notes: updatedNotes }),
      attemptCount: 0,
      createdAt: now(),
      sentAt: null,
    }).execute();
  });

  return { ok: true as const, condition: { ...condition, status: outcome === "Approved" ? "Satisfied" : "NeedsMoreInfo" }, document, version: { ...version, reviewStatus: outcome, reviewNotes: updatedNotes, reviewedBy: reviewerName, reviewedAt: now() } };
};

export const reviewVersion = async (versionId: string, outcome: "Approved" | "Rejected", reviewerName = "Internal User", notes?: string) => {
  const version = await getDocumentVersion(versionId);
  if (!version) return { ok: false as const, status: 404, message: "Document version not found" };
  const linkedCondition = await db.selectFrom("ConditionDocument").selectAll().where("documentVersionId", "=", version.id).executeTakeFirst();
  if (!linkedCondition) return { ok: false as const, status: 404, message: "Condition link not found" };
  return reviewConditionVersion(linkedCondition.conditionId, outcome, notes, reviewerName);
};

export const reviewLatestConditionVersion = async (conditionId: string, outcome: "Approved" | "Rejected", notes?: string, reviewerName = "Internal User") =>
  reviewConditionVersion(conditionId, outcome, notes, reviewerName);
