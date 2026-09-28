import type { Request } from "express";
import type { ZodType } from "zod";

/** An error with an HTTP status; the error handler turns it into `{ error }` JSON. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/**
 * Validates `data` against `schema`, throwing a 400 with the first issue's
 * message (or `fallbackMessage`, when given) on failure.
 */
export function parse<T>(schema: ZodType<T>, data: unknown, fallbackMessage?: string): T {
  const result = schema.safeParse(data ?? {});
  if (!result.success) {
    throw new HttpError(400, fallbackMessage ?? result.error.issues[0]?.message ?? "Invalid input");
  }
  return result.data;
}

/** The signed-in user; only call behind `requireUser`/`requireAdmin`. */
export function authUser(req: Request) {
  if (!req.user) throw new HttpError(401, "Not authenticated");
  return req.user;
}

export function queryString(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function queryNumber(req: Request, key: string): number | undefined {
  const value = queryString(req, key);
  if (value == null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
