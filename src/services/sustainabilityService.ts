import "server-only";
import { prisma } from "@/lib/prisma";

const AVG_KG_WASTE_AVOIDED_PER_ITEM = 1.9;

/**
 * Campus-wide "second life" impact estimate. All numbers are derived from real
 * completed-transaction counts but the per-item waste/₹ multipliers are
 * editorial estimates — always surfaced to users as "estimated".
 */
export async function getCampusImpact() {
  const [completedOrders, completedRentals, completedExchanges] = await Promise.all([
    prisma.order.findMany({ where: { status: "COMPLETED" }, select: { price: true } }),
    prisma.rental.count({ where: { status: "RETURNED" } }),
    prisma.exchange.count({ where: { status: "COMPLETED" } }),
  ]);

  const itemsReused = completedOrders.length + completedRentals + completedExchanges;
  const savedAmount = completedOrders.reduce((sum, o) => sum + o.price, 0);
  const wasteAvoidedKg = Math.round(itemsReused * AVG_KG_WASTE_AVOIDED_PER_ITEM);

  return { itemsReused, savedAmount, wasteAvoidedKg };
}

export async function getUserImpact(userId: string) {
  const [soldCount, rentedOutCount, exchangedCount] = await Promise.all([
    prisma.order.count({ where: { sellerId: userId, status: "COMPLETED" } }),
    prisma.rental.count({ where: { ownerId: userId, status: "RETURNED" } }),
    prisma.exchange.count({
      where: { OR: [{ ownerId: userId }, { requesterId: userId }], status: "COMPLETED" },
    }),
  ]);
  return { itemsGivenSecondLife: soldCount + rentedOutCount + exchangedCount };
}
