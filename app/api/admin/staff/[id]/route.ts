import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { StaffMember } from "@/lib/types";
import { staffSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = await request.json();
  const parsed = staffSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid staff payload." },
      { status: 400 }
    );
  }

  const staff = await readJsonFile<StaffMember[]>("staff.json", []);
  const index = staff.findIndex((member) => member.id === id);

  if (index === -1) {
    return NextResponse.json({ message: "Staff member not found." }, { status: 404 });
  }

  const updated: StaffMember = { id, ...parsed.data };
  staff[index] = updated;
  await writeJsonFile("staff.json", staff);

  return NextResponse.json({ message: "Staff member updated.", member: updated });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const staff = await readJsonFile<StaffMember[]>("staff.json", []);
  const filtered = staff.filter((member) => member.id !== id);

  if (filtered.length === staff.length) {
    return NextResponse.json({ message: "Staff member not found." }, { status: 404 });
  }

  await writeJsonFile("staff.json", filtered);
  return NextResponse.json({ message: "Staff member deleted." });
}
