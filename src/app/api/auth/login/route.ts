import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { loginStudent, AuthError } from "@/services/authService";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const result = await loginStudent(parsed.data.email, parsed.data.password);
    if (result.needsVerification) {
      return NextResponse.json({
        needsVerification: true,
        email: result.user.email,
        devOtp: result.code,
      });
    }
    return NextResponse.json({
      needsVerification: false,
      onboarded: result.user.onboarded,
      role: result.user.role,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
