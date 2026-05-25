import { Button, Card, Container, Group, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";

export function DashboardPage() {
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

