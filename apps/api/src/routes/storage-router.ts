import { Router, type Router as ExpressRouter } from "express";
import { resolveTemporaryDownload, storageService } from "../services/storage.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const storageRouter: ExpressRouter = Router();

storageRouter.get(
  "/download/:token",
  asyncHandler(async (req, res) => {
    const storageKey = resolveTemporaryDownload(String(req.params.token));
    if (!storageKey) {
      res.status(404).json({ error: "Download link expired" });
      return;
    }
    const file = await storageService.readFile(storageKey);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    res.status(200);
    res.setHeader("content-type", file.contentType);
    res.setHeader("content-disposition", `attachment; filename="${file.fileName}"`);
    return res.end(file.bytes);
  }),
);
