import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError, authUser, parse } from "../lib/http.js";
import { PUBLIC_USER_SELECT } from "../lib/users.js";
import { exchangeRequestSchema } from "../lib/validation.js";
import { requireUser } from "../middleware/auth.js";
import { notify } from "../services/notificationService.js";

export const exchangesRouter = Router();
exchangesRouter.use(requireUser);

const statusSchema = z.object({ status: z.enum(["ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"]) });

const EXCHANGE_PRODUCT = { include: { images: { orderBy: { position: "asc" as const } } } };

/** Exchange requests the user has sent and received. */
exchangesRouter.get("/", async (req, res) => {
  const userId = authUser(req).id;
  const [sent, received] = await Promise.all([
    prisma.exchange.findMany({
      where: { requesterId: userId },
      include: { product: EXCHANGE_PRODUCT, owner: { select: PUBLIC_USER_SELECT } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.exchange.findMany({
      where: { ownerId: userId },
      include: { product: EXCHANGE_PRODUCT, requester: { select: PUBLIC_USER_SELECT } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  res.json({ sent, received });
});

exchangesRouter.post("/", async (req, res) => {
  const user = authUser(req);
  const data = parse(exchangeRequestSchema, req.body, "Invalid input");

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product || !product.isExchangeable || product.status !== "ACTIVE") {
    throw new HttpError(404, "This item isn't open to exchange.");
  }
  if (product.sellerId === user.id) throw new HttpError(400, "You can't exchange with your own listing.");

  const exchange = await prisma.exchange.create({
    data: {
      productId: product.id,
      requesterId: user.id,
      ownerId: product.sellerId,
      offeredItem: data.offeredItem,
      message: data.message,
    },
  });
  await notify({
    userId: product.sellerId,
    type: "EXCHANGE_REQUEST",
    title: "New exchange request",
    body: `${user.fullName} wants to exchange "${data.offeredItem}" for ${product.title}.`,
    link: "/exchange",
  });

  res.status(201).json(exchange);
});

exchangesRouter.patch("/:id", async (req, res) => {
  const user = authUser(req);
  const { status } = parse(statusSchema, req.body, "Invalid input");

  const exchange = await prisma.exchange.findUnique({ where: { id: req.params.id }, include: { product: true } });
  if (!exchange) throw new HttpError(404, "Exchange not found");

  const isOwner = exchange.ownerId === user.id;
  const isRequester = exchange.requesterId === user.id;
  if (!isOwner && !isRequester) throw new HttpError(403, "Forbidden");
  if ((status === "ACCEPTED" || status === "REJECTED") && !isOwner) {
    throw new HttpError(403, "Only the listing owner can respond.");
  }

  const updated = await prisma.exchange.update({ where: { id: exchange.id }, data: { status } });
  await notify({
    userId: isOwner ? exchange.requesterId : exchange.ownerId,
    type: "EXCHANGE_ACCEPTED",
    title: `Exchange ${status.toLowerCase()}`,
    body: `Your exchange request for ${exchange.product.title} is now ${status.toLowerCase()}.`,
    link: "/exchange",
  });

  res.json(updated);
});
