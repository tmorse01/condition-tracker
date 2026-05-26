import { Badge, Button, Card, Group, Loader, Select, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { IconArrowRight, IconFilter, IconSearch } from "@tabler/icons-react";
import { useQueries } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { queryKeys } from "../hooks/queryKeys";
import { useLoansQuery } from "../hooks/queries";
import { getLoan } from "../services/api/loans";

export function LoansPage() {
  const { data: loans = [], isLoading } = useLoansQuery();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>("All");
  const bundleQueries = useQueries({
    queries: loans.map((loan) => ({ queryKey: queryKeys.loan(loan.id), queryFn: () => getLoan(loan.id) })),
  });
  const visibleLoans = loans.filter((loan) => {
    const matchText = `${loan.loanNumber} ${loan.borrowerName} ${loan.propertyAddress}`.toLowerCase().includes(search.toLowerCase());
    return matchText && (status === "All" || !status || loan.status === status);
  });

  return (
    <div className="page-surface">
      <Stack gap="lg">
        <Group justify="space-between" align="end">
          <div>
            <Text size="sm" c="indigo.7" fw={700}>LOANS</Text>
            <Title order={1} mt={4}>Loan records</Title>
            <Text c="dimmed">Find a borrower file, inspect requirements, or send a secure upload link.</Text>
          </div>
          <Badge size="lg" color="indigo" variant="light">{loans.length} active records</Badge>
        </Group>
        <Card withBorder radius="lg" p="lg">
          <Group mb="lg" grow>
            <TextInput
              label="Search"
              placeholder="Loan number, borrower, or address"
              leftSection={<IconSearch size={16} aria-hidden />}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
            />
            <Select label="Status" leftSection={<IconFilter size={16} aria-hidden />} value={status} onChange={setStatus} data={["All", "Active", "OnHold", "Closed"]} />
          </Group>
          {isLoading ? <Loader /> : (
            <Table highlightOnHover verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Loan</Table.Th>
                  <Table.Th>Borrower / property</Table.Th>
                  <Table.Th>Requirements</Table.Th>
                  <Table.Th>Updated</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {visibleLoans.map((loan) => {
                  const bundle = bundleQueries.find((query) => query.data?.loan.id === loan.id)?.data;
                  const openCount = bundle?.conditions.filter((condition) => condition.status !== "Satisfied").length ?? 0;
                  return (
                    <Table.Tr key={loan.id}>
                      <Table.Td><Text fw={600}>{loan.loanNumber}</Text></Table.Td>
                      <Table.Td>
                        <Text fw={500}>{loan.borrowerName}</Text>
                        <Text size="xs" c="dimmed">{loan.propertyAddress}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{openCount} open</Text>
                        <Text size="xs" c="dimmed">{bundle?.conditions.length ?? "-"} total</Text>
                      </Table.Td>
                      <Table.Td><Text size="sm">{new Date(loan.updatedAt).toLocaleDateString()}</Text></Table.Td>
                      <Table.Td><StatusBadge status={loan.status} /></Table.Td>
                      <Table.Td>
                        <Button component={Link} variant="light" to={`/loans/${loan.id}`} rightSection={<IconArrowRight size={16} aria-hidden />}>Open</Button>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          )}
          {!visibleLoans.length && !isLoading ? <Text ta="center" c="dimmed" py="xl">No loans match your search.</Text> : null}
        </Card>
      </Stack>
    </div>
  );
}
