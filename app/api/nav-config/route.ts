import { NextResponse } from "next/server";
import { getNavConfig } from "@/lib/data";

export const runtime = "nodejs";

export async function GET() {
  const config = await getNavConfig();
  return NextResponse.json({ config });
}
