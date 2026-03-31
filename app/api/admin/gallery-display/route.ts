import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { GalleryDisplayConfig } from "@/lib/types";
import { galleryDisplayConfigSchema } from "@/lib/validation";

export const runtime = "nodejs";

const fallbackConfig: GalleryDisplayConfig = {
  mode: "grid"
};

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const stored = await readJsonFile<GalleryDisplayConfig>(
    "gallery-display.json",
    fallbackConfig
  );
  const config: GalleryDisplayConfig = {
    mode: stored.mode === "slideshow" ? "slideshow" : "grid"
  };

  return NextResponse.json({ config });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = galleryDisplayConfigSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message:
          parsed.error.issues[0]?.message ??
          "Invalid gallery display config payload."
      },
      { status: 400 }
    );
  }

  await writeJsonFile("gallery-display.json", parsed.data);
  return NextResponse.json({
    message: "Gallery display mode updated.",
    config: parsed.data
  });
}
