import type { ConditionDetail } from "../../lib/api-types";
import { requestJson } from "./client";

export const getCondition = (conditionId: string) => requestJson<ConditionDetail>(`/api/conditions/${conditionId}`);

export const reviewCondition = (conditionId: string, body: { action: "Approved" | "Rejected"; notes?: string; reviewerName: string }) =>
  requestJson<{ conditionId: string; reviewStatus: "Approved" | "Rejected" }>(`/api/conditions/${conditionId}/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

