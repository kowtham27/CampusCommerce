import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { parse } from "../lib/http.js";
import { createSession, destroySession } from "../lib/session.js";
import { loginSchema, registerSchema, verifyOtpSchema } from "../lib/validation.js";
import { AuthError, issueOtp, loginStudent, registerStudent, resetPassword, verifyEmail } from "../services/authService.js";

export const authRouter = Router();

const emailSchema = z.object({ email: z.string().trim().toLowerCase().email() });

const resetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8).max(72),
});

authRouter.post("/register", async (req, res) => {
  const input = parse(registerSchema, req.body);
  try {
    const { user, code } = await registerStudent(input);
    // Demo-only: no email provider is wired up, so the OTP is returned here
    // instead of being sent by email.
    res.json({ email: user.email, devOtp: code });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
});

authRouter.post("/verify", async (req, res) => {
  const { email, code } = parse(verifyOtpSchema, req.body);
  try {
    const user = await verifyEmail(email, code);
    await createSession(res, { userId: user.id, role: user.role, tokenVersion: user.sessionVersion });
    res.json({ id: user.id, onboarded: user.onboarded });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = parse(loginSchema, req.body);
  try {
    const result = await loginStudent(email, password);
    if (result.needsVerification) {
      res.json({ needsVerification: true, email: result.user.email, devOtp: result.code });
      return;
    }
    const { user } = result;
    await createSession(res, { userId: user.id, role: user.role, tokenVersion: user.sessionVersion });
    res.json({ needsVerification: false, onboarded: user.onboarded, role: user.role });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(401).json({ error: err.message });
      return;
    }
    throw err;
  }
});

authRouter.post("/logout", (_req, res) => {
  destroySession(res);
  res.json({ ok: true });
});

authRouter.post("/resend-otp", async (req, res) => {
  const { email } = parse(emailSchema, req.body, "Invalid email");
  const user = await prisma.user.findUnique({ where: { email } });
  // Don't reveal whether the account exists.
  if (!user) {
    res.json({ ok: true });
    return;
  }
  const code = await issueOtp(user.id);
  res.json({ ok: true, devOtp: code });
});

authRouter.post("/forgot-password", async (req, res) => {
  const { email } = parse(emailSchema, req.body, "Invalid email");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.json({ ok: true });
    return;
  }
  const code = await issueOtp(user.id, "RESET_PASSWORD");
  res.json({ ok: true, devOtp: code });
});

authRouter.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = parse(resetPasswordSchema, req.body);
  try {
    await resetPassword(email, code, newPassword);
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
});
