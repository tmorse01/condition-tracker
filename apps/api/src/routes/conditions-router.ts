import { Router, type Router as ExpressRouter } from "express";
import {
  getConditionDetail,
  reviewLatestConditionVersion,
} from "../services/workflow.js";

export const conditionsRouter: ExpressRouter = Router();

conditionsRouter.get("/:conditionId", (req, res) => {
  const detail = getConditionDetail(String(req.params.conditionId));
  if (!detail) return res.status(404).json({ error: "Condition not found" });
  return res.status(200).json({ data: detail });
});

conditionsRouter.patch("/:conditionId", (req, res) => {
  return res.status(200).json({ data: { id: String(req.params.conditionId), ...req.body } });
});

conditionsRouter.post("/:conditionId/review", (req, res) => {
  const body = req.body as {
    action?: "Approved" | "Rejected";
    notes?: string;
    reviewerName?: string;
  };
  if (!body?.action) {
    return res.status(400).json({ error: "action is required" });
  }
  const result = reviewLatestConditionVersion(
    String(req.params.conditionId),
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
});
