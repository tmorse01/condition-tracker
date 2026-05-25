import { Badge, Button, Card, Container, Group, Loader, Paper, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
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
        <Paper
          withBorder
          radius="xl"
          p="xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(17, 24, 39, 0.96) 0%, rgba(31, 41, 55, 0.94) 48%, rgba(34, 102, 63, 0.94) 100%)",
            color: "white",
            boxShadow: "0 24px 70px rgba(15, 23, 42, 0.18)",
          }}
        >
          <Group justify="space-between" align="start" wrap="wrap">
            <Stack gap="sm" maw={660}>
              <Badge variant="light" color="lime" size="lg">
                Construction-loan workflow OS
              </Badge>
              <Title order={1} c="white">
                ConditionFlow keeps uploads, reviews, and approvals moving.
              </Title>
              <Text c="rgba(255,255,255,0.78)" size="lg">
                Secure borrower uploads, clean internal review, and full condition history in one operational workspace.
              </Text>
              <Group gap="xs">
                <Button component={Link} to="/loans" size="md" color="lime">
                  Open review queue
                </Button>
                <Button component={Link} to="/upload/session_2?token=token_2" size="md" variant="white" color="dark">
                  Demo upload link
                </Button>
              </Group>
            </Stack>
            <Card radius="lg" p="lg" withBorder style={{ minWidth: 260, background: "rgba(255,255,255,0.08)", color: "white" }}>
              <Text size="sm" c="rgba(255,255,255,0.72)">
                Demo snapshot
              </Text>
              <Stack mt="md" gap="sm">
                <Group justify="space-between">
                  <Text size="sm">Open loans</Text>
                  <Text fw={700}>{loansQuery.data?.length ?? 0}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Pending reviews</Text>
                  <Text fw={700}>{pendingReviews.length}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Recent uploads</Text>
                  <Text fw={700}>{recentUploads.length}</Text>
                </Group>
              </Stack>
            </Card>
          </Group>
          {loansQuery.isLoading ? <Loader mt="md" color="lime" /> : null}
        </Paper>

        <SimpleGrid cols={{ base: 1, md: 3 }}>
          <Card withBorder radius="md" p="lg">
            <Group justify="space-between" align="center">
              <Title order={4}>Recent loans</Title>
              <Badge variant="light">Queue</Badge>
            </Group>
            <Stack mt="md" gap="xs">
              {(loansQuery.data ?? []).slice(0, 3).map((loan) => (
                <Group key={loan.id} justify="space-between" align="center">
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
            <Group justify="space-between" align="center">
              <Title order={4}>Pending reviews</Title>
              <Badge variant="light" color="yellow">
                Action needed
              </Badge>
            </Group>
            <Stack mt="md" gap="xs">
              {pendingReviews.map((condition) => (
                <Group key={condition.id} justify="space-between" align="center">
                  <div>
                    <Text fw={600}>{condition.title}</Text>
                    <Text size="sm" c="dimmed">
                      Loan {condition.loanNumber}
                    </Text>
                  </div>
                  <Button component={Link} to={`/conditions/${condition.id}`} variant="light">
                    Open
                  </Button>
                </Group>
              ))}
              {!pendingReviews.length ? (
                <Text size="sm" c="dimmed">
                  No conditions waiting on review right now.
                </Text>
              ) : null}
            </Stack>
          </Card>
          <Card withBorder radius="md" p="lg">
            <Group justify="space-between" align="center">
              <Title order={4}>Recent uploads</Title>
              <Badge variant="light" color="green">
                Activity
              </Badge>
            </Group>
            <Stack mt="md" gap="xs">
              {recentUploads.map((version) => (
                <Group key={version.id} justify="space-between" align="center">
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
          <Table mt="md" highlightOnHover verticalSpacing="sm">
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
                  <Table.Td>
                    <StatusBadge status={loan.status} />
                  </Table.Td>
                  <Table.Td>
                    <Button component={Link} to={`/loans/${loan.id}`} variant="subtle">
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
