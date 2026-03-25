import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { GalleryImage } from "@/lib/types";
import { imageUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

async function deleteLocalFileIfNeeded(url: string) {
  if (!url.startsWith("/uploads/")) {
    return;
  }

  const target = path.join(process.cwd(), "public", url.replace(/^\//, ""));

  try {
    await fs.unlink(target);
  } catch {
    // Ignore missing files.
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = await request.json();
  const parsed = imageUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid image payload." },
      { status: 400 }
    );
  }

  const images = await readJsonFile<GalleryImage[]>("gallery.json", []);
  const index = images.findIndex((image) => image.id === id);

  if (index === -1) {
    return NextResponse.json({ message: "Image not found." }, { status: 404 });
  }

  const current = images[index];

  if (parsed.data.url && parsed.data.url !== current.url) {
    await deleteLocalFileIfNeeded(current.url);
  }

  const updated: GalleryImage = {
    ...current,
    ...parsed.data
  };

  images[index] = updated;
  await writeJsonFile("gallery.json", images);

  return NextResponse.json({ message: "Image updated.", image: updated });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const images = await readJsonFile<GalleryImage[]>("gallery.json", []);
  const found = images.find((image) => image.id === id);

  if (!found) {
    return NextResponse.json({ message: "Image not found." }, { status: 404 });
  }

  const filtered = images.filter((image) => image.id !== id);
  await writeJsonFile("gallery.json", filtered);
  await deleteLocalFileIfNeeded(found.url);

  return NextResponse.json({ message: "Image deleted." });
}
