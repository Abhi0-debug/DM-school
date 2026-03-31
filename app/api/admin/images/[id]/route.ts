import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  deleteGalleryImageById,
  updateGalleryImageMetadata
} from "@/lib/gallery-service";
import { imageUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = imageUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid image payload." },
      { status: 400 }
    );
  }

  const { id } = await context.params;

  try {
    const image = await updateGalleryImageMetadata(id, {
      title: parsed.data.alt,
      category: parsed.data.category
    });
    return NextResponse.json({ message: "Image updated.", image });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update image.";
    const status = message.includes("Record to update not found.") ? 404 : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const removed = await deleteGalleryImageById(id);
    if (!removed) {
      return NextResponse.json({ message: "Image not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Image deleted.", image: removed });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete image.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
