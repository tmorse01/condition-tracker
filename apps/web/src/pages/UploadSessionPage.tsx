import { Button, Card, Container, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { useUploadSessionValidationQuery } from "../hooks/queries";
import { queryKeys } from "../hooks/queryKeys";
import { uploadSessionDocument } from "../services/api/upload-sessions";
import { demoConditions } from "@condition-tracker/shared/demo-data";

export function UploadSessionPage() {
  const { sessionId = "" } = useParams();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const queryClient = useQueryClient();
  const { data } = useUploadSessionValidationQuery(sessionId, token);
  const [conditionId, setConditionId] = useState("cond_1");
  const [title, setTitle] = useState("Insurance Certificate");
  const [fileName, setFileName] = useState("insurance.pdf");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () => uploadSessionDocument(sessionId, { token, conditionId, title, fileName, contentType: "application/pdf" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.uploadSessionValidation(sessionId, token) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.loans });
      if (data?.session?.loanId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.loan(data.session.loanId) });
      }
    },
  });

  const state = mutation.isPending
    ? "Uploading"
    : data?.valid
      ? "Ready"
      : data?.reason === "Upload Complete"
        ? "Complete"
        : data?.reason ?? "Validating";
  const isReady = data?.valid ?? false;

  const validConditions = useMemo(
    () => demoConditions.filter((condition) => condition.loanId === (data?.session?.loanId ?? "loan_1")),
    [data],
  );

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Card withBorder radius="md" p="lg">
          <Group justify="space-between" align="start">
            <div>
              <Title order={2}>Borrower Upload</Title>
              <Text c="dimmed" mt="xs">Secure upload link validation and document submission flow.</Text>
            </div>
            <Button component={Link} to="/loans" variant="default">Loans</Button>
          </Group>
          <StatusBadge status={state} />
          {data?.session ? <Text size="sm" mt="sm" c="dimmed">Loan {data.session.loanId}</Text> : null}
          <Stack mt="md">
            <TextInput label="Condition ID" value={conditionId} onChange={(event) => setConditionId(event.currentTarget.value)} disabled={!isReady} />
            <TextInput label="Document Title" value={title} onChange={(event) => setTitle(event.currentTarget.value)} disabled={!isReady} />
            <TextInput label="File name" value={fileName} onChange={(event) => setFileName(event.currentTarget.value)} disabled={!isReady} />
            {validConditions.length ? <Text size="sm" c="dimmed">Available conditions: {validConditions.map((condition) => condition.id).join(", ")}</Text> : null}
            <Button
              onClick={async () => {
                setMessage("");
                try {
                  const result = await mutation.mutateAsync();
                  setMessage(`Uploaded ${result.fileName} as version ${result.versionId}`);
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Upload failed");
                }
              }}
              loading={mutation.isPending}
              disabled={!isReady || state === "Complete"}
            >
              Upload
            </Button>
            {message ? <Text size="sm">{message}</Text> : null}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
