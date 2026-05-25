import { AppShell, Badge, Button, Card, Container, Group, Stack, Table, Tabs, Text, Title } from "@mantine/core";
import { Link, Route, Routes, useParams } from "react-router-dom";
import { demoConditions, demoDocuments, demoLoans, demoUploadSessions, demoVersions } from "@condition-tracker/shared/demo-data";

const statusColor = (status: string) => {
  if (status === "Satisfied" || status === "Approved" || status === "Used") return "green";
  if (status === "PendingReview" || status === "PendingUpload") return "yellow";
  if (status === "Rejected" || status === "NeedsMoreInfo") return "red";
  return "gray";
};

function DashboardPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Card withBorder radius="md" p="lg">
          <Title order={1}>Condition Tracker</Title>
          <Text c="dimmed" mt="xs">
            Lightweight construction-loan document workflow platform.
          </Text>
          <Group mt="md">
            <Button component={Link} to="/loans">
              View loans
            </Button>
            <Button variant="default" component={Link} to="/upload/session_2">
              Demo upload link
            </Button>
          </Group>
        </Card>
      </Stack>
    </Container>
  );
}

function LoansPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={2}>Loans</Title>
            <Text c="dimmed">Internal review queue and condition tracking.</Text>
          </div>
          <Button component={Link} to="/">
            Dashboard
          </Button>
        </Group>
        <Card withBorder radius="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Loan</Table.Th>
                <Table.Th>Borrower</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {demoLoans.map((loan) => (
                <Table.Tr key={loan.id}>
                  <Table.Td>{loan.loanNumber}</Table.Td>
                  <Table.Td>{loan.borrowerName}</Table.Td>
                  <Table.Td>
                    <Badge color={statusColor(loan.status)}>{loan.status}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Button component={Link} variant="subtle" to={`/loans/${loan.id}`}>
                      Open
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </Stack>
    </Container>
  );
}

function LoanDetailPage() {
  const { loanId } = useParams();
  const loan = demoLoans.find((entry) => entry.id === loanId);
  if (!loan) return <Container size="lg" py="xl">Loan not found.</Container>;
  const conditions = demoConditions.filter((condition) => condition.loanId === loan.id);
  const documents = demoDocuments.filter((document) => document.loanId === loan.id);
  const versions = demoVersions.filter((version) => documents.some((document) => document.id === version.documentId));

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
          <Tabs defaultValue="conditions">
            <Tabs.List>
              <Tabs.Tab value="conditions">Conditions</Tabs.Tab>
              <Tabs.Tab value="documents">Documents</Tabs.Tab>
              <Tabs.Tab value="audit">Audit Log</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="conditions" pt="md">
              <Stack>
                {conditions.map((condition) => (
                  <Group key={condition.id} justify="space-between">
                    <div>
                      <Text fw={600}>{condition.title}</Text>
                      <Text size="sm" c="dimmed">
                        {condition.description}
                      </Text>
                    </div>
                    <Badge color={statusColor(condition.status)}>{condition.status}</Badge>
                  </Group>
                ))}
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value="documents" pt="md">
              <Stack>
                {documents.map((document) => {
                  const currentVersion = versions.find((version) => version.id === document.currentVersionId);
                  return (
                    <Card key={document.id} withBorder>
                      <Group justify="space-between">
                        <div>
                          <Text fw={600}>{document.title}</Text>
                          <Text size="sm" c="dimmed">
                            Current version: {currentVersion?.fileName ?? "None"}
                          </Text>
                        </div>
                        {currentVersion ? <Badge color={statusColor(currentVersion.reviewStatus)}>{currentVersion.reviewStatus}</Badge> : null}
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value="audit" pt="md">
              <Text c="dimmed">Audit history will be expanded in the next slice.</Text>
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Stack>
    </Container>
  );
}

function UploadSessionPage() {
  const { sessionId } = useParams();
  const session = demoUploadSessions.find((entry) => entry.id === sessionId);
  const isValid = Boolean(session) && session?.status === "Active";

  return (
    <Container size="sm" py="xl">
      <Card withBorder radius="md" p="lg">
        <Title order={2}>Borrower Upload</Title>
        <Text c="dimmed" mt="xs">
          Secure upload link validation and document submission flow.
        </Text>
        <Badge mt="md" color={statusColor(session?.status ?? "Expired")}>
          {isValid ? "Ready" : "Expired / Invalid"}
        </Badge>
      </Card>
    </Container>
  );
}

export function App() {
  return (
    <AppShell header={{ height: 64 }} padding="md">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between">
            <Title order={3}>Condition Tracker</Title>
            <Group>
              <Button component={Link} to="/loans" variant="subtle">
                Loans
              </Button>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/loans/:loanId" element={<LoanDetailPage />} />
          <Route path="/upload/:sessionId" element={<UploadSessionPage />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
