import { NextResponse } from "next/server";
import { listTeacherStaffMembers } from "@/lib/teacher-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const staff = await listTeacherStaffMembers();
    return NextResponse.json({ staff });
  } catch {
    return NextResponse.json({ staff: [] });
  }
}
