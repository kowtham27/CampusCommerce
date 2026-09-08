import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { findOrCreateConversation } from "@/services/messagingService";

const schema = z.object({
  recipientId: z.string().min(1),
  productId: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  if (parsed.data.recipientId === user.id) {
    return NextResponse.json({ error: "You can't message yourself." }, { status: 400 });
  }

  const conversation = await findOrCreateConversation(user.id, parsed.data.recipientId, parsed.data.productId);
  return NextResponse.json(conversation);
}
