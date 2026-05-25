import { Alert, Badge, Button, Card, Checkbox, Group, Loader, Paper, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { queryKeys } from "../hooks/queryKeys";
import { useLoansQuery } from "../hooks/queries";
import type { LoanBundle } from "../lib/api-types";
import { reviewCondition } from "../services/api/conditions";
import { getLoan } from "../services/api/loans";

export function DashboardPage() {
  const loansQuery = useLoansQuery();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const loanBundles = useQueries({
    queries: (loansQuery.data ?? []).map((loan) => ({
      queryKey: queryKeys.loan(loan.id),
      queryFn: () => getLoan(loan.id),
      enabled: Boolean(loan.id),
    })),
  });
  const bundles = loanBundles.map((query) => query.data).filter((bundle): bundle is LoanBundle => Boolean(bundle));
  const pendingReviews = bundles.flatMap((bundle) =>
    bundle.conditions
      .filter((condition) => condition.status === "PendingReview")
      .map((condition) => {
        const latestLink = bundle.conditionDocuments
          .filter((link) => link.conditionId === condition.id)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
        const version = bundle.documentVersions.find((item) => item.id === latestLink?.documentVersionId);
        return { ...condition, loan: bundle.loan, version };
      })
      .filter((condition) => condition.version?.reviewStatus === "Pending"),
  );
  const outstandingUploads = bundles.flatMap((bundle) =>
    bundle.conditions.filter((condition) => condition.status === "PendingUpload" || condition.status === "NeedsMoreInfo"),
  );
  const activity = bundles
    .flatMap((bundle) => bundle.auditLog.map((entry) => ({ ...entry, loanNumber: bundle.loan.loanNumber })))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const bulkApprove = useMutation({
    mutationFn: async (conditionIds: string[]) => {
      const outcomes = await Promise.allSettled(
        conditionIds.map((conditionId) => reviewCondition(conditionId, { action: "Approved", reviewerName: "Avery Reviewer" })),
      );
      return outcomes.filter((outcome) => outcome.status === "rejected").length;
    },
    onSuccess: async (failedCount) => {
      await queryClient.invalidateQueries({ queryKey: ["loan"] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.loans });
      setMessage(failedCount ? `Approved ${selected.length - failedCount} items; ${failedCount} could not be approved.` : `Approved ${selected.length} document requests.`);
      setSelected([]);
    },
  });

  return (
    <div className="page-surface">
      <Stack gap="lg">
        <Group justify="space-between" align="end">
          <div>
            <Text size="sm" c="indigo.7" fw={700}>HOME</Text>
            <Title order={1} mt={4}>Document review workspace</Title>
            <Text c="dimmed">Review borrower submissions and keep construction-loan conditions moving.</Text>
          </div>
          <Button component={Link} to="/loans">Browse loans</Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Card withBorder radius="lg" p="lg">
            <Text size="sm" c="dimmed">Active loans</Text>
            <Title order={2} mt={6}>{loansQuery.data?.length ?? 0}</Title>
            <Text size="sm" c="dimmed">Open portfolio records</Text>
          </Card>
          <Card withBorder radius="lg" p="lg">
            <Text size="sm" c="dimmed">Pending review</Text>
            <Title order={2} mt={6}>{pendingReviews.length}</Title>
            <Text size="sm" c="dimmed">Documents ready for decision</Text>
          </Card>
          <Card withBorder radius="lg" p="lg">
            <Text size="sm" c="dimmed">Awaiting upload</Text>
            <Title order={2} mt={6}>{outstandingUploads.length}</Title>
            <Text size="sm" c="dimmed">Requests outstanding</Text>
          </Card>
        </SimpleGrid>

        <Paper withBorder radius="lg" p="lg">
          <Group justify="space-between" mb="md">
            <div>
              <Title order={3}>Pending approvals</Title>
              <Text size="sm" c="dimmed">Select pending documents to approve together. Rejections remain individual reviews.</Text>
            </div>
            <Button
              disabled={!selected.length}
              loading={bulkApprove.isPending}
              onClick={() => {
                setMessage("");
                bulkApprove.mutate(selected);
              }}
            >
              Approve selected ({selected.length})
            </Button>
          </Group>
          {message ? <Alert color="indigo" variant="light" mb="md">{message}</Alert> : null}
          {loansQuery.isLoading ? <Loader /> : null}
          <Table highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={44} />
                <Table.Th>Requirement</Table.Th>
                <Table.Th>Loan</Table.Th>
                <Table.Th>Document</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {pendingReviews.map((condition) => (
                <Table.Tr key={condition.id}>
                  <Table.Td>
                    <Checkbox
                      aria-label={`Select ${condition.title}`}
                      checked={selected.includes(condition.id)}
                      onChange={(event) => {
                        const checked = Boolean(event?.currentTarget?.checked);
                        setSelected((current) =>
                          checked ? [...current, condition.id] : current.filter((id) => id !== condition.id),
                        );
                      }}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text fw={600}>{condition.title}</Text>
                    <Text size="xs" c="dimmed">Due {new Date(condition.dueDate ?? "").toLocaleDateString()}</Text>
                  </Table.Td>
                  <Table.Td>{condition.loan.loanNumber}</Table.Td>
                  <Table.Td>{condition.version?.fileName ?? "No file"}</Table.Td>
                  <Table.Td><StatusBadge status={condition.status} /></Table.Td>
                  <Table.Td>
                    <Button component={Link} to={`/conditions/${condition.id}`} variant="subtle">Review</Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          {!pendingReviews.length && !loansQuery.isLoading ? (
            <Text size="sm" c="dimmed" ta="center" py="xl">There are no documents waiting for review.</Text>
          ) : null}
        </Paper>

        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Card withBorder radius="lg" p="lg">
            <Group justify="space-between" mb="md">
              <Title order={4}>Awaiting borrower upload</Title>
              <Badge color="indigo" variant="light">{outstandingUploads.length} open</Badge>
            </Group>
            <Stack gap="sm">
              {bundles.flatMap((bundle) =>
                bundle.conditions
                  .filter((condition) => condition.status === "PendingUpload" || condition.status === "NeedsMoreInfo")
                  .map((condition) => (
                    <Group key={condition.id} justify="space-between">
                      <div>
                        <Text size="sm" fw={600}>{condition.title}</Text>
                        <Text size="xs" c="dimmed">{bundle.loan.loanNumber} - {bundle.loan.borrowerName}</Text>
                      </div>
                      <StatusBadge status={condition.status} />
                    </Group>
                  )),
              )}
            </Stack>
          </Card>
          <Card withBorder radius="lg" p="lg">
            <Title order={4} mb="md">Recent activity</Title>
            <Stack gap="md">
              {activity.map((entry) => (
                <div key={entry.id}>
                  <Text size="sm" fw={600}>{entry.message}</Text>
                  <Text size="xs" c="dimmed">{entry.loanNumber} - {new Date(entry.createdAt).toLocaleString()}</Text>
                </div>
              ))}
            </Stack>
          </Card>
        </SimpleGrid>
      </Stack>
    </div>
  );
}
