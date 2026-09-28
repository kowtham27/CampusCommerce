import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError, authUser, parse } from "../lib/http.js";
import { requireUser } from "../middleware/auth.js";
import { getCartItems } from "../services/cartService.js";
import { notify } from "../services/notificationService.js";
import { createOrder } from "../services/orderService.js";

export const cartRouter = Router();
cartRouter.use(requireUser);

const itemSchema = z.object({ productId: z.string().min(1) });
const checkoutSchema = z.object({ sellerId: z.string().min(1).optional() });

cartRouter.get("/", async (req, res) => {
  res.json(await getCartItems(authUser(req).id));
});

cartRouter.post("/", async (req, res) => {
  const user = authUser(req);
  const { productId } = parse(itemSchema, req.body, "Invalid input");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ACTIVE" || !product.isSellable) {
    throw new HttpError(404, "This listing is no longer available.");
  }
  if (product.sellerId === user.id) {
    throw new HttpError(400, "You can't add your own listing to your cart.");
  }

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: {},
    create: { userId: user.id, productId },
  });
  res.json({ ok: true });
});

cartRouter.delete("/", async (req, res) => {
  const { productId } = parse(itemSchema, req.body, "Invalid input");
  await prisma.cartItem.deleteMany({ where: { userId: authUser(req).id, productId } });
  res.json({ ok: true });
});

/**
 * Converts cart items into orders — all of them, or only one seller's when
 * `sellerId` is given. Unavailable items are skipped and reported back.
 */
cartRouter.post("/checkout", async (req, res) => {
  const user = authUser(req);
  const { sellerId } = parse(checkoutSchema, req.body, "Invalid input");

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id, ...(sellerId ? { product: { sellerId } } : {}) },
    include: { product: true },
  });
  if (cartItems.length === 0) throw new HttpError(400, "Your cart is empty.");

  const created: { orderId: string; code: string; productId: string; productTitle: string }[] = [];
  const skipped: { productId: string; productTitle: string; reason: string }[] = [];

  for (const { product, productId } of cartItems) {
    if (product.status !== "ACTIVE" || !product.isSellable) {
      skipped.push({ productId, productTitle: product.title, reason: "No longer available" });
      continue;
    }
    if (product.sellerId === user.id) {
      skipped.push({ productId, productTitle: product.title, reason: "This is your own listing" });
      continue;
    }

    const order = await createOrder({
      productId: product.id,
      buyerId: user.id,
      sellerId: product.sellerId,
      price: product.price,
    });
    await notify({
      userId: product.sellerId,
      type: "ORDER_UPDATE",
      title: "New order placed",
      body: `${user.fullName} placed an order for ${product.title}.`,
      link: "/orders",
    });

    created.push({ orderId: order.id, code: order.code, productId: product.id, productTitle: product.title });
  }

  if (created.length > 0) {
    await prisma.cartItem.deleteMany({
      where: { userId: user.id, productId: { in: created.map((c) => c.productId) } },
    });
  }

  res.json({ created, skipped });
});
