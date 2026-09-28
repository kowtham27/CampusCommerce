import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { loadUser } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";
import { accountRouter } from "./routes/account.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { cartRouter } from "./routes/cart.js";
import { conversationsRouter } from "./routes/conversations.js";
import { exchangesRouter } from "./routes/exchanges.js";
import { feedbackRouter } from "./routes/feedback.js";
import { notificationsRouter } from "./routes/notifications.js";
import { offersRouter } from "./routes/offers.js";
import { ordersRouter } from "./routes/orders.js";
import { productsRouter } from "./routes/products.js";
import { publicRouter } from "./routes/public.js";
import { rentalsRouter } from "./routes/rentals.js";
import { uploadsRouter } from "./routes/uploads.js";
import { usersRouter } from "./routes/users.js";
import { wishlistRouter } from "./routes/wishlist.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  // Behind the Next.js rewrite proxy (and any production load balancer).
  app.set("trust proxy", 1);

  // Uploaded photos are embedded by the frontend on another origin.
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: env.frontendUrl, credentials: true }));
  app.use(morgan(env.isProd ? "combined" : "dev"));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use("/uploads", express.static(env.uploadDir, { maxAge: "7d", immutable: true, index: false }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  const api = express.Router();
  api.use(loadUser);

  api.use(publicRouter);
  api.use("/auth", authRouter);
  api.use("/products", productsRouter);
  api.use("/users", usersRouter);
  api.use("/wishlist", wishlistRouter);
  api.use("/cart", cartRouter);
  api.use("/orders", ordersRouter);
  api.use("/offers", offersRouter);
  api.use("/rentals", rentalsRouter);
  api.use("/exchanges", exchangesRouter);
  api.use("/conversations", conversationsRouter);
  api.use("/notifications", notificationsRouter);
  api.use("/uploads", uploadsRouter);
  api.use("/admin", adminRouter);
  // Root-level routers (/me, /settings/*, /onboarding, /reviews, /reports)
  // guard per route, so unknown /api paths still fall through to a 404.
  api.use(feedbackRouter);
  api.use(accountRouter);

  app.use("/api", api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
