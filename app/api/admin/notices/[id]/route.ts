import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { NoticeItem } from "@/lib/types";
import { noticeSchema } from "@/lib/validation";

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
  const parsed = noticeSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid notice payload." },
      { status: 400 }
    );
  }

  const notices = await readJsonFile<NoticeItem[]>("notices.json", []);
  const index = notices.findIndex((notice) => notice.id === id);

  if (index === -1) {
    return NextResponse.json({ message: "Notice not found." }, { status: 404 });
  }

  const updated: NoticeItem = {
    id,
    ...parsed.data
  };

  notices[index] = updated;
  await writeJsonFile("notices.json", notices);

  return NextResponse.json({ message: "Notice updated.", notice: updated });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  const notices = await readJsonFile<NoticeItem[]>("notices.json", []);
  const filtered = notices.filter((notice) => notice.id !== id);

  if (filtered.length === notices.length) {
    return NextResponse.json({ message: "Notice not found." }, { status: 404 });
  }

  await writeJsonFile("notices.json", filtered);

  return NextResponse.json({ message: "Notice deleted." });
}