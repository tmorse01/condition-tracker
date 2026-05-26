import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { getDocumentVersion, reviewVersion } from "../services/workflow.js";
import { storageService } from "../services/storage.js";

export const documentVersionsRouter: ExpressRouter = Router();

documentVersionsRouter.get(
  "/:versionId/download",
  asyncHandler(async (req, res) => {
    const versionId = String(req.params.versionId);
    const version = getDocumentVersion(versionId);
    if (!version) {
      res.status(404).json({ error: "Document version not found" });
      return;
    }
    const downloadUrl = await storageService.getDownloadUrl(version.storageKey);
    res.status(200).json({
      data: {
        versionId: version.id,
        downloadUrl,
        fileName: version.fileName,
      },
    });
  }),
);

documentVersionsRouter.get(
  "/:versionId/preview",
  asyncHandler(async (req, res) => {
    const versionId = String(req.params.versionId);
    const version = getDocumentVersion(versionId);
    if (!version) {
      res.status(404).json({ error: "Document version not found" });
      return;
    }
    const file = await storageService.readFile(version.storageKey);
    if (!file) {
      res.status(404).json({ error: "Preview not available" });
      return;
    }
    res.status(200);
    res.setHeader("content-type", "application/pdf");
    res.setHeader("content-disposition", `inline; filename="${file.fileName}"`);
    return res.end(Buffer.from(file.bytes));
  }),
);

documentVersionsRouter.post("/:versionId/approve", (req, res) => {
  const body = req.body as { reviewerName?: string; notes?: string };
  const versionId = String(req.params.versionId);
  const result = reviewVersion(
    versionId,
    "Approved",
    body.reviewerName ?? "Internal User",
    body.notes,
  );
  if (!result.ok) return res.status(result.status).json({ error: result.message });
  return res.status(200).json({
    data: { versionId, reviewStatus: "Approved" },
  });
});

documentVersionsRouter.post("/:versionId/reject", (req, res) => {
  const body = req.body as { reviewerName?: string; notes?: string };
  const versionId = String(req.params.versionId);
  if (!body?.notes?.trim()) {
    return res.status(400).json({ error: "Rejection notes are required" });
  }
  const result = reviewVersion(
    versionId,
    "Rejected",
    body.reviewerName ?? "Internal User",
    body.notes,
  );
  if (!result.ok) return res.status(result.status).json({ error: result.message });
  return res.status(200).json({
    data: { versionId, reviewStatus: "Rejected" },
  });
});
