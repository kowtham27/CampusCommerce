import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

function randomOrderCode() {
  return `CC${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Creates an order with a short human-readable code (e.g. CC4821), retrying on
 * the rare unique-code collision.
 */
export async function createOrder(data: { productId: string; buyerId: string; sellerId: string; price: number }) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.order.create({ data: { ...data, code: randomOrderCode() } });
    } catch (err) {
      const isCodeCollision = err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
      if (!isCodeCollision || attempt === 4) throw err;
    }
  }
  throw new Error("Could not generate a unique order code.");
}
