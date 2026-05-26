import { Alert, Button, Card, Grid, Group, Loader, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle, IconArrowLeft, IconDownload, IconExternalLink, IconFileOff, IconHistory, IconLink } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PdfPreview, PdfThumbnail } from "../components/PdfPreview";
import { StatusBadge } from "../components/StatusBadge";
import { useDocumentQuery } from "../hooks/queries";
import { downloadDocumentVersion } from "../services/api/loans";

export function DocumentDetailPage() {
  const { documentId = "" } = useParams();
  const documentQuery = useDocumentQuery(documentId);
  const [versionId, setVersionId] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState("");

  useEffect(() => {
    if (!documentQuery.data) return;
    const current = documentQuery.data.versions.find((version) => version.id === documentQuery.data?.document.currentVersionId)
      ?? documentQuery.data.versions[0];
    setVersionId((selected) => selected ?? current?.id ?? null);
  }, [documentQuery.data]);

  if (documentQuery.isLoading) return <div className="page-surface"><Loader /></div>;
  if (!documentQuery.data) return <div className="page-surface">Document not found.</div>;

  const { document, versions, auditLog, associatedConditions, loan } = documentQuery.data;
  const selectedVersion = versions.find((version) => version.id === versionId) ?? versions[0] ?? null;

  const download = async () => {
    if (!selectedVersion) return;
    try {
      const result = await downloadDocumentVersion(selectedVersion.id);
      window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
      setDownloadMessage("");
    } catch (error) {
      setDownloadMessage(error instanceof Error ? error.message : "Download unavailable.");
    }
  };

  return (
    <div className="page-surface">
      <Stack gap="lg">
        <Group justify="space-between" align="end">
          <div>
            {loan ? <Button component={Link} to={`/loans/${loan.id}`} variant="subtle" px={0} mb="sm" leftSection={<IconArrowLeft size={16} aria-hidden />}>Back to {loan.loanNumber}</Button> : null}
            <Title order={1}>{document.title}</Title>
            <Text c="dimmed">Versioned document record and review history</Text>
          </div>
          <Group>
            {selectedVersion ? <StatusBadge status={selectedVersion.reviewStatus} /> : null}
            <Button variant="light" disabled={!selectedVersion} leftSection={<IconDownload size={16} aria-hidden />} onClick={download}>Download PDF</Button>
          </Group>
        </Group>
        {downloadMessage ? <Alert color="red" variant="light" icon={<IconAlertCircle size={20} aria-hidden />}>{downloadMessage}</Alert> : null}
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            {selectedVersion ? <PdfPreview versionId={selectedVersion.id} title={document.title} /> : (
              <Card withBorder p="xl">
                <Group gap="xs">
                  <IconFileOff size={20} color="var(--mantine-color-gray-6)" aria-hidden />
                  <Text c="dimmed">No document version is available.</Text>
                </Group>
              </Card>
            )}
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="md">
              <Card withBorder radius="lg" p="lg">
                <Group gap="xs">
                  <IconHistory size={20} color="var(--mantine-color-indigo-6)" aria-hidden />
                  <Title order={4}>Version history</Title>
                </Group>
                <Stack mt="md">
                  {versions.map((version) => (
                    <Card
                      key={version.id}
                      withBorder
                      radius="md"
                      p="xs"
                      onClick={() => setVersionId(version.id)}
                      style={{ cursor: "pointer", borderColor: version.id === selectedVersion?.id ? "#4f46e5" : undefined }}
                    >
                      <PdfThumbnail versionId={version.id} label={`Version ${version.versionNumber}`} />
                      <Group justify="space-between" mt="xs">
                        <Text size="sm" fw={600}>v{version.versionNumber}</Text>
                        <StatusBadge status={version.reviewStatus} />
                      </Group>
                      <Text size="xs" c="dimmed" mt={6}>{version.fileName}</Text>
                    </Card>
                  ))}
                </Stack>
              </Card>
              <Card withBorder radius="lg" p="lg">
                <Group gap="xs">
                  <IconLink size={20} color="var(--mantine-color-indigo-6)" aria-hidden />
                  <Title order={4}>Linked conditions</Title>
                </Group>
                <Stack mt="md">
                  {associatedConditions.map((condition) => (
                    <div key={condition.id}>
                      <Text size="sm" fw={600}>{condition.title}</Text>
                      <Group justify="space-between" mt={4}>
                        <StatusBadge status={condition.status} />
                        <Button component={Link} to={`/conditions/${condition.id}`} variant="subtle" size="xs" rightSection={<IconExternalLink size={16} aria-hidden />}>Open</Button>
                      </Group>
                    </div>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
        <Card withBorder radius="lg" p="lg">
          <Group gap="xs" mb="md">
            <IconHistory size={20} color="var(--mantine-color-indigo-6)" aria-hidden />
            <Title order={4}>Audit history</Title>
          </Group>
          <Stack>
            {auditLog.map((entry) => (
              <Group key={entry.id} justify="space-between">
                <div>
                  <Text size="sm" fw={600}>{entry.message}</Text>
                  <Text size="xs" c="dimmed">{entry.actorName} - {entry.action}</Text>
                </div>
                <Text size="xs" c="dimmed">{new Date(entry.createdAt).toLocaleString()}</Text>
              </Group>
            ))}
          </Stack>
        </Card>
      </Stack>
    </div>
  );
}
