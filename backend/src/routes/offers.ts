import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError, authUser, parse } from "../lib/http.js";
import { PUBLIC_USER_SELECT } from "../lib/users.js";
import { offerSchema } from "../lib/validation.js";
import { requireUser } from "../middleware/auth.js";
import { notify } from "../services/notificationService.js";
import { createOrder } from "../services/orderService.js";

export const offersRouter = Router();
offersRouter.use(requireUser);

const actionSchema = z.object({
  action: z.enum(["accept", "reject", "counter"]),
  counterAmount: z.number().int().positive().optional(),
});

const OFFER_PRODUCT = { include: { images: { orderBy: { position: "asc" as const } } } };

/** Offers received on the user's listings and offers the user has made. */
offersRouter.get("/", async (req, res) => {
  const userId = authUser(req).id;
  const [received, made] = await Promise.all([
    prisma.offer.findMany({
      where: { sellerId: userId },
      include: { product: OFFER_PRODUCT, buyer: { select: PUBLIC_USER_SELECT } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.offer.findMany({
      where: { buyerId: userId },
      include: { product: OFFER_PRODUCT, seller: { select: PUBLIC_USER_SELECT } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  res.json({ received, made });
});

offersRouter.post("/", async (req, res) => {
  const user = authUser(req);
  const data = parse(offerSchema, req.body);

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product || product.status !== "ACTIVE") throw new HttpError(404, "This listing is no longer available.");
  if (product.sellerId === user.id) throw new HttpError(400, "You can't make an offer on your own listing.");

  const offer = await prisma.offer.create({
    data: {
      productId: product.id,
      buyerId: user.id,
      sellerId: product.sellerId,
      amount: data.amount,
      message: data.message,
    },
  });
  await notify({
    userId: product.sellerId,
    type: "OFFER_RECEIVED",
    title: "New offer received",
    body: `${user.fullName} offered ₹${data.amount} on ${product.title}.`,
    link: "/offers",
  });

  res.status(201).json(offer);
});

/** Seller accepts (creating an order), rejects, or counters an offer. */
offersRouter.patch("/:id", async (req, res) => {
  const user = authUser(req);
  const { action, counterAmount } = parse(actionSchema, req.body, "Invalid input");

  const offer = await prisma.offer.findUnique({ where: { id: req.params.id }, include: { product: true } });
  if (!offer) throw new HttpError(404, "Offer not found");
  if (offer.sellerId !== user.id) throw new HttpError(403, "You can't act on this offer.");
  if (offer.status !== "PENDING" && offer.status !== "COUNTERED") {
    throw new HttpError(400, "This offer has already been resolved.");
  }

  if (action === "accept") {
    const updated = await prisma.offer.update({ where: { id: offer.id }, data: { status: "ACCEPTED" } });
    const order = await createOrder({
      productId: offer.productId,
      buyerId: offer.buyerId,
      sellerId: offer.sellerId,
      price: offer.amount,
    });
    await notify({
      userId: offer.buyerId,
      type: "OFFER_ACCEPTED",
      title: "Your offer was accepted",
      body: `Your offer on ${offer.product.title} was accepted. Order #${order.code} created.`,
      link: "/orders",
    });
    res.json({ offer: updated, order });
    return;
  }

  if (action === "reject") {
    const updated = await prisma.offer.update({ where: { id: offer.id }, data: { status: "REJECTED" } });
    await notify({
      userId: offer.buyerId,
      type: "OFFER_REJECTED",
      title: "Your offer was declined",
      body: `Your offer on ${offer.product.title} was declined.`,
    });
    res.json({ offer: updated });
    return;
  }

  if (!counterAmount) throw new HttpError(400, "Enter a counter amount.");
  const updated = await prisma.offer.update({
    where: { id: offer.id },
    data: { status: "COUNTERED", amount: counterAmount },
  });
  await notify({
    userId: offer.buyerId,
    type: "OFFER_COUNTERED",
    title: "Seller countered your offer",
    body: `New price for ${offer.product.title}: ₹${counterAmount}.`,
    link: "/offers",
  });
  res.json({ offer: updated });
});
