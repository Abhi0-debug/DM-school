import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { StaffMember } from "@/lib/types";
import { staffSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const staff = await readJsonFile<StaffMember[]>("staff.json", []);
  return NextResponse.json({ staff });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = staffSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid staff payload." },
      { status: 400 }
    );
  }

  const staff = await readJsonFile<StaffMember[]>("staff.json", []);
  const member: StaffMember = {
    id: `staff-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...parsed.data
  };

  staff.unshift(member);
  await writeJsonFile("staff.json", staff);

  return NextResponse.json({ message: "Staff member added.", member });
}
