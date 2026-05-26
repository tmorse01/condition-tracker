import { Router, type Router as ExpressRouter } from "express";
import { getAuditLogForDocument, getDocumentDetail, getDocumentVersions } from "../services/workflow.js";

export const documentsRouter: ExpressRouter = Router();

documentsRouter.get("/:documentId", (req, res) => {
  const document = getDocumentDetail(req.params.documentId);
  if (!document) return res.status(404).json({ error: "Document not found" });
  return res.status(200).json({ data: document });
});

documentsRouter.get("/:documentId/versions", (req, res) => {
  return res.status(200).json({ data: getDocumentVersions(req.params.documentId) });
});

documentsRouter.get("/:documentId/audit-log", (req, res) => {
  return res.status(200).json({ data: getAuditLogForDocument(req.params.documentId) });
});
