import { Badge, Button, Card, Container, Group, Loader, Stack, Table, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { useLoansQuery } from "../hooks/queries";

export function LoansPage() {
  const { data, isLoading } = useLoansQuery();

  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Group justify="space-between" align="end">
          <div>
            <Badge variant="light" color="lime" mb="xs">
              Portfolio
            </Badge>
            <Title order={2}>Loan workspace</Title>
            <Text c="dimmed">A clean view of borrowers, statuses, and what still needs attention.</Text>
          </div>
          <Button component={Link} to="/">
            Dashboard
          </Button>
        </Group>
        <Card withBorder radius="lg" p="lg">
          {isLoading ? (
            <Loader />
          ) : (
            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Loan</Table.Th>
                  <Table.Th>Borrower</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data?.map((loan) => (
                  <Table.Tr key={loan.id}>
                    <Table.Td>{loan.loanNumber}</Table.Td>
                    <Table.Td>{loan.borrowerName}</Table.Td>
                    <Table.Td>
                      <StatusBadge status={loan.status} />
                    </Table.Td>
                    <Table.Td>
                      <Button component={Link} variant="light" to={`/loans/${loan.id}`}>
                        Open
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Card>
      </Stack>
    </Container>
  );
}
