import type { Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { env } from "../config/env.js";

export const SESSION_COOKIE = "cc_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;
const secret = new TextEncoder().encode(env.sessionSecret);

export type SessionPayload = {
  userId: string;
  role: "STUDENT" | "ADMIN";
  tokenVersion: number;
};

export async function createSession(res: Response, payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS,
  });
}

export async function readSession(req: Request): Promise<SessionPayload | null> {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== "string" || !token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function destroySession(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}
