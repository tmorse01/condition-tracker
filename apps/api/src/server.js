import { createServer } from "node:http";

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/loans") {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        data: [
          { id: "loan_1001", loanNumber: "BC-1001", borrowerName: "Taylor Custom Build" },
          { id: "loan_1002", loanNumber: "BC-1002", borrowerName: "Lakeview Townhomes" }
        ]
      })
    );
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not Found" }));
});

const port = Number(process.env.PORT ?? 3001);
server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
