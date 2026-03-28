import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { deleteNotice, updateNotice } from "@/lib/events-notices-service";
import { noticeSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const payload = await request.json();
    const parsed = noticeSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid notice payload." },
        { status: 400 }
      );
    }

    const notice = await updateNotice(id, parsed.data);

    if (!notice) {
      return NextResponse.json({ message: "Notice not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Notice updated.", notice });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to update notice."
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const deleted = await deleteNotice(id);

    if (!deleted) {
      return NextResponse.json({ message: "Notice not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Notice deleted." });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to delete notice."
      },
      { status: 500 }
    );
  }
}

