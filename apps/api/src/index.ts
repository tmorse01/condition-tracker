import { createApp } from "./app.js";
import { runBackgroundJobs } from "./services/jobs.js";
import { assertDatabaseReady, dbPool } from "./services/db.js";

const port = Number(process.env.PORT ?? 3001);
const app = createApp();

await assertDatabaseReady();

setInterval(() => {
  void runBackgroundJobs().catch((error) => console.error("Background jobs failed", error));
}, 30_000).unref();

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

const shutdown = async () => {
  await dbPool.end();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
