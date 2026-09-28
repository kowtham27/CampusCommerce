import crypto from "node:crypto";
import fs from "node:fs";
import { Router } from "express";
import multer from "multer";
import { env } from "../config/env.js";
import { HttpError } from "../lib/http.js";
import { requireUser } from "../middleware/auth.js";

export const MAX_UPLOAD_FILES = 6;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

fs.mkdirSync(env.uploadDir, { recursive: true });

// Files are renamed to random ids so user-supplied names never reach the disk.
const upload = multer({
  storage: multer.diskStorage({
    destination: env.uploadDir,
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${EXTENSIONS[file.mimetype]}`),
  }),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: MAX_UPLOAD_FILES },
  fileFilter: (_req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) cb(null, true);
    else cb(new HttpError(400, "Only JPEG, PNG, WebP, GIF or AVIF images can be uploaded."));
  },
});

export const uploadsRouter = Router();

/** POST /api/uploads (multipart, field "photos") → { urls: ["/uploads/<id>.jpg", ...] } */
uploadsRouter.post("/", requireUser, upload.array("photos", MAX_UPLOAD_FILES), (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw new HttpError(400, "Add at least one photo.");
  res.status(201).json({ urls: files.map((f) => `/uploads/${f.filename}`) });
});
