import type { UploadSessionValidationResponse } from "../../lib/api-types";
import { requestJson } from "./client";

export const validateUploadSession = (sessionId: string, token: string) =>
  requestJson<UploadSessionValidationResponse>(`/api/upload-sessions/${sessionId}/validate?token=${encodeURIComponent(token)}`);

export const uploadSessionDocument = async (
  sessionId: string,
  body: { token: string; conditionId: string; title: string; fileName: string; contentType: string },
) => {
  const form = new FormData();
  form.append("token", body.token);
  form.append("conditionId", body.conditionId);
  form.append("title", body.title);
  form.append("file", body.fileName);
  form.append("contentType", body.contentType);

  return requestJson<{ sessionId: string; conditionId: string; title: string; fileName: string; documentId: string; versionId: string; accepted: boolean }>(
    `/api/upload-sessions/${sessionId}/documents`,
    { method: "POST", body: form },
  );
};

