import type { UploadSessionLink, UploadSessionValidationResponse } from "../../lib/api-types";
import { requestJson } from "./client";

export const createUploadSession = (loanId: string) =>
  requestJson<UploadSessionLink>(`/api/loans/${loanId}/upload-sessions`, { method: "POST" });

export const validateUploadSession = (sessionId: string, token: string) =>
  requestJson<UploadSessionValidationResponse>(`/api/upload-sessions/${sessionId}/validate?token=${encodeURIComponent(token)}`);

export const uploadSessionDocument = async (
  sessionId: string,
  body: { token: string; conditionId: string; title: string; file: File },
) => {
  const form = new FormData();
  form.append("token", body.token);
  form.append("conditionId", body.conditionId);
  form.append("title", body.title);
  form.append("file", body.file, body.file.name);

  return requestJson<{ sessionId: string; conditionId: string; title: string; fileName: string; documentId: string; versionId: string; accepted: boolean }>(
    `/api/upload-sessions/${sessionId}/documents`,
    { method: "POST", body: form },
  );
};
