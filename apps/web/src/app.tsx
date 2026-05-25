import { useEffect, useMemo, useState } from "react";
import { AppShell, Badge, Button, Card, Container, Group, Stack, Table, Tabs, Text, TextInput, Title } from "@mantine/core";
import { Link, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { demoConditions, demoDocuments, demoLoans, demoVersions } from "@condition-tracker/shared/demo-data";

const apiBase = "";

const statusColor = (status: string) => {
  if (status === "Satisfied" || status === "Approved" || status === "Used") return "green";
  if (status === "PendingReview" || status === "PendingUpload" || status === "Ready") return "yellow";
  if (status === "Rejected" || status === "NeedsMoreInfo" || status === "Expired Link" || status === "Invalid Link") return "red";
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
            <Button component={Link} to="/upload/session_2?token=token_2" variant="default">
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
  const { sessionId = "" } = useParams();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const [state, setState] = useState<"Validating" | "Invalid Link" | "Expired Link" | "Ready" | "Uploading" | "Upload Complete" | "Upload Failed">("Validating");
  const [session, setSession] = useState<{ loanId: string; status: string } | null>(null);
  const [conditionId, setConditionId] = useState("cond_1");
  const [title, setTitle] = useState("Insurance Certificate");
  const [fileName, setFileName] = useState("insurance.pdf");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setState("Validating");
      try {
        const response = await fetch(`${apiBase}/api/upload-sessions/${sessionId}/validate?token=${encodeURIComponent(token)}`);
        const json = await response.json();
        if (!active) return;
        setSession(json.data.session);
        setState(json.data.valid ? "Ready" : json.data.reason ?? "Invalid Link");
      } catch {
        if (active) setState("Invalid Link");
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [sessionId, token]);

  const validConditions = useMemo(
    () => demoConditions.filter((condition) => condition.loanId === (session?.loanId ?? "loan_1")),
    [session],
  );

  const submit = async () => {
    setState("Uploading");
    setMessage("");
    try {
      const form = new FormData();
      form.append("token", token);
      form.append("conditionId", conditionId);
      form.append("title", title);
      form.append("file", fileName);
      form.append("contentType", "application/pdf");
      const response = await fetch(`${apiBase}/api/upload-sessions/${sessionId}/documents`, { method: "POST", body: form });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Upload failed");
      setState("Upload Complete");
      setMessage(`Uploaded ${json.data.fileName} as version ${json.data.versionId}`);
      navigate(`/upload/${sessionId}?token=${encodeURIComponent(token)}`, { replace: true });
    } catch (error) {
      setState("Upload Failed");
      setMessage(error instanceof Error ? error.message : "Upload failed");
    }
  };

  const isReady = state === "Ready" || state === "Upload Complete" || state === "Upload Failed";

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Card withBorder radius="md" p="lg">
          <Title order={2}>Borrower Upload</Title>
          <Text c="dimmed" mt="xs">
            Secure upload link validation and document submission flow.
          </Text>
          <Badge mt="md" color={statusColor(state)}>
            {state}
          </Badge>
          {session ? (
            <Text size="sm" mt="sm" c="dimmed">
              Loan {session.loanId}
            </Text>
          ) : null}
          <Stack mt="md">
            <TextInput label="Condition ID" value={conditionId} onChange={(event) => setConditionId(event.currentTarget.value)} disabled={!isReady} />
            <TextInput label="Document Title" value={title} onChange={(event) => setTitle(event.currentTarget.value)} disabled={!isReady} />
            <TextInput label="File name" value={fileName} onChange={(event) => setFileName(event.currentTarget.value)} disabled={!isReady} />
            {validConditions.length ? (
              <Text size="sm" c="dimmed">
                Available conditions: {validConditions.map((condition) => condition.id).join(", ")}
              </Text>
            ) : null}
            <Button onClick={submit} disabled={state !== "Ready"}>
              Upload
            </Button>
            {message ? <Text size="sm">{message}</Text> : null}
          </Stack>
        </Card>
      </Stack>
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
