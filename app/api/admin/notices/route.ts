import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { NoticeItem } from "@/lib/types";
import { noticeSchema, reorderSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = noticeSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid notice data." },
      { status: 400 }
    );
  }

  const notices = await readJsonFile<NoticeItem[]>("notices.json", []);
  const nextNotice: NoticeItem = {
    id: `notice-${Date.now()}`,
    ...parsed.data
  };

  notices.unshift(nextNotice);
  await writeJsonFile("notices.json", notices);

  return NextResponse.json({
    message: "Notice added successfully.",
    notice: nextNotice
  });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = reorderSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid reorder payload." }, { status: 400 });
  }

  const notices = await readJsonFile<NoticeItem[]>("notices.json", []);

  if (parsed.data.ids.length !== notices.length) {
    return NextResponse.json(
      { message: "Reorder list must include all notice IDs." },
      { status: 400 }
    );
  }

  const noticeMap = new Map(notices.map((notice) => [notice.id, notice]));
  const reordered = parsed.data.ids
    .map((id) => noticeMap.get(id))
    .filter((notice): notice is NoticeItem => Boolean(notice));

  if (reordered.length !== notices.length) {
    return NextResponse.json({ message: "Reorder payload has unknown IDs." }, { status: 400 });
  }

  await writeJsonFile("notices.json", reordered);

  return NextResponse.json({ message: "Notices reordered.", notices: reordered });
}