import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  void _next;
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  console.error("API request failed", error);
  return res.status(500).json({ error: "Internal Server Error" });
};
