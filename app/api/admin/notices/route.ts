import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { noticeSchema } from "@/lib/validation";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { NoticeItem } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
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

  notices.push(nextNotice);
  await writeJsonFile("notices.json", notices);

  return NextResponse.json({
    message: "Notice added successfully.",
    notice: nextNotice
  });
}
