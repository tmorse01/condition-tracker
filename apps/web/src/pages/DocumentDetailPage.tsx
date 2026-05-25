import { Button, Card, Container, Group, Loader, Stack, Text, Title } from "@mantine/core";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { useDocumentQuery } from "../hooks/queries";

export function DocumentDetailPage() {
  const { documentId = "" } = useParams();
  const documentQuery = useDocumentQuery(documentId);

  if (documentQuery.isLoading) return <Container size="lg" py="xl"><Loader /></Container>;
  if (!documentQuery.data) return <Container size="lg" py="xl">Document not found.</Container>;

  const { document, versions, auditLog, associatedConditions, loan } = documentQuery.data;
  const currentVersion = versions.find((version) => version.id === document.currentVersionId) ?? versions[0] ?? null;

  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={2}>{document.title}</Title>
            <Text c="dimmed">Document detail and version history.</Text>
          </div>
          <Group>
            {loan ? <Button component={Link} to={`/loans/${loan.id}`} variant="default">Back to loan</Button> : null}
            <Button component={Link} to="/loans" variant="subtle">Loans</Button>
          </Group>
        </Group>
        <Card withBorder radius="md" p="lg">
          <Group justify="space-between" align="start">
            <div>
              <Title order={4}>Current version</Title>
              <Text size="sm" c="dimmed">
                {currentVersion?.fileName ?? "No versions yet"}
              </Text>
            </div>
            {currentVersion ? <StatusBadge status={currentVersion.reviewStatus} /> : null}
          </Group>
          {currentVersion ? (
            <Stack mt="md" gap="xs">
              <Text size="sm">Version {currentVersion.versionNumber}</Text>
              <Text size="sm">Uploaded by {currentVersion.uploadedBy}</Text>
              <Text size="sm">Uploaded at {currentVersion.uploadedAt}</Text>
              <Text size="sm">Review notes: {currentVersion.reviewNotes ?? "None"}</Text>
            </Stack>
          ) : null}
        </Card>
        <Card withBorder radius="md" p="lg">
          <Title order={4}>Version history</Title>
          <Stack mt="md" gap="sm">
            {versions.map((version) => (
              <Card key={version.id} withBorder>
                <Group justify="space-between" align="start">
                  <div>
                    <Text fw={600}>Version {version.versionNumber}</Text>
                    <Text size="sm">Uploaded by {version.uploadedBy}</Text>
                    <Text size="sm">Uploaded at {version.uploadedAt}</Text>
                    <Text size="sm">Review notes: {version.reviewNotes ?? "None"}</Text>
                  </div>
                  <StatusBadge status={version.reviewStatus} />
                </Group>
              </Card>
            ))}
          </Stack>
        </Card>
        <Card withBorder radius="md" p="lg">
          <Title order={4}>Review history</Title>
          <Stack mt="md" gap="xs">
            {auditLog.map((entry) => (
              <Text key={entry.id} size="sm">
                {entry.action} - {entry.message}
              </Text>
            ))}
          </Stack>
        </Card>
        <Card withBorder radius="md" p="lg">
          <Title order={4}>Associated conditions</Title>
          <Stack mt="md" gap="sm">
            {associatedConditions.map((condition) => (
              <Group key={condition.id} justify="space-between">
                <div>
                  <Text fw={600}>{condition.title}</Text>
                  <Text size="sm" c="dimmed">
                    {condition.description}
                  </Text>
                </div>
                <Group>
                  <Text size="sm" c="dimmed">
                    {condition.loanId === loan?.id ? "Current loan" : `Loan ${condition.loanId}`}
                  </Text>
                  <Button component={Link} to={`/conditions/${condition.id}`} variant="subtle">
                    Open review
                  </Button>
                </Group>
              </Group>
            ))}
            {!associatedConditions.length ? (
              <Text size="sm" c="dimmed">
                No associated conditions found.
              </Text>
            ) : null}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
