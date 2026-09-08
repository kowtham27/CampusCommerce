import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";
import { ALLOWED_EMAIL_DOMAIN } from "@/lib/constants";

const OTP_TTL_MINUTES = 10;

export class AuthError extends Error {}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function registerStudent(input: {
  fullName: string;
  email: string;
  password: string;
  department: string;
  year: string;
  phone?: string;
}) {
  if (!input.email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
    throw new AuthError(`Only @${ALLOWED_EMAIL_DOMAIN} emails can register.`);
  }

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AuthError("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      department: input.department,
      year: input.year,
      phone: input.phone || null,
    },
  });

  const code = await issueOtp(user.id);
  return { user, code };
}

export async function issueOtp(userId: string, purpose = "VERIFY_EMAIL") {
  const code = generateOtp();
  await prisma.otpCode.create({
    data: {
      userId,
      code,
      purpose,
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });
  // No real email provider is configured for this demo — the OTP is returned
  // directly to the caller (and shown in the UI) instead of being emailed.
  return code;
}

export async function verifyOtp(email: string, code: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AuthError("Invalid code. Please try again.");

  const otp = await prisma.otpCode.findFirst({
    where: {
      userId: user.id,
      code,
      purpose: "VERIFY_EMAIL",
      consumed: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) throw new AuthError("This code is invalid or has expired.");

  await prisma.$transaction([
    prisma.otpCode.update({ where: { id: otp.id }, data: { consumed: true } }),
    prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } }),
  ]);

  await createSession({ userId: user.id, role: user.role, tokenVersion: user.sessionVersion });
  return user;
}

export async function loginStudent(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Same generic error for "no such user" and "wrong password" so we don't
  // leak which college emails are registered.
  if (!user) throw new AuthError("Incorrect email or password.");
  if (user.status === "SUSPENDED") {
    throw new AuthError("This account has been suspended. Contact campus support.");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AuthError("Incorrect email or password.");

  if (!user.emailVerified) {
    const code = await issueOtp(user.id);
    return { needsVerification: true as const, code, user };
  }

  await createSession({ userId: user.id, role: user.role, tokenVersion: user.sessionVersion });
  return { needsVerification: false as const, user };
}

export async function logout() {
  await destroySession();
}
