import { NextResponse } from "next/server";
import { listGalleryImages } from "@/lib/gallery-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const images = await listGalleryImages();
    return NextResponse.json({ images });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load images.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
