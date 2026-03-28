import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  createEvent,
  listEvents,
  listEventsByIds
} from "@/lib/events-notices-service";
import { eventSchema, reorderSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const events = await listEvents();
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to fetch events."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = eventSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid event payload." },
        { status: 400 }
      );
    }

    const event = await createEvent(parsed.data);
    return NextResponse.json({ message: "Event added successfully.", event });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to create event."
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = reorderSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid reorder payload." }, { status: 400 });
    }

    const reordered = await listEventsByIds(parsed.data.ids);

    if (reordered.length !== parsed.data.ids.length) {
      return NextResponse.json(
        { message: "Reorder payload has unknown IDs." },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Events reordered.", events: reordered });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to reorder events."
      },
      { status: 500 }
    );
  }
}

