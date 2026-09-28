import "dotenv/config";
import path from "node:path";

const isProd = process.env.NODE_ENV === "production";

function sessionSecret() {
  const value = process.env.SESSION_SECRET;
  if (value) return value;
  if (isProd) throw new Error("SESSION_SECRET must be set in production.");
  return "dev-only-insecure-secret-change-me";
}

export const env = {
  isProd,
  port: Number(process.env.PORT ?? 4000),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  sessionSecret: sessionSecret(),
  allowedEmailDomain: process.env.ALLOWED_EMAIL_DOMAIN ?? "university.edu",
  uploadDir: path.resolve(process.env.UPLOAD_DIR ?? "uploads"),
};
