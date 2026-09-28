import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { SelfUser } from "@/types";

/** The signed-in user (deduplicated per request), or null when signed out. */
export const getCurrentUser = cache(async (): Promise<SelfUser | null> => {
  try {
    return await api<SelfUser>("/me");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
});

/** Product ids the signed-in user has wishlisted / carted, for card toggles. */
export const getCollections = cache(async () => {
  const { savedIds, cartIds } = await api<{ savedIds: string[]; cartIds: string[] }>("/me/collections");
  return { savedIds: new Set(savedIds), cartIds: new Set(cartIds) };
});

/**
 * Redirects non-admins away. Admin pages call this themselves because Next
 * renders layouts and pages in parallel — the admin layout's redirect alone
 * wouldn't stop a page from requesting admin-only data first.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
