import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getSessionCookieOptions,
  verifyAdminPin
} from "@/lib/admin-auth";
import { adminPinLoginSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = adminPinLoginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid PIN format." }, { status: 400 });
  }

  const isValidPin = await verifyAdminPin(parsed.data.pin);

  if (!isValidPin) {
    return NextResponse.json({ message: "Incorrect PIN." }, { status: 401 });
  }

  const token = await createAdminSessionToken();
  const response = NextResponse.json({ message: "Login successful." });

  response.cookies.set(ADMIN_COOKIE_NAME, token, getSessionCookieOptions());

  return response;
}