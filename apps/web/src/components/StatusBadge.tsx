import { Badge } from "@mantine/core";

export const statusColor = (status: string) => {
  if (status === "Satisfied" || status === "Approved" || status === "Used") return "green";
  if (status === "PendingReview" || status === "PendingUpload" || status === "Ready") return "yellow";
  if (status === "Complete") return "teal";
  if (status === "Rejected" || status === "NeedsMoreInfo" || status === "Expired Link" || status === "Invalid Link" || status === "Revoked Link") return "red";
  if (status === "Active" || status === "Uploading") return "indigo";
  return "gray";
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/([a-z])([A-Z])/g, "$1 $2");
  return <Badge variant="light" color={statusColor(status)}>{label}</Badge>;
}
