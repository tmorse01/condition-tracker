import { Paper, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";

const previewUrl = (versionId: string) => `/api/document-versions/${versionId}/preview`;

function usePreviewBlobUrl(versionId: string) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    let active = true;
    let nextUrl: string | null = null;
    setLoadState("loading");

    void (async () => {
      try {
        const response = await fetch(previewUrl(versionId));
        console.info("[PdfPreview] fetch", { versionId, status: response.status, contentType: response.headers.get("content-type") });
        if (!response.ok) {
          if (active) setLoadState("error");
          return;
        }
        const blob = await response.blob();
        console.info("[PdfPreview] blob", { versionId, size: blob.size, type: blob.type });
        nextUrl = URL.createObjectURL(blob);
        if (active) setBlobUrl(nextUrl);
        else URL.revokeObjectURL(nextUrl);
        if (active) setLoadState("loaded");
      } catch (error) {
        console.warn("[PdfPreview] preview load failed", { versionId, error });
        if (active) setLoadState("error");
      }
    })();

    return () => {
      active = false;
      if (nextUrl) URL.revokeObjectURL(nextUrl);
      setBlobUrl(null);
      setLoadState("loading");
    };
  }, [versionId]);

  return { blobUrl, loadState };
}

export function PdfPreview({ versionId, title }: { versionId: string; title: string }) {
  const { blobUrl, loadState } = usePreviewBlobUrl(versionId);
  return (
    <Paper withBorder radius="lg" p="xs" bg="gray.0">
      {blobUrl ? (
        <iframe className="document-frame" title={`${title} preview`} src={blobUrl} />
      ) : (
        <div className="document-frame" style={{ display: "grid", placeItems: "center", background: "#2f2f2f", color: "#fff" }}>
          <Text size="sm">{loadState === "error" ? "Preview failed to load" : "Loading PDF preview..."}</Text>
        </div>
      )}
    </Paper>
  );
}

export function PdfThumbnail({ versionId, label }: { versionId: string; label: string }) {
  const { blobUrl } = usePreviewBlobUrl(versionId);
  return (
    <Stack gap={6}>
      <div className="pdf-thumbnail">
        {blobUrl ? <iframe title={`${label} thumbnail`} src={blobUrl} tabIndex={-1} /> : null}
      </div>
      <Text size="xs" c="dimmed" lineClamp={1}>{label}</Text>
    </Stack>
  );
}
