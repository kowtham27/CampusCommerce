import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { reportSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = reportSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const report = await prisma.report.create({
    data: {
      productId: parsed.data.productId,
      reportedUserId: parsed.data.reportedUserId,
      reportedById: user.id,
      reason: parsed.data.reason,
      details: parsed.data.details,
    },
  });

  return NextResponse.json(report);
}
