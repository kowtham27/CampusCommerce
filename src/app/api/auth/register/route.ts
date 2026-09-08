import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";
import { registerStudent, AuthError } from "@/services/authService";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const { user, code } = await registerStudent(parsed.data);
    return NextResponse.json({
      email: user.email,
      // Demo-only: no email provider is wired up, so the OTP is returned here
      // instead of being sent by email. See instruction.md to add real email delivery.
      devOtp: code,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
