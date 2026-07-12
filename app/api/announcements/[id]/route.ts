import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  deleteAnnouncement,
  updateAnnouncement
} from "@/lib/announcements-service";
import {
  announcementStatusSchema,
  announcementUpdateSchema
} from "@/lib/validation";

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
    const parsed = announcementUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            parsed.error.issues[0]?.message ?? "Invalid announcement payload."
        },
        { status: 400 }
      );
    }

    const announcement = await updateAnnouncement(id, parsed.data);

    if (!announcement) {
      return NextResponse.json(
        { message: "Announcement not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Announcement updated.", announcement });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to update announcement."
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const payload = await request.json();
    const parsed = announcementStatusSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            parsed.error.issues[0]?.message ?? "Invalid announcement payload."
        },
        { status: 400 }
      );
    }

    const announcement = await updateAnnouncement(id, {
      isActive: parsed.data.isActive
    });

    if (!announcement) {
      return NextResponse.json(
        { message: "Announcement not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Announcement updated.", announcement });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to update announcement."
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
    const deleted = await deleteAnnouncement(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Announcement not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Announcement deleted." });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to delete announcement."
      },
      { status: 500 }
    );
  }
}
