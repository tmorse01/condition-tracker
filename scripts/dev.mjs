import { spawn } from "node:child_process";

const root = process.cwd();
const healthUrl = "http://127.0.0.1:3001/api/health";

const spawnPackage = (args) =>
  spawn("pnpm", args, {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });

const waitForHealth = async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(healthUrl);
      if (response.ok) return;
    } catch {
      // keep waiting
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`API did not become healthy at ${healthUrl}`);
};

const api = spawnPackage(["--filter", "@condition-tracker/api", "dev"]);
await waitForHealth();
const web = spawnPackage(["--filter", "@condition-tracker/web", "dev"]);

const shutdown = () => {
  api.kill("SIGTERM");
  web.kill("SIGTERM");
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await Promise.race([
  new Promise((resolve) => api.on("exit", resolve)),
  new Promise((resolve) => web.on("exit", resolve)),
]);
