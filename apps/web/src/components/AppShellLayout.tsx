import type { ReactNode } from "react";
import { AppShell, Avatar, Badge, Button, Group, NavLink, Stack, Text, Title } from "@mantine/core";
import { IconBuilding, IconClipboardCheck, IconFileText, IconHome, IconShieldLock } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";

export function AppShellLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (location.pathname.startsWith("/upload/")) {
    return (
      <div className="borrower-shell">
        <header className="borrower-header">
          <Group gap="sm">
            <img className="brand-mark" src="/brand-icon.svg" alt="" aria-hidden />
            <div>
              <Text fw={700}>ConditionFlow</Text>
              <Text size="xs" c="dimmed">Secure document request</Text>
            </div>
          </Group>
          <Badge variant="light" color="indigo" leftSection={<IconShieldLock size={16} aria-hidden />}>Secure upload</Badge>
        </header>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 238, breakpoint: "sm", collapsed: { mobile: true } }}
      padding={0}
      className="workspace-shell"
    >
      <AppShell.Header>
        <Group h="100%" px={{ base: "md", sm: "lg" }} justify="space-between">
          <Group gap="sm">
            <img className="brand-mark" src="/brand-icon.svg" alt="" aria-hidden />
            <Title order={3}>ConditionFlow</Title>
          </Group>
          <Group gap="sm">
            <Button component={Link} to="/" variant="subtle" hiddenFrom="sm" leftSection={<IconHome size={16} aria-hidden />}>Home</Button>
            <Button component={Link} to="/loans" variant="light" hiddenFrom="sm" leftSection={<IconBuilding size={16} aria-hidden />}>Loans</Button>
            <Badge variant="light" color="indigo" visibleFrom="sm">Internal workspace</Badge>
            <Avatar color="indigo" radius="xl" size="sm">AR</Avatar>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Stack gap="xs" h="100%">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb="xs">Workspace</Text>
          <NavLink component={Link} to="/" label="Home" leftSection={<IconHome size={16} aria-hidden />} active={location.pathname === "/"} />
          <NavLink component={Link} to="/loans" label="Loans" leftSection={<IconBuilding size={16} aria-hidden />} active={location.pathname.startsWith("/loans")} />
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mt="lg" mb="xs">Review tools</Text>
          <NavLink label="Pending review" description="Approvals waiting" leftSection={<IconClipboardCheck size={16} aria-hidden />} active={location.pathname.startsWith("/conditions")} />
          <NavLink label="Documents" description="Version history" leftSection={<IconFileText size={16} aria-hidden />} active={location.pathname.startsWith("/documents")} />
          <div className="nav-assignment">
            <Text size="xs" c="dimmed">Assigned reviewer</Text>
            <Text fw={600} size="sm">Avery Reviewer</Text>
            <Text size="xs" c="dimmed" mt={6}>Construction lending operations</Text>
          </div>
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
