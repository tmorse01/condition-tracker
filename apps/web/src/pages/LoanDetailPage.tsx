import { Button, Card, Container, Group, Loader, Stack, Tabs, Text, Title } from "@mantine/core";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { useLoanQuery } from "../hooks/queries";

export function LoanDetailPage() {
  const { loanId = "" } = useParams();
  const { data, isLoading } = useLoanQuery(loanId);
  if (isLoading) return <Container size="lg" py="xl"><Loader /></Container>;
  if (!data) return <Container size="lg" py="xl">Loan not found.</Container>;
  const { loan, conditions, documents, documentVersions, auditLog } = data;

  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={2}>{loan.loanNumber}</Title>
            <Text c="dimmed">
              {loan.borrowerName} - {loan.propertyAddress}
            </Text>
          </div>
          <Button component={Link} to="/loans" variant="default">
            Back
          </Button>
        </Group>
        <Card withBorder radius="md">
          <Tabs defaultValue="overview">
            <Tabs.List>
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              <Tabs.Tab value="conditions">Conditions</Tabs.Tab>
              <Tabs.Tab value="documents">Documents</Tabs.Tab>
              <Tabs.Tab value="audit">Audit Log</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="overview" pt="md">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Borrower
                  </Text>
                  <Text size="sm">{loan.borrowerName}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Property
                  </Text>
                  <Text size="sm">{loan.propertyAddress}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Loan status
                  </Text>
                  <StatusBadge status={loan.status} />
                </Group>
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value="conditions" pt="md">
              <Stack>
                {conditions.map((condition) => (
                  <Group key={condition.id} justify="space-between">
                    <div>
                      <Text fw={600}>{condition.title}</Text>
                      <Text size="sm" c="dimmed">{condition.description}</Text>
                    </div>
                    <Group>
                      <StatusBadge status={condition.status} />
                      <Button component={Link} to={`/conditions/${condition.id}`} variant="subtle">
                        Open review
                      </Button>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value="documents" pt="md">
              <Stack>
                {documents.map((document) => {
                  const currentVersion = documentVersions.find((version) => version.id === document.currentVersionId);
                  return (
                    <Card key={document.id} withBorder>
                      <Group justify="space-between">
                        <div>
                          <Text fw={600}>{document.title}</Text>
                          <Text size="sm" c="dimmed">Current version: {currentVersion?.fileName ?? "None"}</Text>
                        </div>
                        <Group>
                          {currentVersion ? <StatusBadge status={currentVersion.reviewStatus} /> : null}
                          <Button component={Link} to={`/documents/${document.id}`} variant="subtle">
                            Open
                          </Button>
                        </Group>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value="audit" pt="md">
              <Stack>
                {auditLog.map((entry) => (
                  <Text key={entry.id} size="sm">{entry.action} - {entry.message}</Text>
                ))}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Stack>
    </Container>
  );
}
