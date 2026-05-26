import { Router, type Router as ExpressRouter } from "express";

export const healthRouter: ExpressRouter = Router();

healthRouter.get("/", (_req, res) => {
  return res.status(200).json({ ok: true });
});
