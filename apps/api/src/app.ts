import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { apiRouter } from "./routes/api-router.js";
import { errorHandler } from "./middleware/error-handler.js";

export const createApp = (webDistDirectory = resolveWebDistDirectory()): express.Express => {
  const app = express();

  app.use(express.json());
  app.use("/api", apiRouter);
  app.use(errorHandler);
  app.use(express.static(webDistDirectory));

  app.get("*", (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }
    if (req.path.startsWith("/api")) {
      return next();
    }

    const webIndexPath = path.join(webDistDirectory, "index.html");
    if (!existsSync(webIndexPath)) {
      return res.status(500).json({ error: "Web build not found" });
    }

    return res.sendFile(webIndexPath);
  });

  return app;
};

export function resolveWebDistDirectory() {
  const candidates = [
    path.resolve(process.cwd(), "../web/dist"),
    path.resolve(process.cwd(), "apps/web/dist"),
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../../apps/web/dist",
    ),
  ];

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "index.html"))) {
      return candidate;
    }
  }

  return candidates[0] ?? path.resolve(process.cwd(), "../web/dist");
}
