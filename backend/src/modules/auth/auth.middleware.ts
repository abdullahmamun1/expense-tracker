import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Safe to call only in handlers mounted behind `requireAuth`, which already
// guarantees this is set — throwing here signals a route wired without the guard.
export function getUserId(req: Request): string {
  if (!req.session.userId) {
    throw new Error("getUserId called without an authenticated session");
  }
  return req.session.userId;
}
