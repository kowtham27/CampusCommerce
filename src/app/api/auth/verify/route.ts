import { NextResponse } from "next/server";
import { verifyOtpSchema } from "@/lib/validation";
import { verifyOtp, AuthError } from "@/services/authService";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const user = await verifyOtp(parsed.data.email, parsed.data.code);
    return NextResponse.json({ id: user.id, onboarded: user.onboarded });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
