import type { Prisma, User } from "@prisma/client";

/**
 * Fields of a user that any signed-in student may see (seller cards, chat
 * headers, reviews). Never includes credentials, contact details or preferences.
 */
export const PUBLIC_USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  department: true,
  year: true,
  hostelBlock: true,
  avatarUrl: true,
  bio: true,
  role: true,
  emailVerified: true,
  trustScore: true,
  responseRate: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

/** The signed-in user's own record, minus secrets. */
export function toSelfUser(user: User) {
  const { passwordHash: _passwordHash, sessionVersion: _sessionVersion, ...rest } = user;
  return rest;
}
