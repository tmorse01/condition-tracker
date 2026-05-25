import { Button, Card, Container, Group, Loader, Stack, Text, Textarea, Title } from "@mantine/core";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "../components/StatusBadge";
import { useConditionQuery } from "../hooks/queries";
import { queryKeys } from "../hooks/queryKeys";
import { reviewCondition } from "../services/api/conditions";

export function ConditionDetailPage() {
  const { conditionId = "" } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading } = useConditionQuery(conditionId);
  const mutation = useMutation({
    mutationFn: (args: { action: "Approved" | "Rejected"; notes?: string }) =>
      reviewCondition(conditionId, { ...args, reviewerName: "Avery Reviewer" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.condition(conditionId) });
      if (data?.condition.loanId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.loan(data.condition.loanId) });
      }
    },
  });
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [message, setMessage] = useState("");

  if (isLoading) return <Container size="lg" py="xl"><Loader /></Container>;
  if (!data) return <Container size="lg" py="xl">Condition not found.</Container>;

  const review = async (action: "Approved" | "Rejected") => {
    setMessage("");
    try {
      await mutation.mutateAsync({ action, notes: action === "Rejected" ? rejectionNotes : undefined });
      setMessage(`Marked ${action.toLowerCase()}.`);
      setRejectionNotes("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review failed");
    }
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={2}>{data.condition.title}</Title>
            <Text c="dimmed">{data.condition.description}</Text>
            <Text size="sm" c="dimmed" mt="xs">Loan {data.loan?.loanNumber ?? data.condition.loanId}</Text>
          </div>
          <Button component={Link} to={`/loans/${data.condition.loanId}`} variant="default">
            Back to loan
          </Button>
        </Group>
        <Card withBorder radius="md" p="lg">
          <Group justify="space-between" align="start">
            <div>
              <Title order={4}>Latest review</Title>
              <Text size="sm" c="dimmed">{data.latestDocument?.title ?? "No linked document"}</Text>
            </div>
            <StatusBadge status={data.condition.status} />
          </Group>
          {data.latestVersion ? (
            <Stack mt="md" gap="xs">
              <Text size="sm">Version {data.latestVersion.versionNumber}</Text>
              <Text size="sm">Uploaded by {data.latestVersion.uploadedBy}</Text>
              <Text size="sm">Uploaded at {data.latestVersion.uploadedAt}</Text>
              <Text size="sm">Review status: {data.latestVersion.reviewStatus}</Text>
              <Text size="sm">Review notes: {data.latestVersion.reviewNotes ?? "None"}</Text>
            </Stack>
          ) : (
            <Text size="sm" c="dimmed" mt="md">No document version available.</Text>
          )}
          <Stack mt="md">
            <Textarea label="Rejection notes" value={rejectionNotes} onChange={(event) => setRejectionNotes(event.currentTarget.value)} placeholder="Required if rejecting" />
            <Group>
              <Button onClick={() => review("Approved")} loading={mutation.isPending} disabled={!data.latestVersion || data.latestVersion.reviewStatus !== "Pending"}>
                Approve
              </Button>
              <Button color="red" variant="light" onClick={() => review("Rejected")} loading={mutation.isPending} disabled={!data.latestVersion || data.latestVersion.reviewStatus !== "Pending"}>
                Reject
              </Button>
            </Group>
            {message ? <Text size="sm">{message}</Text> : null}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
