import "server-only";
import { cookies } from "next/headers";

/**
 * Server-side client for the Express API. Server Components call the backend
 * directly (not through the /api rewrite), forwarding the browser's session
 * cookie so the request is made as the signed-in user.
 *
 * Browser code keeps calling relative `/api/...` URLs, which next.config.ts
 * rewrites to the same backend.
 */

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

type Query = Record<string, string | number | undefined>;

function buildUrl(path: string, query?: Query) {
  const url = new URL(`/api${path}`, BACKEND_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
}

export async function api<T>(path: string, init: RequestInit & { query?: Query } = {}): Promise<T> {
  const { query, headers, ...rest } = init;
  const cookieHeader = (await cookies()).toString();

  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      accept: "application/json",
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(res.status, body?.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Like `api`, but resolves to null on 404 (e.g. for `notFound()` pages). */
export async function apiOrNull<T>(path: string, init?: RequestInit & { query?: Query }): Promise<T | null> {
  try {
    return await api<T>(path, init);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
