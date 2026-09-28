import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authUser, parse } from "../lib/http.js";
import { requireUser } from "../middleware/auth.js";
import { PRODUCT_CARD_INCLUDE } from "../services/productService.js";

export const wishlistRouter = Router();
wishlistRouter.use(requireUser);

const schema = z.object({ productId: z.string().min(1) });

wishlistRouter.get("/", async (req, res) => {
  const rows = await prisma.wishlist.findMany({
    where: { userId: authUser(req).id },
    include: { product: { include: PRODUCT_CARD_INCLUDE } },
    orderBy: { createdAt: "desc" },
  });
  res.json(rows.map((w) => w.product));
});

wishlistRouter.post("/", async (req, res) => {
  const userId = authUser(req).id;
  const { productId } = parse(schema, req.body, "Invalid input");
  await prisma.wishlist.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  });
  res.json({ ok: true });
});

wishlistRouter.delete("/", async (req, res) => {
  const { productId } = parse(schema, req.body, "Invalid input");
  await prisma.wishlist.deleteMany({ where: { userId: authUser(req).id, productId } });
  res.json({ ok: true });
});
