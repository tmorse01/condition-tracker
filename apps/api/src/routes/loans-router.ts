import { Router, type Router as ExpressRouter } from "express";
import {
  createUploadSession,
  getAuditLogForLoan,
  getConditions,
  getDocuments,
  getLoanBundle,
  getLoans,
} from "../services/workflow.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const loansRouter: ExpressRouter = Router();

loansRouter.get("/", (_req, res) => {
  return res.status(200).json({ data: getLoans() });
});

loansRouter.get(
  "/:loanId",
  asyncHandler(async (req, res) => {
    const loanId = String(req.params.loanId);
    const bundle = getLoanBundle(loanId);
    if (!bundle) {
      res.status(404).json({ error: "Loan not found" });
      return;
    }
    res.status(200).json({ data: bundle });
  }),
);

loansRouter
  .route("/:loanId/conditions")
  .get((req, res) => {
    return res.status(200).json({ data: getConditions(String(req.params.loanId)) });
  })
  .post((req, res) => {
    const body = req.body as { title?: string; description?: string };
    if (!body?.title || !body?.description) {
      return res.status(400).json({ error: "title and description are required" });
    }
    return res.status(201).json({
      data: { id: "condition_draft", ...body, loanId: req.params.loanId },
    });
  });

loansRouter.post(
  "/:loanId/upload-sessions",
  (req, res) => {
    const session = createUploadSession(String(req.params.loanId));
    if (!session) {
      return res.status(404).json({ error: "Loan not found" });
    }
    return res.status(201).json({ data: session });
  },
);

loansRouter.get("/:loanId/documents", (req, res) => {
  return res.status(200).json({ data: getDocuments(String(req.params.loanId)) });
});

loansRouter.get("/:loanId/audit-log", (req, res) => {
  return res.status(200).json({ data: getAuditLogForLoan(String(req.params.loanId)) });
});
