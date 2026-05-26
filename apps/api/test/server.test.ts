import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createApp } from "../src/app.js";
import { state } from "../src/data.js";
import {
  demoAuditLog,
  demoConditions,
  demoConditionDocuments,
  demoDocuments,
  demoLoans,
  demoNotifications,
  demoUploadSessions,
  demoVersions,
} from "@condition-tracker/shared/demo-data";

const resetState = () => {
  state.loans = structuredClone(demoLoans);
  state.conditions = structuredClone(demoConditions);
  state.documents = structuredClone(demoDocuments);
  state.conditionDocuments = structuredClone(demoConditionDocuments);
  state.documentVersions = structuredClone(demoVersions);
  state.uploadSessions = structuredClone(demoUploadSessions);
  state.auditLog = structuredClone(demoAuditLog);
  state.notifications = structuredClone(demoNotifications);
};

const withServer = async (webDistDirectory: string, run: (baseUrl: string) => Promise<void>) => {
  const app = createApp(webDistDirectory);
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address === "object");
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
};

const main = async () => {
  resetState();

  const webDistDirectory = await mkdtemp(path.join(os.tmpdir(), "condition-tracker-web-"));
  await writeFile(path.join(webDistDirectory, "index.html"), "<!doctype html><html><body>frontend</body></html>");
  await mkdir(path.join(webDistDirectory, "assets"), { recursive: true });
  await writeFile(path.join(webDistDirectory, "assets", "app.js"), "console.log('hi')");

  await withServer(webDistDirectory, async (baseUrl) => {
    const health = await fetch(`${baseUrl}/api/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { ok: true });

    const notFound = await fetch(`${baseUrl}/api/does-not-exist`);
    assert.equal(notFound.status, 404);
    assert.deepEqual(await notFound.json(), { error: "Not Found" });

    const root = await fetch(`${baseUrl}/`);
    assert.equal(root.status, 200);
    assert.match(await root.text(), /frontend/);

    const clientRoute = await fetch(`${baseUrl}/loans/loan_1001`);
    assert.equal(clientRoute.status, 200);
    assert.match(await clientRoute.text(), /frontend/);
  });

  resetState();

  await withServer(webDistDirectory, async (baseUrl) => {
    const loans = await fetch(`${baseUrl}/api/loans`);
    const loansBody = await loans.json();
    assert.equal(loans.status, 200);
    assert.equal(loansBody.data.length, 2);

    const loan = await fetch(`${baseUrl}/api/loans/loan_1002`);
    assert.equal(loan.status, 200);

    const session = await fetch(`${baseUrl}/api/loans/loan_1002/upload-sessions`, { method: "POST" });
    assert.equal(session.status, 201);
    const sessionBody = await session.json();

    const validation = await fetch(
      `${baseUrl}/api/upload-sessions/${sessionBody.data.sessionId}/validate?token=${encodeURIComponent(sessionBody.data.token)}`,
    );
    assert.equal(validation.status, 200);

    const form = new FormData();
    form.append("token", sessionBody.data.token);
    form.append("conditionId", "cond_4");
    form.append("title", "Builder Contract");
    form.append("file", new File([new Uint8Array([37, 80, 68, 70])], "builder-contract.pdf", { type: "application/pdf" }));

    const upload = await fetch(`${baseUrl}/api/upload-sessions/${sessionBody.data.sessionId}/documents`, {
      method: "POST",
      body: form,
    });
    assert.equal(upload.status, 202);

    const review = await fetch(`${baseUrl}/api/document-versions/ver_4/reject`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ notes: "Needs a clearer scan", reviewerName: "Avery Reviewer" }),
    });
    assert.equal(review.status, 200);
  });
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
