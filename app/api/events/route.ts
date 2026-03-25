import { NextResponse } from "next/server";
import { getEvents } from "@/lib/data";

export const runtime = "nodejs";

export async function GET() {
  const events = await getEvents();
  const sorted = [...events].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  return NextResponse.json({ events: sorted });
}
