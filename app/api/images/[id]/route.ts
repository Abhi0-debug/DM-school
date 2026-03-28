import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { deleteGalleryImageById } from "@/lib/gallery-service";

export const runtime = "nodejs";

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
