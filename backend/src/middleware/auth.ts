import type { NextFunction, Request, Response } from "express";
import type { User } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { readSession } from "../lib/session.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Resolves the session cookie to a user on every request. Suspended users and
 * sessions revoked via "log out everywhere" (sessionVersion bump) are treated
 * as signed out.
 */
export async function loadUser(req: Request, _res: Response, next: NextFunction) {
  const session = await readSession(req);
  if (session) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (user && user.status !== "SUSPENDED" && user.sessionVersion === session.tokenVersion) {
      req.user = user;
    }
  }
  next();
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
