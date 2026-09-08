import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { destroySession } from "@/lib/session";

export async function POST() {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await prisma.user.update({ where: { id: user.id }, data: { sessionVersion: { increment: 1 } } });
  await destroySession();

  return NextResponse.json({ ok: true });
}
