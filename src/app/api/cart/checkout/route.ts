import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const schema = z.object({ sellerId: z.string().min(1).optional() });

function randomOrderCode() {
  return `CC${Math.floor(1000 + Math.random() * 9000)}`;
}

async function createOrderWithRetry(data: { productId: string; buyerId: string; sellerId: string; price: number }) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.order.create({ data: { ...data, code: randomOrderCode() } });
    } catch (err) {
      const isCodeCollision =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
      if (!isCodeCollision || attempt === 4) throw err;
    }
  }
  throw new Error("Could not generate a unique order code.");
}

export async function POST(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id, ...(parsed.data.sellerId ? { product: { sellerId: parsed.data.sellerId } } : {}) },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const created: { orderId: string; code: string; productId: string; productTitle: string }[] = [];
  const skipped: { productId: string; productTitle: string; reason: string }[] = [];

  for (const item of cartItems) {
    const { product } = item;
    if (!product || product.status !== "ACTIVE" || !product.isSellable) {
      skipped.push({ productId: item.productId, productTitle: product?.title ?? "Unknown item", reason: "No longer available" });
      continue;
    }
    if (product.sellerId === user.id) {
      skipped.push({ productId: item.productId, productTitle: product.title, reason: "This is your own listing" });
      continue;
    }

    const order = await createOrderWithRetry({
      productId: product.id,
      buyerId: user.id,
      sellerId: product.sellerId,
      price: product.price,
    });

    await prisma.notification.create({
      data: {
        userId: product.sellerId,
        type: "ORDER_UPDATE",
        title: "New order placed",
        body: `${user.fullName} placed an order for ${product.title}.`,
        link: "/orders",
      },
    });

    created.push({ orderId: order.id, code: order.code, productId: product.id, productTitle: product.title });
  }

  const convertedIds = created.map((c) => c.productId);
  if (convertedIds.length > 0) {
    await prisma.cartItem.deleteMany({
      where: { userId: user.id, productId: { in: convertedIds } },
    });
  }

  return NextResponse.json({ created, skipped });
}
