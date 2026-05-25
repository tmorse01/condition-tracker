import { createServer } from "node:http";
import { db } from "./data.js";

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");

  if (req.method === "GET" && url.pathname === "/health") {
    const response = json(200, { ok: true });
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    res.end(await response.text());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/loans") {
    const response = json(200, { data: db.loans });
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    res.end(await response.text());
    return;
  }

  const loanMatch = url.pathname.match(/^\/api\/loans\/([^/]+)$/);
  if (req.method === "GET" && loanMatch) {
    const loan = db.loans.find((item) => item.id === loanMatch[1]);
    if (!loan) {
      const response = json(404, { error: "Loan not found" });
      res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
      res.end(await response.text());
      return;
    }

    const response = json(200, {
      data: {
        loan,
        conditions: db.conditions.filter((condition) => condition.loanId === loan.id),
        documents: db.documents.filter((document) => document.loanId === loan.id),
        documentVersions: db.documentVersions.filter((version) =>
          db.documents.some((document) => document.id === version.documentId && document.loanId === loan.id),
        ),
        auditLog: db.auditLog.filter((entry) => entry.loanId === loan.id),
        notifications: db.notifications,
      },
    });
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    res.end(await response.text());
    return;
  }

  const sessionMatch = url.pathname.match(/^\/api\/upload-sessions\/([^/]+)\/validate$/);
  if (req.method === "GET" && sessionMatch) {
    const session = db.uploadSessions.find((item) => item.id === sessionMatch[1]);
    const valid =
      Boolean(session) &&
      session?.status === "Active" &&
      new Date(session.expiresAt).getTime() > Date.now();
    const response = json(200, {
      data: {
        sessionId: sessionMatch[1],
        valid,
        status: session?.status ?? "Expired",
      },
    });
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    res.end(await response.text());
    return;
  }

  const uploadMatch = url.pathname.match(/^\/api\/upload-sessions\/([^/]+)\/documents$/);
  if (req.method === "POST" && uploadMatch) {
    const response = json(202, {
      data: {
        sessionId: uploadMatch[1],
        accepted: true,
        note: "Multipart upload handling will be wired in the next slice.",
      },
    });
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    res.end(await response.text());
    return;
  }

  const response = json(404, { error: "Not Found" });
  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  res.end(await response.text());
});

const port = Number(process.env.PORT ?? 3001);
server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
