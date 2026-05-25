import type { ReactNode } from "react";
import { AppShell, Button, Container, Group, Title } from "@mantine/core";
import { Link } from "react-router-dom";

export function AppShellLayout({ children }: { children: ReactNode }) {
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
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

