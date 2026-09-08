import { NextResponse } from "next/server";
import { logout } from "@/services/authService";

export async function POST() {
  await logout();
  return NextResponse.json({ ok: true });
}
