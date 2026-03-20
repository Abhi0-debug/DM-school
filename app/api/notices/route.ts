import { NextResponse } from "next/server";
import { getNotices } from "@/lib/data";

export const runtime = "nodejs";

export async function GET() {
  const notices = await getNotices();
  const sorted = [...notices].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return NextResponse.json({ notices: sorted });
}
