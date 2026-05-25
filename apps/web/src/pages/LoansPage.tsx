import { Button, Card, Container, Group, Loader, Stack, Table, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { useLoansQuery } from "../hooks/queries";

export function LoansPage() {
  const { data, isLoading } = useLoansQuery();
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
          {isLoading ? (
            <Loader />
          ) : (
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
                {data?.map((loan) => (
                  <Table.Tr key={loan.id}>
                    <Table.Td>{loan.loanNumber}</Table.Td>
                    <Table.Td>{loan.borrowerName}</Table.Td>
                    <Table.Td>
                      <StatusBadge status={loan.status} />
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
          )}
        </Card>
      </Stack>
    </Container>
  );
}

