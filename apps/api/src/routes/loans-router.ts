import { Router, type Router as ExpressRouter } from "express";
import { isUuid } from "../middleware/uuid-params.js";
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

loansRouter.get("/", asyncHandler(async (_req, res) => res.status(200).json({ data: await getLoans() })));

loansRouter.get("/:loanId", asyncHandler(async (req, res) => {
  const loanId = String(req.params.loanId);
  if (!isUuid(loanId)) return res.status(404).json({ error: "Loan not found" });
  const bundle = await getLoanBundle(loanId);
  if (!bundle) return res.status(404).json({ error: "Loan not found" });
  return res.status(200).json({ data: bundle });
}));

loansRouter.route("/:loanId/conditions")
  .get(asyncHandler(async (req, res) => {
    const loanId = String(req.params.loanId);
    if (!isUuid(loanId)) return res.status(404).json({ error: "Loan not found" });
    return res.status(200).json({ data: await getConditions(loanId) });
  }))
  .post((req, res) => {
    const body = req.body as { title?: string; description?: string };
    if (!body?.title || !body?.description) {
      return res.status(400).json({ error: "title and description are required" });
    }
    return res.status(201).json({
      data: { id: "condition_draft", ...body, loanId: req.params.loanId },
    });
  });

loansRouter.post("/:loanId/upload-sessions", asyncHandler(async (req, res) => {
  const loanId = String(req.params.loanId);
  if (!isUuid(loanId)) return res.status(404).json({ error: "Loan not found" });
  const session = await createUploadSession(loanId);
  if (!session) return res.status(404).json({ error: "Loan not found" });
  return res.status(201).json({ data: session });
}));

loansRouter.get("/:loanId/documents", asyncHandler(async (req, res) => {
  const loanId = String(req.params.loanId);
  if (!isUuid(loanId)) return res.status(404).json({ error: "Loan not found" });
  return res.status(200).json({ data: await getDocuments(loanId) });
}));

loansRouter.get("/:loanId/audit-log", asyncHandler(async (req, res) => {
  const loanId = String(req.params.loanId);
  if (!isUuid(loanId)) return res.status(404).json({ error: "Loan not found" });
  return res.status(200).json({ data: await getAuditLogForLoan(loanId) });
}));
