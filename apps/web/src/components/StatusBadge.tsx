import { Badge } from "@mantine/core";

export const statusColor = (status: string) => {
  if (status === "Satisfied" || status === "Approved" || status === "Used") return "green";
  if (status === "PendingReview" || status === "PendingUpload" || status === "Ready") return "yellow";
  if (status === "Rejected" || status === "NeedsMoreInfo" || status === "Expired Link" || status === "Invalid Link") return "red";
  return "gray";
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge color={statusColor(status)}>{status}</Badge>;
}

