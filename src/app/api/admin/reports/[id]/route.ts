import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  action: z.enum(["dismiss", "warn_user", "remove_listing", "suspend_user"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const actionMap = {
    dismiss: "DISMISSED",
    warn_user: "WARNED_USER",
    remove_listing: "REMOVED_LISTING",
    suspend_user: "SUSPENDED_USER",
  } as const;

  if (parsed.data.action === "remove_listing" && report.productId) {
    await prisma.product.update({ where: { id: report.productId }, data: { status: "REMOVED" } });
  }
  if (parsed.data.action === "suspend_user" && report.reportedUserId) {
    await prisma.user.update({ where: { id: report.reportedUserId }, data: { status: "SUSPENDED" } });
  }

  const updated = await prisma.report.update({
    where: { id },
    data: {
      status: parsed.data.action === "dismiss" ? "DISMISSED" : "REVIEWED",
      action: actionMap[parsed.data.action],
      resolvedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
