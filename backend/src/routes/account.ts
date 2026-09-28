import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { authUser, parse } from "../lib/http.js";
import { destroySession } from "../lib/session.js";
import { toSelfUser } from "../lib/users.js";
import { onboardingSchema } from "../lib/validation.js";
import { requireUser } from "../middleware/auth.js";
import { getCartCount, getCartProductIds } from "../services/cartService.js";
import { getSavedProductIds } from "../services/wishlistService.js";

/** The signed-in user's own account: profile, onboarding, settings, nav badges. */
export const accountRouter = Router();

const accountSchema = z.object({
  fullName: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().regex(/^[0-9]{10}$/).optional().or(z.literal("")),
  department: z.string().trim().optional(),
  year: z.string().trim().optional(),
  bio: z.string().trim().max(300).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

const preferencesSchema = z.object({
  notifyMessages: z.boolean().optional(),
  notifyOffers: z.boolean().optional(),
  notifyOrders: z.boolean().optional(),
  notifyRecs: z.boolean().optional(),
  profileVisible: z.boolean().optional(),
  contactVisible: z.boolean().optional(),
});

accountRouter.get("/me", requireUser, (req, res) => {
  res.json(toSelfUser(authUser(req)));
});

/** Product ids the user has saved / carted, for heart and cart toggles on product cards. */
accountRouter.get("/me/collections", requireUser, async (req, res) => {
  const user = authUser(req);
  const [savedIds, cartIds] = await Promise.all([getSavedProductIds(user.id), getCartProductIds(user.id)]);
  res.json({ savedIds, cartIds });
});

/** Everything the navbar needs in one round trip. */
accountRouter.get("/me/nav", requireUser, async (req, res) => {
  const user = authUser(req);
  const [notifications, unreadMessages, cartCount] = await Promise.all([
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.message.count({
      where: {
        read: false,
        senderId: { not: user.id },
        conversation: { OR: [{ participantAId: user.id }, { participantBId: user.id }] },
      },
    }),
    getCartCount(user.id),
  ]);
  res.json({ notifications, unreadMessages, cartCount });
});

accountRouter.get("/me/listings", requireUser, async (req, res) => {
  const user = authUser(req);
  const listings = await prisma.product.findMany({
    where: { sellerId: user.id, status: { not: "REMOVED" } },
    include: {
      images: { orderBy: { position: "asc" } },
      _count: { select: { offers: { where: { status: "PENDING" } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(listings.map(({ _count, ...p }) => ({ ...p, pendingOffers: _count.offers })));
});

accountRouter.post("/onboarding", requireUser, async (req, res) => {
  const data = parse(onboardingSchema, req.body);
  await prisma.user.update({
    where: { id: authUser(req).id },
    data: { ...data, onboarded: true },
  });
  res.json({ ok: true });
});

accountRouter.patch("/settings/account", requireUser, async (req, res) => {
  const data = parse(accountSchema, req.body, "Invalid input");
  const updated = await prisma.user.update({
    where: { id: authUser(req).id },
    data: { ...data, phone: data.phone || undefined },
  });
  res.json({ id: updated.id });
});

accountRouter.patch("/settings/password", requireUser, async (req, res) => {
  const user = authUser(req);
  const { currentPassword, newPassword } = parse(passwordSchema, req.body, "Invalid input");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(400).json({ error: "Current password is incorrect." });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  res.json({ ok: true });
});

accountRouter.patch("/settings/preferences", requireUser, async (req, res) => {
  const data = parse(preferencesSchema, req.body, "Invalid input");
  await prisma.user.update({ where: { id: authUser(req).id }, data });
  res.json({ ok: true });
});

/** Invalidates every existing session token by bumping sessionVersion. */
accountRouter.post("/settings/logout-all", requireUser, async (req, res) => {
  await prisma.user.update({
    where: { id: authUser(req).id },
    data: { sessionVersion: { increment: 1 } },
  });
  destroySession(res);
  res.json({ ok: true });
});
