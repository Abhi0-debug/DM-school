import { NextRequest, NextResponse } from "next/server";
import { listGalleryImages } from "@/lib/gallery-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const categoryParam = request.nextUrl.searchParams.get("category");
    const category =
      categoryParam && categoryParam.trim().length > 0
        ? categoryParam.trim()
        : undefined;
    const images = await listGalleryImages(category);
    return NextResponse.json({ images });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load images.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
