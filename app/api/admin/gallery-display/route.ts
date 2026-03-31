import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import {
  getGalleryDisplayConfig,
  saveGalleryDisplayConfig
} from "@/lib/gallery-display-service";
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

  let config: GalleryDisplayConfig = fallbackConfig;
  try {
    config = await getGalleryDisplayConfig();
  } catch {
    const stored = await readJsonFile<GalleryDisplayConfig>(
      "gallery-display.json",
      fallbackConfig
    );
    config = {
      mode: stored.mode === "slideshow" ? "slideshow" : "grid"
    };
  }

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

  let config = parsed.data;
  try {
    config = await saveGalleryDisplayConfig(parsed.data);
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save gallery display mode in persistent storage.";
      return NextResponse.json({ message }, { status: 500 });
    }

    try {
      await writeJsonFile("gallery-display.json", parsed.data);
    } catch (writeError) {
      const message =
        writeError instanceof Error
          ? writeError.message
          : "Unable to save gallery display mode.";
      return NextResponse.json({ message }, { status: 500 });
    }
  }

  return NextResponse.json({
    message: "Gallery display mode updated.",
    config
  });
}
