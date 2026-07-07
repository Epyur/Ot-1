import { Request, Response, NextFunction } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers["x-admin-token"] as string | undefined;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    res.status(500).json({ error: "ADMIN_TOKEN is not configured on the server" });
    return;
  }

  if (!token || token !== adminToken) {
    res.status(403).json({ error: "Forbidden: invalid or missing admin token" });
    return;
  }

  next();
}