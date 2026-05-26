import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { isUuid } from "../middleware/uuid-params.js";
import {
  getConditionDetail,
  reviewLatestConditionVersion,
} from "../services/workflow.js";

export const conditionsRouter: ExpressRouter = Router();

conditionsRouter.get("/:conditionId", asyncHandler(async (req, res) => {
  const conditionId = String(req.params.conditionId);
  if (!isUuid(conditionId)) return res.status(404).json({ error: "Condition not found" });
  const detail = await getConditionDetail(conditionId);
  if (!detail) return res.status(404).json({ error: "Condition not found" });
  return res.status(200).json({ data: detail });
}));

conditionsRouter.patch("/:conditionId", (req, res) => {
  const conditionId = String(req.params.conditionId);
  if (!isUuid(conditionId)) return res.status(404).json({ error: "Condition not found" });
  return res.status(200).json({ data: { id: conditionId, ...req.body } });
});

conditionsRouter.post("/:conditionId/review", asyncHandler(async (req, res) => {
  const body = req.body as {
    action?: "Approved" | "Rejected";
    notes?: string;
    reviewerName?: string;
  };
  if (!body?.action) {
    return res.status(400).json({ error: "action is required" });
  }
  const conditionId = String(req.params.conditionId);
  if (!isUuid(conditionId)) return res.status(404).json({ error: "Condition not found" });
  const result = await reviewLatestConditionVersion(
    conditionId,
    body.action,
    body.notes,
    body.reviewerName ?? "Internal User",
  );
  if (!result.ok) return res.status(result.status).json({ error: result.message });
  return res.status(200).json({
    data: {
      conditionId: String(req.params.conditionId),
      reviewStatus: body.action,
    },
  });
}));
