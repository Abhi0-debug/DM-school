import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getSessionCookieOptions } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out." });

  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0
  });

  return response;
}