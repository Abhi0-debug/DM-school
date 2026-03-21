import { NextResponse } from "next/server";
import { getStaffMembers } from "@/lib/data";

export const runtime = "nodejs";

export async function GET() {
  const staff = await getStaffMembers();
  return NextResponse.json({ staff });
}
