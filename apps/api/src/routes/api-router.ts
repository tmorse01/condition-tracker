import { Router, type Router as ExpressRouter } from "express";
import { auditRouter } from "./audit-router.js";
import { conditionsRouter } from "./conditions-router.js";
import { documentsRouter } from "./documents-router.js";
import { healthRouter } from "./health-router.js";
import { loansRouter } from "./loans-router.js";
import { documentVersionsRouter } from "./document-versions-router.js";
import { storageRouter } from "./storage-router.js";
import { uploadSessionsRouter } from "./upload-sessions-router.js";

export const apiRouter: ExpressRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/loans", loansRouter);
apiRouter.use("/conditions", conditionsRouter);
apiRouter.use("/upload-sessions", uploadSessionsRouter);
apiRouter.use("/documents", documentsRouter);
apiRouter.use("/document-versions", documentVersionsRouter);
apiRouter.use("/storage", storageRouter);
apiRouter.use("/", auditRouter);
apiRouter.use((req, res) => {
  return res.status(404).json({ error: "Not Found" });
});
