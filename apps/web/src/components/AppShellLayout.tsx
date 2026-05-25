import type { ReactNode } from "react";
import { AppShell, Badge, Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";

export function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      header={{ height: 76 }}
      padding="md"
      styles={{
        main: {
          background:
            "radial-gradient(circle at top left, rgba(118, 189, 34, 0.08), transparent 34%), linear-gradient(180deg, #f7faf4 0%, #f5f7f2 100%)",
        },
      }}
    >
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between" align="center">
            <Group gap="sm">
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: "linear-gradient(135deg, #76bd22 0%, #1f8a4c 100%)",
                  boxShadow: "0 0 0 6px rgba(118, 189, 34, 0.12)",
                }}
              />
              <Stack gap={0}>
                <Title order={3}>ConditionFlow</Title>
                <Text size="xs" c="dimmed">
                  Construction-loan conditions, uploads, and review tracking
                </Text>
              </Stack>
            </Group>
            <Group gap="xs">
              <Badge variant="light" color="lime">
                Demo ready
              </Badge>
              <Button component={Link} to="/" variant="subtle">
                Dashboard
              </Button>
              <Button component={Link} to="/loans">
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
