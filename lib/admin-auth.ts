import { NextRequest } from "next/server";

export function isAdminAuthorized(request: NextRequest) {
  const expected = process.env.ADMIN_SECRET;
  const provided = request.headers.get("x-admin-key");

  if (!expected || !provided) {
    return false;
  }

  return provided === expected;
}
