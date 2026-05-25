import { createServer } from "node:http";
import {
  json,
  parseJsonBody,
  parseMultipartFields,
  readBodyBytes,
  send,
} from "./lib/http.js";
import {
  createUploadSession,
  getAuditLogForDocument,
  getAuditLogForLoan,
  getConditionDetail,
  getConditions,
  getDocumentDetail,
  getDocumentVersion,
  getDocumentVersions,
  getUploadSessionContext,
  getDocuments,
  getLoanBundle,
  getLoans,
  reviewLatestConditionVersion,
  uploadDocument,
  reviewVersion,
  validateUploadPayload,
} from "./services/workflow.js";
import { runBackgroundJobs } from "./services/jobs.js";
import {
  resolveTemporaryDownload,
  seedDemoDocumentStorage,
  storageService,
} from "./services/storage.js";
import { state } from "./data.js";

const maximumPdfBytes = 10 * 1024 * 1024;

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const method = req.method ?? "GET";

  if (method === "GET" && url.pathname === "/health") {
    return send(res, json(200, { ok: true }));
  }

  if (method === "GET" && url.pathname === "/api/loans") {
    return send(res, json(200, { data: getLoans() }));
  }

  const loanMatch = url.pathname.match(/^\/api\/loans\/([^/]+)$/);
  if (method === "GET" && loanMatch) {
    const bundle = getLoanBundle(loanMatch[1]);
    if (!bundle) return send(res, json(404, { error: "Loan not found" }));
    return send(res, json(200, { data: bundle }));
  }

  const conditionsMatch = url.pathname.match(
    /^\/api\/loans\/([^/]+)\/conditions$/,
  );
  if (conditionsMatch && method === "GET") {
    return send(res, json(200, { data: getConditions(conditionsMatch[1]) }));
  }

  if (conditionsMatch && method === "POST") {
    const body = await parseJsonBody(req);
    if (!body?.title || !body?.description)
      return send(
        res,
        json(400, { error: "title and description are required" }),
      );
    return send(
      res,
      json(201, {
        data: { id: "condition_draft", ...body, loanId: conditionsMatch[1] },
      }),
    );
  }

  const conditionPatchMatch = url.pathname.match(
    /^\/api\/conditions\/([^/]+)$/,
  );
  if (conditionPatchMatch && method === "PATCH") {
    const body = await parseJsonBody(req);
    return send(
      res,
      json(200, { data: { id: conditionPatchMatch[1], ...body } }),
    );
  }

  if (conditionPatchMatch && method === "GET") {
    const detail = getConditionDetail(conditionPatchMatch[1]);
    if (!detail) return send(res, json(404, { error: "Condition not found" }));
    return send(res, json(200, { data: detail }));
  }

  const conditionReviewMatch = url.pathname.match(
    /^\/api\/conditions\/([^/]+)\/review$/,
  );
  if (conditionReviewMatch && method === "POST") {
    const body = await parseJsonBody(req);
    if (!body?.action)
      return send(res, json(400, { error: "action is required" }));
    const result = reviewLatestConditionVersion(
      conditionReviewMatch[1],
      body.action,
      body.notes,
      body.reviewerName ?? "Internal User",
    );
    if (!result.ok)
      return send(res, json(result.status, { error: result.message }));
    return send(
      res,
      json(200, {
        data: {
          conditionId: conditionReviewMatch[1],
          reviewStatus: body.action,
        },
      }),
    );
  }

  const sessionsMatch = url.pathname.match(
    /^\/api\/loans\/([^/]+)\/upload-sessions$/,
  );
  if (sessionsMatch && method === "POST") {
    const session = createUploadSession(sessionsMatch[1]);
    if (!session) return send(res, json(404, { error: "Loan not found" }));
    return send(res, json(201, { data: session }));
  }

  const validateMatch = url.pathname.match(
    /^\/api\/upload-sessions\/([^/]+)\/validate$/,
  );
  if (validateMatch && method === "GET") {
    const result = getUploadSessionContext(
      validateMatch[1],
      url.searchParams.get("token") ?? undefined,
    );
    return send(
      res,
      json(200, { data: { sessionId: validateMatch[1], ...result } }),
    );
  }

  const uploadMatch = url.pathname.match(
    /^\/api\/upload-sessions\/([^/]+)\/documents$/,
  );
  if (uploadMatch && method === "POST") {
    const contentTypeHeader = req.headers["content-type"];
    const contentType = Array.isArray(contentTypeHeader)
      ? (contentTypeHeader[0] ?? "")
      : (contentTypeHeader ?? "");
    if (!contentType.includes("multipart/form-data")) {
      return send(res, json(400, { error: "multipart/form-data required" }));
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
      return send(
        res,
        json(400, {
          error: "token, conditionId, title, and file are required",
        }),
      );
    }
    if (
      file.contentType !== "application/pdf" ||
      !fileName.toLowerCase().endsWith(".pdf")
    ) {
      return send(res, json(415, { error: "Only PDF files can be uploaded" }));
    }
    if (fileSizeBytes > maximumPdfBytes) {
      return send(
        res,
        json(413, { error: "PDF files must be 10 MB or smaller" }),
      );
    }

    const validation = validateUploadPayload(
      uploadMatch[1],
      conditionId,
      token,
    );
    if (!validation.ok)
      return send(res, json(validation.status, { error: validation.message }));

    const result = uploadDocument({
      sessionId: uploadMatch[1],
      token,
      conditionId,
      title,
      fileName,
      contentType: file.contentType,
      fileBytes: file.bytes,
      fileSizeBytes,
      uploadedBy: "Borrower",
    });

    if (!result.ok) return send(res, json(400, { error: "Upload failed" }));

    return send(
      res,
      json(202, {
        data: {
          sessionId: uploadMatch[1],
          conditionId,
          title,
          fileName,
          documentId: result.document.id,
          versionId: result.version.id,
          accepted: true,
        },
      }),
    );
  }

  const documentsMatch = url.pathname.match(
    /^\/api\/loans\/([^/]+)\/documents$/,
  );
  if (documentsMatch && method === "GET") {
    return send(res, json(200, { data: getDocuments(documentsMatch[1]) }));
  }

  const documentMatch = url.pathname.match(/^\/api\/documents\/([^/]+)$/);
  if (documentMatch && method === "GET") {
    const document = getDocumentDetail(documentMatch[1]);
    if (!document) return send(res, json(404, { error: "Document not found" }));
    return send(res, json(200, { data: document }));
  }

  const versionsMatch = url.pathname.match(
    /^\/api\/documents\/([^/]+)\/versions$/,
  );
  if (versionsMatch && method === "GET") {
    return send(
      res,
      json(200, { data: getDocumentVersions(versionsMatch[1]) }),
    );
  }

  const downloadMatch = url.pathname.match(
    /^\/api\/document-versions\/([^/]+)\/download$/,
  );
  if (downloadMatch && method === "GET") {
    const version = getDocumentVersion(downloadMatch[1]);
    if (!version)
      return send(res, json(404, { error: "Document version not found" }));
    const downloadUrl = await storageService.getDownloadUrl(version.storageKey);
    return send(
      res,
      json(200, {
        data: {
          versionId: version.id,
          downloadUrl,
          fileName: version.fileName,
        },
      }),
    );
  }

  const previewMatch = url.pathname.match(
    /^\/api\/document-versions\/([^/]+)\/preview$/,
  );
  if (previewMatch && method === "GET") {
    const version = getDocumentVersion(previewMatch[1]);
    if (!version)
      return send(res, json(404, { error: "Document version not found" }));
    const file = await storageService.readFile(version.storageKey);
    if (!file) return send(res, json(404, { error: "Preview not available" }));
    res.statusCode = 200;
    res.setHeader("content-type", "application/pdf");
    res.setHeader("content-disposition", `inline; filename="${file.fileName}"`);
    res.end(Buffer.from(file.bytes));
    return;
  }

  const storageDownloadMatch = url.pathname.match(
    /^\/api\/storage\/download\/([^/]+)$/,
  );
  if (storageDownloadMatch && method === "GET") {
    const storageKey = resolveTemporaryDownload(storageDownloadMatch[1]);
    if (!storageKey)
      return send(res, json(404, { error: "Download link expired" }));
    const file = await storageService.readFile(storageKey);
    if (!file) return send(res, json(404, { error: "File not found" }));
    res.statusCode = 200;
    res.setHeader("content-type", file.contentType);
    res.setHeader(
      "content-disposition",
      `attachment; filename="${file.fileName}"`,
    );
    res.end(file.bytes);
    return;
  }

  const versionApproveMatch = url.pathname.match(
    /^\/api\/document-versions\/([^/]+)\/approve$/,
  );
  if (versionApproveMatch && method === "POST") {
    const body = await parseJsonBody(req);
    const result = reviewVersion(
      versionApproveMatch[1],
      "Approved",
      body.reviewerName ?? "Internal User",
      body.notes,
    );
    if (!result.ok)
      return send(res, json(result.status, { error: result.message }));
    return send(
      res,
      json(200, {
        data: { versionId: versionApproveMatch[1], reviewStatus: "Approved" },
      }),
    );
  }

  const versionRejectMatch = url.pathname.match(
    /^\/api\/document-versions\/([^/]+)\/reject$/,
  );
  if (versionRejectMatch && method === "POST") {
    const body = await parseJsonBody(req);
    if (!body?.notes?.trim())
      return send(res, json(400, { error: "Rejection notes are required" }));
    const result = reviewVersion(
      versionRejectMatch[1],
      "Rejected",
      body.reviewerName ?? "Internal User",
      body.notes,
    );
    if (!result.ok)
      return send(res, json(result.status, { error: result.message }));
    return send(
      res,
      json(200, {
        data: { versionId: versionRejectMatch[1], reviewStatus: "Rejected" },
      }),
    );
  }

  const loanAuditMatch = url.pathname.match(
    /^\/api\/loans\/([^/]+)\/audit-log$/,
  );
  if (loanAuditMatch && method === "GET") {
    return send(
      res,
      json(200, { data: getAuditLogForLoan(loanAuditMatch[1]) }),
    );
  }

  const documentAuditMatch = url.pathname.match(
    /^\/api\/documents\/([^/]+)\/audit-log$/,
  );
  if (documentAuditMatch && method === "GET") {
    return send(
      res,
      json(200, { data: getAuditLogForDocument(documentAuditMatch[1]) }),
    );
  }

  if (method === "GET" && url.pathname === "/api/health") {
    return send(res, json(200, { ok: true }));
  }

  if (method === "GET" && url.pathname === "/api/upload-session-validate") {
    return send(
      res,
      json(400, { error: "Use /api/upload-sessions/:sessionId/validate" }),
    );
  }

  return send(res, json(404, { error: "Not Found" }));
});

setInterval(() => {
  runBackgroundJobs();
}, 30_000).unref();

const port = Number(process.env.PORT ?? 3001);
await seedDemoDocumentStorage(state.documentVersions);
server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
