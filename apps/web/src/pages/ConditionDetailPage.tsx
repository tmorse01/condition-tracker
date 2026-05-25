import { Alert, Button, Card, Grid, Group, Loader, Stack, Text, Textarea, Title } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PdfPreview, PdfThumbnail } from "../components/PdfPreview";
import { StatusBadge } from "../components/StatusBadge";
import { queryKeys } from "../hooks/queryKeys";
import { useConditionQuery } from "../hooks/queries";
import { reviewCondition } from "../services/api/conditions";

export function ConditionDetailPage() {
  const { conditionId = "" } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading } = useConditionQuery(conditionId);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const mutation = useMutation({
    mutationFn: (action: "Approved" | "Rejected") =>
      reviewCondition(conditionId, { action, notes: action === "Rejected" ? notes : undefined, reviewerName: "Avery Reviewer" }),
    onSuccess: async (_, action) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.condition(conditionId) });
      if (data?.condition.loanId) await queryClient.invalidateQueries({ queryKey: queryKeys.loan(data.condition.loanId) });
      setMessage(action === "Approved" ? "Document approved and condition satisfied." : "Document rejected and a correction has been requested.");
      setNotes("");
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : "Review could not be saved."),
  });

  if (isLoading) return <div className="page-surface"><Loader /></div>;
  if (!data) return <div className="page-surface">Condition not found.</div>;

  const canReview = data.latestVersion?.reviewStatus === "Pending";

  return (
    <div className="page-surface">
      <Stack gap="lg">
        <Group justify="space-between" align="end">
          <div>
            <Button component={Link} to={`/loans/${data.condition.loanId}`} variant="subtle" px={0} mb="sm">Back to loan</Button>
            <Title order={1}>{data.condition.title}</Title>
            <Text c="dimmed">{data.condition.description}</Text>
          </div>
          <StatusBadge status={data.condition.status} />
        </Group>
        {message ? <Alert color={message.includes("could not") ? "red" : "indigo"} variant="light">{message}</Alert> : null}
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            {data.latestVersion ? (
              <PdfPreview versionId={data.latestVersion.id} title={data.latestDocument?.title ?? data.condition.title} />
            ) : (
              <Card withBorder p="xl"><Text c="dimmed">No submitted document is available for review.</Text></Card>
            )}
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="md">
              <Card withBorder radius="lg" p="lg">
                <Text size="xs" c="dimmed" fw={700}>REVIEW DECISION</Text>
                <Title order={4} mt="xs">{data.latestDocument?.title ?? "No linked document"}</Title>
                {data.latestVersion ? (
                  <Stack gap="xs" mt="md">
                    <Group justify="space-between"><Text size="sm" c="dimmed">Version</Text><Text size="sm">{data.latestVersion.versionNumber}</Text></Group>
                    <Group justify="space-between"><Text size="sm" c="dimmed">Submitted by</Text><Text size="sm">{data.latestVersion.uploadedBy}</Text></Group>
                    <Group justify="space-between"><Text size="sm" c="dimmed">Status</Text><StatusBadge status={data.latestVersion.reviewStatus} /></Group>
                  </Stack>
                ) : null}
                <Textarea
                  label="Rejection notes"
                  description="Required when requesting a correction."
                  placeholder="Explain precisely what must be corrected."
                  value={notes}
                  onChange={(event) => setNotes(event.currentTarget.value)}
                  minRows={4}
                  mt="lg"
                  disabled={!canReview}
                />
                <Group grow mt="lg">
                  <Button onClick={() => mutation.mutate("Approved")} loading={mutation.isPending} disabled={!canReview}>Approve</Button>
                  <Button
                    color="red"
                    variant="light"
                    onClick={() => mutation.mutate("Rejected")}
                    loading={mutation.isPending}
                    disabled={!canReview || !notes.trim()}
                  >
                    Reject
                  </Button>
                </Group>
              </Card>
              <Card withBorder radius="lg" p="lg">
                <Title order={4}>Versions</Title>
                <Stack mt="md">
                  {data.versionHistory.map((version) => (
                    <div key={version.id}>
                      <PdfThumbnail versionId={version.id} label={version.fileName} />
                      <Group justify="space-between" mt={6}>
                        <Text size="sm">Version {version.versionNumber}</Text>
                        <StatusBadge status={version.reviewStatus} />
                      </Group>
                    </div>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </div>
  );
}
