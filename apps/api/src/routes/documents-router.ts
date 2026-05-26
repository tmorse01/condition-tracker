import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { isUuid } from "../middleware/uuid-params.js";
import { getAuditLogForDocument, getDocumentDetail, getDocumentVersions } from "../services/workflow.js";

export const documentsRouter: ExpressRouter = Router();

documentsRouter.get("/:documentId", asyncHandler(async (req, res) => {
  const documentId = String(req.params.documentId);
  if (!isUuid(documentId)) return res.status(404).json({ error: "Document not found" });
  const document = await getDocumentDetail(documentId);
  if (!document) return res.status(404).json({ error: "Document not found" });
  return res.status(200).json({ data: document });
}));

documentsRouter.get("/:documentId/versions", asyncHandler(async (req, res) => {
  const documentId = String(req.params.documentId);
  if (!isUuid(documentId)) return res.status(404).json({ error: "Document not found" });
  return res.status(200).json({ data: await getDocumentVersions(documentId) });
}));

documentsRouter.get("/:documentId/audit-log", asyncHandler(async (req, res) => {
  const documentId = String(req.params.documentId);
  if (!isUuid(documentId)) return res.status(404).json({ error: "Document not found" });
  return res.status(200).json({ data: await getAuditLogForDocument(documentId) });
}));
