import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { eventSchema } from "@/lib/validation";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { EventItem } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
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
    ...parsed.data
  };

  events.push(nextEvent);
  await writeJsonFile("events.json", events);

  return NextResponse.json({ message: "Event added successfully.", event: nextEvent });
}
