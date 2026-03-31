import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  listGalleryImages,
  reorderGalleryImages,
  uploadGalleryImagesFromFormData
} from "@/lib/gallery-service";
import { reorderSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const images = await listGalleryImages();
    return NextResponse.json({ images });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load images.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { message: "Use multipart/form-data to upload images." },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const images = await uploadGalleryImagesFromFormData(formData);
    return NextResponse.json({
      message: `${images.length} image(s) uploaded successfully.`,
      images
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload images.";
    const status = message === "No image files provided." ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
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

  try {
    const currentImages = await listGalleryImages();
    if (parsed.data.ids.length !== currentImages.length) {
      return NextResponse.json(
        { message: "Reorder list must include all image IDs." },
        { status: 400 }
      );
    }

    const images = await reorderGalleryImages(parsed.data.ids);
    return NextResponse.json({ message: "Gallery reordered.", images });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reorder gallery.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
