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

export const readBody = async (req: import("node:http").IncomingMessage) => {
  let raw = "";
  const decoder = new TextDecoder();
  for await (const chunk of req) raw += decoder.decode(chunk, { stream: true });
  raw += decoder.decode();
  return raw;
};

export const parseMultipartFields = (rawBody: string, contentType: string) => {
  const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
  if (!boundaryMatch) return {};
  const boundary = `--${boundaryMatch[1]}`;
  const fields: Record<string, string> = {};

  for (const part of rawBody.split(boundary)) {
    if (!part.includes("Content-Disposition")) continue;
    const nameMatch = part.match(/name="([^"]+)"/i);
    if (!nameMatch) continue;
    const value = part.split("\r\n\r\n")[1]?.replace(/\r\n--?$/g, "").trim() ?? "";
    fields[nameMatch[1]] = value;
  }

  return fields;
};
