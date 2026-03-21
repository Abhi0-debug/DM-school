import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { ContactMessage } from "@/lib/types";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const messages = await readJsonFile<ContactMessage[]>("messages.json", []);
  const filtered = messages.filter((item) => item.id !== id);

  if (filtered.length === messages.length) {
    return NextResponse.json({ message: "Message not found." }, { status: 404 });
  }

  await writeJsonFile("messages.json", filtered);
  return NextResponse.json({ message: "Message deleted." });
}
