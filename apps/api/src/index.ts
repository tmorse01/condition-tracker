import { createApp } from "./app.js";
import { runBackgroundJobs } from "./services/jobs.js";
import { seedDemoDocumentStorage } from "./services/storage.js";
import { state } from "./data.js";

setInterval(() => {
  runBackgroundJobs();
}, 30_000).unref();

const port = Number(process.env.PORT ?? 3001);
const app = createApp();

await seedDemoDocumentStorage(state.documentVersions);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
