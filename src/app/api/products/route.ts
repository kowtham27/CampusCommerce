import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { productSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;

  const product = await prisma.product.create({
    data: {
      title: d.title,
      description: d.description,
      categoryId: d.categoryId,
      sellerId: user.id,
      condition: d.condition,
      originalPrice: d.originalPrice,
      price: d.price,
      isSellable: d.isSellable,
      isRentable: d.isRentable,
      rentDaily: d.isRentable ? d.rentDaily : undefined,
      rentWeekly: d.isRentable ? d.rentWeekly : undefined,
      rentMonthly: d.isRentable ? d.rentMonthly : undefined,
      rentDeposit: d.isRentable ? d.rentDeposit : undefined,
      isExchangeable: d.isExchangeable,
      exchangeWants: d.isExchangeable ? (d.exchangeWants ?? []) : [],
      brand: d.brand,
      ageMonths: d.ageMonths,
      locationId: d.locationId,
      tags: d.tags ?? [],
      distanceMeters: 50 + Math.floor(Math.random() * 700),
      images: { create: d.images.map((url, i) => ({ url, position: i })) },
    },
  });

  return NextResponse.json(product);
}
