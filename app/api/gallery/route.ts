import { NextResponse } from "next/server";
import { getGalleryImages } from "@/lib/data";
import { getDynamicImages } from "@/lib/media-provider";

export const runtime = "nodejs";

export async function GET() {
  const localImages = await getGalleryImages();
  const images = await getDynamicImages(localImages);
  return NextResponse.json({ images });
}
