import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { uploadGalleryImagesFromFormData } from "@/lib/gallery-service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
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
