import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  createAnnouncement,
  listActiveAnnouncementTexts,
  listAnnouncements
} from "@/lib/announcements-service";
import { announcementCreateSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const includeInactive =
    request.nextUrl.searchParams.get("include_inactive") === "true";

  if (includeInactive && !(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const announcements = includeInactive
      ? await listAnnouncements()
      : await listActiveAnnouncementTexts();

    return NextResponse.json({ announcements });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch announcements."
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
    const parsed = announcementCreateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            parsed.error.issues[0]?.message ?? "Invalid announcement payload."
        },
        { status: 400 }
      );
    }

    const announcement = await createAnnouncement(parsed.data);
    return NextResponse.json({
      message: "Announcement added successfully.",
      announcement
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to create announcement."
      },
      { status: 500 }
    );
  }
}
