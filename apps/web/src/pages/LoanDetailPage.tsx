import { Alert, Badge, Button, Card, CopyButton, Grid, Group, Loader, Paper, Stack, Tabs, Text, Title } from "@mantine/core";
import { IconArrowLeft, IconCircleCheck, IconClipboardCheck, IconCopy, IconExternalLink, IconFileText, IconHistory, IconHome, IconLink } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { PdfThumbnail } from "../components/PdfPreview";
import { StatusBadge } from "../components/StatusBadge";
import { queryKeys } from "../hooks/queryKeys";
import { useLoanQuery } from "../hooks/queries";
import { createUploadSession } from "../services/api/upload-sessions";

export function LoanDetailPage() {
  const { loanId = "" } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading } = useLoanQuery(loanId);
  const sessionMutation = useMutation({
    mutationFn: () => createUploadSession(loanId),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: queryKeys.loan(loanId) }),
  });

  if (isLoading) return <div className="page-surface"><Loader /></div>;
  if (!data) return <div className="page-surface">Loan not found.</div>;

  const { loan, conditions, documents, documentVersions, auditLog } = data;
  const uploadLink = sessionMutation.data ? `${window.location.origin}${sessionMutation.data.uploadUrl}` : "";
  const pendingReviewCount = conditions.filter((condition) => condition.status === "PendingReview").length;
  const outstandingCount = conditions.filter((condition) => condition.status === "PendingUpload" || condition.status === "NeedsMoreInfo").length;

  return (
    <div className="page-surface">
      <Stack gap="lg">
        <Group justify="space-between" align="start">
          <div>
            <Button
              component={Link}
              to="/loans"
              variant="subtle"
              className="back-to-loans"
              mb="sm"
              leftSection={<IconArrowLeft size={16} aria-hidden />}
            >
              Back to loans
            </Button>
            <Group gap="sm">
              <Title order={1}>{loan.loanNumber}</Title>
              <StatusBadge status={loan.status} />
            </Group>
            <Text c="dimmed">{loan.borrowerName} - {loan.propertyAddress}</Text>
          </div>
          <Button onClick={() => sessionMutation.mutate()} loading={sessionMutation.isPending} disabled={!outstandingCount} leftSection={<IconLink size={16} aria-hidden />}>
            Create upload link
          </Button>
        </Group>

        {sessionMutation.data ? (
          <Alert color="indigo" variant="light" title="Secure borrower link created" icon={<IconCircleCheck size={20} aria-hidden />}>
            <Stack gap="xs">
              <Text size="sm">Expires {new Date(sessionMutation.data.expiresAt).toLocaleString()}. One outstanding PDF may be submitted with this link.</Text>
              <Group>
                <Text size="sm" ff="monospace" lineClamp={1}>{uploadLink}</Text>
                <CopyButton value={uploadLink}>
                  {({ copied, copy }) => <Button size="xs" variant="light" leftSection={<IconCopy size={16} aria-hidden />} onClick={copy}>{copied ? "Copied" : "Copy link"}</Button>}
                </CopyButton>
                <Button component="a" href={sessionMutation.data.uploadUrl} target="_blank" size="xs" variant="subtle" rightSection={<IconExternalLink size={16} aria-hidden />}>Open</Button>
              </Group>
            </Stack>
          </Alert>
        ) : null}

        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card withBorder radius="lg" p="lg">
              <Group justify="space-between" align="start">
                <Text size="sm" c="dimmed">Tracked requirements</Text>
                <IconClipboardCheck size={24} color="var(--mantine-color-indigo-6)" aria-hidden />
              </Group>
              <Title order={2} mt="xs">{conditions.length}</Title>
              <Text size="sm" c="dimmed">{outstandingCount ? `${outstandingCount} awaiting upload` : "No uploads currently requested"}</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card withBorder radius="lg" p="lg">
              <Group justify="space-between" align="start">
                <Text size="sm" c="dimmed">Pending decisions</Text>
                <IconCircleCheck size={24} color="var(--mantine-color-indigo-6)" aria-hidden />
              </Group>
              <Title order={2} mt="xs">{pendingReviewCount}</Title>
              <Text size="sm" c="dimmed">Ready for reviewer action</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card withBorder radius="lg" p="lg">
              <Group justify="space-between" align="start">
                <Text size="sm" c="dimmed">Documents</Text>
                <IconFileText size={24} color="var(--mantine-color-indigo-6)" aria-hidden />
              </Group>
              <Title order={2} mt="xs">{documents.length}</Title>
              <Text size="sm" c="dimmed">Versioned borrower files</Text>
            </Card>
          </Grid.Col>
        </Grid>

        <Paper withBorder radius="lg" p="lg">
          <Tabs defaultValue="conditions" color="indigo">
            <Tabs.List mb="lg">
              <Tabs.Tab value="overview" leftSection={<IconHome size={16} aria-hidden />}>Overview</Tabs.Tab>
              <Tabs.Tab value="conditions" leftSection={<IconClipboardCheck size={16} aria-hidden />}>Conditions</Tabs.Tab>
              <Tabs.Tab value="documents" leftSection={<IconFileText size={16} aria-hidden />}>Documents</Tabs.Tab>
              <Tabs.Tab value="audit" leftSection={<IconHistory size={16} aria-hidden />}>Audit log</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="overview">
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Stack gap="sm">
                    <Text size="xs" c="dimmed" fw={700}>BORROWER</Text>
                    <Text fw={600}>{loan.borrowerName}</Text>
                    <Text>{loan.propertyAddress}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Stack gap="sm">
                    <Text size="xs" c="dimmed" fw={700}>NEXT ACTION</Text>
                    <Text>{outstandingCount ? "Send a borrower upload link for outstanding items." : "Review submitted documents and close requirements."}</Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>
            <Tabs.Panel value="conditions">
              <Stack gap={0}>
                {conditions.map((condition) => (
                  <Group key={condition.id} justify="space-between" py="md" style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <div>
                      <Text fw={600}>{condition.title}</Text>
                      <Text size="sm" c="dimmed">{condition.description}</Text>
                    </div>
                    <Group>
                      <StatusBadge status={condition.status} />
                      {condition.status === "PendingReview" ? (
                        <Button component={Link} to={`/conditions/${condition.id}`} variant="light">Review</Button>
                      ) : null}
                    </Group>
                  </Group>
                ))}
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value="documents">
              <Grid>
                {documents.map((document) => {
                  const current = documentVersions.find((version) => version.id === document.currentVersionId);
                  return (
                    <Grid.Col key={document.id} span={{ base: 12, sm: 6, lg: 4 }}>
                      <Card withBorder radius="md" p="sm">
                        {current ? <PdfThumbnail versionId={current.id} label={current.fileName} /> : null}
                        <Text fw={600} mt="sm">{document.title}</Text>
                        <Group justify="space-between" mt="xs">
                          {current ? <StatusBadge status={current.reviewStatus} /> : <Badge variant="light">No file</Badge>}
                          <Button component={Link} to={`/documents/${document.id}`} variant="subtle" size="xs">View</Button>
                        </Group>
                      </Card>
                    </Grid.Col>
                  );
                })}
              </Grid>
            </Tabs.Panel>
            <Tabs.Panel value="audit">
              <Stack gap="md">
                {auditLog.map((entry) => (
                  <Group key={entry.id} justify="space-between">
                    <div>
                      <Text fw={600} size="sm">{entry.message}</Text>
                      <Text size="xs" c="dimmed">{entry.actorName} - {entry.action}</Text>
                    </div>
                    <Text size="xs" c="dimmed">{new Date(entry.createdAt).toLocaleString()}</Text>
                  </Group>
                ))}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>
    </div>
  );
}
