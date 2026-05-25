import { Button, Card, Container, Group, Loader, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { useLoansQuery } from "../hooks/queries";
import { queryKeys } from "../hooks/queryKeys";
import type { LoanBundle } from "../lib/api-types";
import { getLoan } from "../services/api/loans";

export function DashboardPage() {
  const loansQuery = useLoansQuery();
  const loanBundles = useQueries({
    queries: (loansQuery.data ?? []).map((loan) => ({
      queryKey: queryKeys.loan(loan.id),
      queryFn: () => getLoan(loan.id),
      enabled: Boolean(loan.id),
    })),
  });
  const bundles = loanBundles.map((query) => query.data).filter((bundle): bundle is LoanBundle => Boolean(bundle));
  const pendingReviews = bundles.flatMap((bundle) =>
    bundle.conditions.filter((condition) => condition.status === "PendingReview").map((condition) => ({ ...condition, loanNumber: bundle.loan.loanNumber })),
  );
  const recentUploads = bundles
    .flatMap((bundle) =>
      bundle.documentVersions.map((version) => ({
        ...version,
        loanNumber: bundle.loan.loanNumber,
        documentTitle: bundle.documents.find((document) => document.id === version.documentId)?.title ?? "Document",
      })),
    )
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .slice(0, 5);

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Card withBorder radius="md" p="lg">
          <Group justify="space-between" align="start">
            <div>
              <Title order={1}>Condition Tracker</Title>
              <Text c="dimmed" mt="xs">
                Lightweight construction-loan document workflow platform.
              </Text>
            </div>
            <Button component={Link} to="/loans">
              View loans
            </Button>
          </Group>
          {loansQuery.isLoading ? <Loader mt="md" /> : null}
        </Card>
        <SimpleGrid cols={{ base: 1, md: 3 }}>
          <Card withBorder radius="md" p="lg">
            <Title order={4}>Recent loans</Title>
            <Stack mt="md" gap="xs">
              {(loansQuery.data ?? []).slice(0, 3).map((loan) => (
                <Group key={loan.id} justify="space-between">
                  <div>
                    <Text fw={600}>{loan.loanNumber}</Text>
                    <Text size="sm" c="dimmed">
                      {loan.borrowerName}
                    </Text>
                  </div>
                  <StatusBadge status={loan.status} />
                </Group>
              ))}
            </Stack>
          </Card>
          <Card withBorder radius="md" p="lg">
            <Title order={4}>Pending reviews</Title>
            <Stack mt="md" gap="xs">
              {pendingReviews.map((condition) => (
                <Group key={condition.id} justify="space-between">
                  <div>
                    <Text fw={600}>{condition.title}</Text>
                    <Text size="sm" c="dimmed">
                      Loan {condition.loanNumber}
                    </Text>
                  </div>
                  <Button component={Link} to={`/conditions/${condition.id}`} variant="subtle">
                    Open
                  </Button>
                </Group>
              ))}
            </Stack>
          </Card>
          <Card withBorder radius="md" p="lg">
            <Title order={4}>Recent uploads</Title>
            <Stack mt="md" gap="xs">
              {recentUploads.map((version) => (
                <Group key={version.id} justify="space-between">
                  <div>
                    <Text fw={600}>{version.fileName}</Text>
                    <Text size="sm" c="dimmed">
                      {version.documentTitle} on Loan {version.loanNumber}
                    </Text>
                  </div>
                  <StatusBadge status={version.reviewStatus} />
                </Group>
              ))}
            </Stack>
          </Card>
        </SimpleGrid>
        <Card withBorder radius="md" p="lg">
          <Group justify="space-between">
            <Title order={4}>Loans</Title>
            <Button component={Link} to="/loans" variant="default">
              Open list
            </Button>
          </Group>
          <Table mt="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Loan</Table.Th>
                <Table.Th>Borrower</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(loansQuery.data ?? []).map((loan) => (
                <Table.Tr key={loan.id}>
                  <Table.Td>{loan.loanNumber}</Table.Td>
                  <Table.Td>{loan.borrowerName}</Table.Td>
                  <Table.Td><StatusBadge status={loan.status} /></Table.Td>
                  <Table.Td>
                    <Button component={Link} to={`/loans/${loan.id}`} variant="subtle">
                      Open
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Group mt="md">
            <Button component={Link} to="/upload/session_2?token=token_2" variant="default">
              Demo upload link
            </Button>
          </Group>
        </Card>
      </Stack>
    </Container>
  );
}
