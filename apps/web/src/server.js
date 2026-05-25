import { createServer } from "node:http";

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Condition Tracker</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 40px; color: #1f2937; }
      .card { border: 1px solid #d1d5db; border-radius: 12px; padding: 20px; max-width: 720px; }
      .muted { color: #6b7280; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Condition Tracker</h1>
      <p class="muted">Borrower uploads and internal review workflow scaffold.</p>
      <p>Web app skeleton is live. Next step: wire real routes and data fetching.</p>
    </div>
  </body>
</html>`;

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => {
  console.log(`Web listening on http://localhost:${port}`);
});
