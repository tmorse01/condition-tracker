import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import { useRef, useState } from "react";

const maximumPdfBytes = 10 * 1024 * 1024;

export function PdfDropzone({
  file,
  disabled,
  onChange,
  onError,
}: {
  file: File | null;
  disabled?: boolean;
  onChange: (file: File | null) => void;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);

  const acceptFile = (next: File | undefined) => {
    if (!next) return;
    if (next.type !== "application/pdf" || !next.name.toLowerCase().endsWith(".pdf")) {
      onError("Please select a PDF file.");
      return;
    }
    if (next.size > maximumPdfBytes) {
      onError("PDF files must be 10 MB or smaller.");
      return;
    }
    onError("");
    onChange(next);
  };

  return (
    <Paper
      className="drop-area"
      data-active={active}
      radius="md"
      p="xl"
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setActive(false);
        if (!disabled) acceptFile(event.dataTransfer.files[0]);
      }}
      aria-disabled={disabled}
    >
      <input
        ref={inputRef}
        hidden
        type="file"
        accept="application/pdf,.pdf"
        disabled={disabled}
        onChange={(event) => acceptFile(event.currentTarget.files?.[0])}
      />
      <Stack align="center" gap="xs">
        <Text fw={600}>{file ? file.name : "Drag and drop your PDF here"}</Text>
        <Text size="sm" c="dimmed">
          {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected` : "One PDF document, up to 10 MB"}
        </Text>
        <Group>
          <Button type="button" variant="light" disabled={disabled}>
            {file ? "Replace file" : "Choose file"}
          </Button>
          {file ? (
            <Button
              type="button"
              variant="subtle"
              color="gray"
              onClick={(event) => {
                event.stopPropagation();
                onChange(null);
              }}
              disabled={disabled}
            >
              Remove
            </Button>
          ) : null}
        </Group>
      </Stack>
    </Paper>
  );
}
