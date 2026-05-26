import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createApp } from "../src/app.js";
import type { Document, DocumentVersion, Loan } from "@condition-tracker/shared";

const pick = <T>(items: T[], predicate: (item: T) => boolean) => {
  const item = predicate ? items.find(predicate) : items[0];
  assert.ok(item, "Expected seeded data to be present");
  return item;
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

    const clientRoute = await fetch(`${baseUrl}/loans/11111111-1111-4111-8111-111111111111`);
    assert.equal(clientRoute.status, 200);
    assert.match(await clientRoute.text(), /frontend/);
  });

  await withServer(webDistDirectory, async (baseUrl) => {
    const loans = await fetch(`${baseUrl}/api/loans`);
    const loansBody = await loans.json();
    assert.equal(loans.status, 200);
    assert.equal(loansBody.data.length, 2);

    const loanRecord = pick(loansBody.data as Loan[], (loan) => loan.loanNumber === "BC-1001");

    const loan = await fetch(`${baseUrl}/api/loans/${loanRecord.id}`);
    assert.equal(loan.status, 200);
    const loanBody = await loan.json();
    const documentRecord = pick(loanBody.data.documents as Document[], (document) => document.title === "Borrower Bank Statements");
    const versionRecord = pick(loanBody.data.documentVersions as DocumentVersion[], (version) => version.documentId === documentRecord.id && version.versionNumber === 2);

    const document = await fetch(`${baseUrl}/api/documents/${documentRecord.id}`);
    assert.equal(document.status, 200);

    const review = await fetch(`${baseUrl}/api/document-versions/${versionRecord.id}/reject`, {
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
