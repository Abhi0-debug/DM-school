import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  createNotice,
  listNotices,
  listNoticesByIds
} from "@/lib/events-notices-service";
import { noticeSchema, reorderSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const notices = await listNotices();
    return NextResponse.json({ notices });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to fetch notices."
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
    const parsed = noticeSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid notice payload." },
        { status: 400 }
      );
    }

    const notice = await createNotice(parsed.data);
    return NextResponse.json({ message: "Notice added successfully.", notice });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to create notice."
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

    const reordered = await listNoticesByIds(parsed.data.ids);

    if (reordered.length !== parsed.data.ids.length) {
      return NextResponse.json(
        { message: "Reorder payload has unknown IDs." },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Notices reordered.", notices: reordered });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to reorder notices."
      },
      { status: 500 }
    );
  }
}

