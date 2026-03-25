import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { EventItem } from "@/lib/types";
import { eventSchema, reorderSchema } from "@/lib/validation";

export const runtime = "nodejs";

function normalizeCategory(type: EventItem["type"], category?: string) {
  if (category && category.trim().length > 0) {
    return category.trim();
  }

  return type === "exam" ? "Exam" : "General";
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = eventSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid event data." },
      { status: 400 }
    );
  }

  const events = await readJsonFile<EventItem[]>("events.json", []);
  const nextEvent: EventItem = {
    id: `event-${Date.now()}`,
    ...parsed.data,
    category: normalizeCategory(parsed.data.type, parsed.data.category)
  };

  events.unshift(nextEvent);
  await writeJsonFile("events.json", events);

  return NextResponse.json({ message: "Event added successfully.", event: nextEvent });
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

  const events = await readJsonFile<EventItem[]>("events.json", []);

  if (parsed.data.ids.length !== events.length) {
    return NextResponse.json(
      { message: "Reorder list must include all event IDs." },
      { status: 400 }
    );
  }

  const eventMap = new Map(events.map((event) => [event.id, event]));
  const reordered = parsed.data.ids
    .map((id) => eventMap.get(id))
    .filter((event): event is EventItem => Boolean(event));

  if (reordered.length !== events.length) {
    return NextResponse.json({ message: "Reorder payload has unknown IDs." }, { status: 400 });
  }

  await writeJsonFile("events.json", reordered);

  return NextResponse.json({ message: "Events reordered.", events: reordered });
}