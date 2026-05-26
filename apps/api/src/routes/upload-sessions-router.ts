import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { isUuid } from "../middleware/uuid-params.js";
import { parseMultipartFields, readBodyBytes } from "../lib/http.js";
import {
  getUploadSessionContext,
  uploadDocument,
  validateUploadPayload,
} from "../services/workflow.js";

const maximumPdfBytes = 10 * 1024 * 1024;

export const uploadSessionsRouter: ExpressRouter = Router();

uploadSessionsRouter.get("/:sessionId/validate", asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  if (!isUuid(sessionId)) {
    return res.status(200).json({ data: { sessionId, valid: false, reason: "Invalid Link", session: null, loan: null, eligibleConditions: [] } });
  }
  const result = await getUploadSessionContext(
    sessionId,
    typeof req.query.token === "string" ? req.query.token : undefined,
  );
  return res.status(200).json({ data: { sessionId, ...result } });
}));

uploadSessionsRouter.get("/upload-session-validate", (_req, res) => {
  return res.status(400).json({ error: "Use /api/upload-sessions/:sessionId/validate" });
});

uploadSessionsRouter.post(
  "/:sessionId/documents",
  asyncHandler(async (req, res) => {
    const contentTypeHeader = req.headers["content-type"];
    const contentType = Array.isArray(contentTypeHeader)
      ? (contentTypeHeader[0] ?? "")
      : (contentTypeHeader ?? "");
    if (!contentType.includes("multipart/form-data")) {
      res.status(400).json({ error: "multipart/form-data required" });
      return;
    }

    const rawBody = await readBodyBytes(req);
    const body = parseMultipartFields(rawBody, contentType);
    const token = body.token?.value ?? "";
    const conditionId = body.conditionId?.value ?? "";
    const title = body.title?.value ?? "";
    const file = body.file;
    const fileName = file?.fileName ?? "";
    const fileSizeBytes = file?.bytes.byteLength ?? 0;

    if (!token || !conditionId || !title || !fileName || !file) {
      res.status(400).json({ error: "token, conditionId, title, and file are required" });
      return;
    }
    if (file.contentType !== "application/pdf" || !fileName.toLowerCase().endsWith(".pdf")) {
      res.status(415).json({ error: "Only PDF files can be uploaded" });
      return;
    }
    if (fileSizeBytes > maximumPdfBytes) {
      res.status(413).json({ error: "PDF files must be 10 MB or smaller" });
      return;
    }

    const sessionId = String(req.params.sessionId);
    if (!isUuid(sessionId)) {
      return res.status(404).json({ error: "Upload session not found" });
    }
    const validation = await validateUploadPayload(sessionId, conditionId, token);
    if (!validation.ok) {
      return res.status(validation.status).json({ error: validation.message });
    }

    const result = await uploadDocument({
      sessionId,
      token,
      conditionId,
      title,
      fileName,
      contentType: file.contentType,
      fileBytes: file.bytes,
      fileSizeBytes,
      uploadedBy: "Borrower",
    });

    if (!result.ok) return res.status(400).json({ error: "Upload failed" });

    return res.status(202).json({
      data: {
        sessionId,
        conditionId,
        title,
        fileName,
        documentId: result.document.id,
        versionId: result.version.id,
        accepted: true,
      },
    });
  }),
);
