import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { GalleryImage } from "@/lib/types";
import { imageSchema, reorderSchema } from "@/lib/validation";

export const runtime = "nodejs";

function supportsCloudinaryUpload() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

async function uploadToCloudinary(file: File) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME as string;
  const apiKey = process.env.CLOUDINARY_API_KEY as string;
  const apiSecret = process.env.CLOUDINARY_API_SECRET as string;
  const folder = process.env.CLOUDINARY_FOLDER ?? "dm-public-school";

  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(signatureBase).digest("hex");

  const bytes = await file.arrayBuffer();
  const blob = new Blob([bytes], { type: file.type || "image/jpeg" });

  const formData = new FormData();
  formData.append("file", blob, file.name || "upload.jpg");
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const payload = (await response.json()) as {
    secure_url?: string;
    asset_id?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message ?? "Cloud upload failed.");
  }

  return {
    id: payload.asset_id ?? `img-${Date.now()}`,
    url: payload.secure_url
  };
}

async function uploadToLocal(file: File) {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const safeName = file.name.replace(/[^a-zA-Z0-9-_\.]/g, "").slice(0, 40);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName || "image"}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(path.join(uploadDir, fileName), bytes);

  return {
    id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url: `/uploads/${fileName}`
  };
}

async function persistImages(newImages: GalleryImage[]) {
  const images = await readJsonFile<GalleryImage[]>("gallery.json", []);
  const merged = [...newImages, ...images];
  await writeJsonFile("gallery.json", merged);
  return merged;
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const allFiles = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);
    const singleFile = formData.get("file");

    const files =
      allFiles.length > 0
        ? allFiles
        : singleFile instanceof File
          ? [singleFile]
          : [];

    if (files.length === 0) {
      return NextResponse.json({ message: "No image files provided." }, { status: 400 });
    }

    const metaRaw = formData.get("meta");
    let meta: Array<{ alt?: string; category?: string }> = [];

    if (typeof metaRaw === "string") {
      try {
        const parsed = JSON.parse(metaRaw);
        if (Array.isArray(parsed)) {
          meta = parsed as Array<{ alt?: string; category?: string }>;
        }
      } catch {
        meta = [];
      }
    }

    const defaultAlt = String(formData.get("alt") ?? "School image");
    const defaultCategory = String(formData.get("category") ?? "Campus");

    const uploadedImages: GalleryImage[] = [];

    for (const [index, file] of files.entries()) {
      const metaEntry = meta[index] ?? {};
      const alt = (metaEntry.alt ?? defaultAlt ?? file.name).trim() || file.name;
      const category = (metaEntry.category ?? defaultCategory).trim() || "Campus";

      const uploaded = supportsCloudinaryUpload()
        ? await uploadToCloudinary(file)
        : await uploadToLocal(file);

      uploadedImages.push({
        id: uploaded.id,
        url: uploaded.url,
        alt,
        category
      });
    }

    await persistImages(uploadedImages);

    return NextResponse.json({
      message: `${uploadedImages.length} image(s) uploaded successfully.`,
      images: uploadedImages
    });
  }

  const payload = await request.json();
  const entries = Array.isArray(payload) ? payload : [payload];
  const created: GalleryImage[] = [];

  for (const entry of entries) {
    const parsed = imageSchema.safeParse(entry);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid image payload." },
        { status: 400 }
      );
    }

    created.push({
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...parsed.data
    });
  }

  await persistImages(created);

  return NextResponse.json({
    message: `${created.length} image(s) saved successfully.`,
    images: created
  });
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

  const images = await readJsonFile<GalleryImage[]>("gallery.json", []);

  if (parsed.data.ids.length !== images.length) {
    return NextResponse.json(
      { message: "Reorder list must include all image IDs." },
      { status: 400 }
    );
  }

  const imageMap = new Map(images.map((image) => [image.id, image]));
  const reordered = parsed.data.ids
    .map((id) => imageMap.get(id))
    .filter((image): image is GalleryImage => Boolean(image));

  if (reordered.length !== images.length) {
    return NextResponse.json({ message: "Reorder payload has unknown IDs." }, { status: 400 });
  }

  await writeJsonFile("gallery.json", reordered);

  return NextResponse.json({ message: "Gallery reordered.", images: reordered });
}
