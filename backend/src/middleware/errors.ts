import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import multer from "multer";
import { HttpError } from "../lib/http.js";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Not found" });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Each photo must be 5 MB or smaller."
        : err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE"
          ? "You can upload up to 6 photos."
          : err.message;
    res.status(400).json({ error: message });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Record not found / foreign key pointing at a missing row.
    if (err.code === "P2025") {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (err.code === "P2003") {
      res.status(400).json({ error: "Referenced record does not exist." });
      return;
    }
  }
  // Malformed JSON body from express.json().
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
};
