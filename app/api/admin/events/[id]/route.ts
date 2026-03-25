import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { EventItem } from "@/lib/types";
import { eventSchema } from "@/lib/validation";

export const runtime = "nodejs";

function normalizeCategory(type: EventItem["type"], category?: string) {
  if (category && category.trim().length > 0) {
    return category.trim();
  }

  return type === "exam" ? "Exam" : "General";
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = await request.json();
  const parsed = eventSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid event payload." },
      { status: 400 }
    );
  }

  const events = await readJsonFile<EventItem[]>("events.json", []);
  const index = events.findIndex((event) => event.id === id);

  if (index === -1) {
    return NextResponse.json({ message: "Event not found." }, { status: 404 });
  }

  const updated: EventItem = {
    id,
    ...parsed.data,
    category: normalizeCategory(parsed.data.type, parsed.data.category)
  };

  events[index] = updated;
  await writeJsonFile("events.json", events);

  return NextResponse.json({ message: "Event updated.", event: updated });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  const events = await readJsonFile<EventItem[]>("events.json", []);
  const filtered = events.filter((event) => event.id !== id);

  if (filtered.length === events.length) {
    return NextResponse.json({ message: "Event not found." }, { status: 404 });
  }

  await writeJsonFile("events.json", filtered);

  return NextResponse.json({ message: "Event deleted." });
}