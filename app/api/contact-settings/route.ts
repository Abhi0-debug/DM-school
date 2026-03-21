import { NextResponse } from "next/server";
import { getContactSettings } from "@/lib/data";

export const runtime = "nodejs";

export async function GET() {
  const settings = await getContactSettings();
  return NextResponse.json({ settings });
}
