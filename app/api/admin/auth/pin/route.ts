import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  changeAdminPin,
  createAdminSessionToken,
  getSessionCookieOptions,
  isAdminAuthorized
} from "@/lib/admin-auth";
import { adminPinChangeSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = adminPinChangeSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid PIN payload." }, { status: 400 });
  }

  if (parsed.data.currentPin === parsed.data.newPin) {
    return NextResponse.json(
      { message: "New PIN must be different from current PIN." },
      { status: 400 }
    );
  }

  const changed = await changeAdminPin(parsed.data.currentPin, parsed.data.newPin);

  if (!changed) {
    return NextResponse.json({ message: "Current PIN is incorrect." }, { status: 400 });
  }

  const token = await createAdminSessionToken();
  const response = NextResponse.json({ message: "PIN updated successfully." });

  response.cookies.set(ADMIN_COOKIE_NAME, token, getSessionCookieOptions());

  return response;
}