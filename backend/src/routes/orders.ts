import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError, authUser, parse } from "../lib/http.js";
import { PUBLIC_USER_SELECT } from "../lib/users.js";
import { requireUser } from "../middleware/auth.js";
import { notify } from "../services/notificationService.js";
import { createOrder } from "../services/orderService.js";

export const ordersRouter = Router();
ordersRouter.use(requireUser);

const createSchema = z.object({ productId: z.string().min(1) });
const statusSchema = z.object({
  status: z.enum(["ACCEPTED", "READY_FOR_PICKUP", "COMPLETED", "CANCELLED"]),
});

const ORDER_PRODUCT = { include: { images: { orderBy: { position: "asc" as const } }, location: true } };

/** Orders the user is buying and selling. */
ordersRouter.get("/", async (req, res) => {
  const userId = authUser(req).id;
  const [buying, selling] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId: userId },
      include: { product: ORDER_PRODUCT, seller: { select: PUBLIC_USER_SELECT } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { sellerId: userId },
      include: { product: ORDER_PRODUCT, buyer: { select: PUBLIC_USER_SELECT } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  res.json({ buying, selling });
});

/** "Buy now" on a single listing. */
ordersRouter.post("/", async (req, res) => {
  const user = authUser(req);
  const { productId } = parse(createSchema, req.body, "Invalid input");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ACTIVE" || !product.isSellable) {
    throw new HttpError(404, "This listing is no longer available.");
  }
  if (product.sellerId === user.id) throw new HttpError(400, "You can't buy your own listing.");

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

  res.status(201).json(order);
});

/** Sellers move an order through its lifecycle; either party may cancel. */
ordersRouter.patch("/:id", async (req, res) => {
  const user = authUser(req);
  const { status } = parse(statusSchema, req.body, "Invalid input");

  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { product: true } });
  if (!order) throw new HttpError(404, "Order not found");

  const isSeller = order.sellerId === user.id;
  const isBuyer = order.buyerId === user.id;
  if (!isSeller && !isBuyer) throw new HttpError(403, "Forbidden");
  if (status !== "CANCELLED" && !isSeller) throw new HttpError(403, "Only the seller can update order status.");

  const updated = await prisma.order.update({ where: { id: order.id }, data: { status } });
  if (status === "COMPLETED") {
    await prisma.product.update({ where: { id: order.productId }, data: { status: "SOLD" } });
  }

  await notify({
    userId: isSeller ? order.buyerId : order.sellerId,
    type: "ORDER_UPDATE",
    title: "Order status updated",
    body: `Order #${order.code} for ${order.product.title} is now ${status.replace(/_/g, " ").toLowerCase()}.`,
    link: "/orders",
  });

  res.json(updated);
});
