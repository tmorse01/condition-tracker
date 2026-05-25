export const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export const send = async (res: import("node:http").ServerResponse, response: Response) => {
  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  res.end(await response.text());
};

export const parseJsonBody = async (req: import("node:http").IncomingMessage) => {
  let raw = "";
  const decoder = new TextDecoder();
  for await (const chunk of req) raw += decoder.decode(chunk, { stream: true });
  raw += decoder.decode();
  return raw ? JSON.parse(raw) : {};
};

export const readBodyBytes = async (req: import("node:http").IncomingMessage) => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

export type MultipartField = {
  value?: string;
  fileName?: string;
  contentType?: string;
  bytes: Uint8Array;
};

export const parseMultipartFields = (rawBody: Uint8Array, contentType: string) => {
  const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
  if (!boundaryMatch) return {} as Record<string, MultipartField>;
  const boundary = `--${boundaryMatch[1]}`;
  const fields: Record<string, MultipartField> = {};
  const rawText = Buffer.from(rawBody).toString("latin1");

  for (const part of rawText.split(boundary)) {
    if (!part.includes("Content-Disposition")) continue;
    const nameMatch = part.match(/name="([^"]+)"/i);
    if (!nameMatch) continue;
    const headerEnd = part.indexOf("\r\n\r\n");
    if (headerEnd === -1) continue;
    const headers = part.slice(0, headerEnd);
    const fileName = headers.match(/filename="([^"]*)"/i)?.[1];
    const partContentType = headers.match(/Content-Type:\s*([^\r\n]+)/i)?.[1];
    const binaryContent = part.slice(headerEnd + 4).replace(/\r\n$/, "");
    const bytes = Buffer.from(binaryContent, "latin1");
    fields[nameMatch[1]] = fileName
      ? { fileName, contentType: partContentType, bytes }
      : { value: bytes.toString("utf8"), bytes };
  }

  return fields;
};
