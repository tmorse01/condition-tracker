import { Alert, Button, Card, Group, Loader, Select, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle, IconCircleCheck, IconUpload } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PdfDropzone } from "../components/PdfDropzone";
import { StatusBadge } from "../components/StatusBadge";
import { queryKeys } from "../hooks/queryKeys";
import { useUploadSessionValidationQuery } from "../hooks/queries";
import { uploadSessionDocument } from "../services/api/upload-sessions";

export function UploadSessionPage() {
  const { sessionId = "" } = useParams();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const queryClient = useQueryClient();
  const { data, isLoading } = useUploadSessionValidationQuery(sessionId, token);
  const [conditionId, setConditionId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!conditionId && data?.eligibleConditions[0]) setConditionId(data.eligibleConditions[0].id);
  }, [conditionId, data]);

  const selectedCondition = data?.eligibleConditions.find((condition) => condition.id === conditionId);
  const upload = useMutation({
    mutationFn: () => {
      if (!file || !selectedCondition) throw new Error("Select a requirement and PDF before uploading.");
      return uploadSessionDocument(sessionId, { token, conditionId: selectedCondition.id, title: selectedCondition.title, file });
    },
    onSuccess: async () => {
      setComplete(true);
      setMessage("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.uploadSessionValidation(sessionId, token) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.loans });
      if (data?.session?.loanId) await queryClient.invalidateQueries({ queryKey: queryKeys.loan(data.session.loanId) });
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : "Upload failed. Please try again."),
  });

  const state = isLoading ? "Validating" : complete || data?.reason === "Upload Complete" ? "Complete" : upload.isPending ? "Uploading" : data?.valid ? "Ready" : data?.reason ?? "Invalid Link";

  if (isLoading) {
    return <Stack align="center" py={80}><Loader color="indigo" /><Text>Checking your secure upload link...</Text></Stack>;
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "38px 24px 56px" }}>
      <Card withBorder radius="lg" p={{ base: "lg", sm: "xl" }}>
        <Stack gap="lg">
          <Group justify="space-between" align="start">
            <div>
              <Text size="sm" fw={700} c="indigo.7">DOCUMENT REQUEST</Text>
              <Title order={1} mt={6}>Upload requested document</Title>
              <Text c="dimmed" mt="xs">
                {data?.loan ? `${data.loan.borrowerName} - Loan ${data.loan.loanNumber}` : "Secure borrower upload"}
              </Text>
            </div>
            <StatusBadge status={state} />
          </Group>

          {state === "Complete" ? (
            <Alert color="green" variant="light" title="Upload complete" icon={<IconCircleCheck size={20} aria-hidden />}>
              Your PDF has been delivered securely for review. No additional action is needed for this link.
            </Alert>
          ) : null}
          {!data?.valid && state !== "Complete" ? (
            <Alert color="red" variant="light" title="This upload link is unavailable" icon={<IconAlertCircle size={20} aria-hidden />}>
              {data?.reason === "Expired Link" ? "This secure link has expired. Please request a new link from your loan contact." : "This link is invalid or no longer available."}
            </Alert>
          ) : null}

          {data?.valid && !complete ? (
            <>
              <Select
                label="Document requirement"
                description="Choose the outstanding item covered by your PDF."
                value={conditionId}
                onChange={setConditionId}
                data={data.eligibleConditions.map((condition) => ({ value: condition.id, label: condition.title }))}
                disabled={upload.isPending}
                placeholder="Select a requirement"
              />
              {selectedCondition ? <Text size="sm" c="dimmed">{selectedCondition.description}</Text> : null}
              <PdfDropzone file={file} onChange={setFile} onError={setMessage} disabled={upload.isPending} />
              {message ? <Alert color="red" variant="light" icon={<IconAlertCircle size={20} aria-hidden />}>{message}</Alert> : null}
              <Button size="md" leftSection={<IconUpload size={16} aria-hidden />} onClick={() => upload.mutate()} loading={upload.isPending} disabled={!file || !selectedCondition}>
                Submit PDF securely
              </Button>
            </>
          ) : null}

          <Text size="xs" c="dimmed">
            Files are transmitted securely and attached to your loan condition history. PDF only, maximum file size 10 MB.
          </Text>
        </Stack>
      </Card>
    </div>
  );
}
