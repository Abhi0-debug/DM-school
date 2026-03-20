import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { GalleryImage } from "@/lib/types";
import { imageSchema } from "@/lib/validation";

export const runtime = "nodejs";

async function uploadToCloudinary(file: File) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_FOLDER ?? "dm-public-school";

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are missing.");
  }

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

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  let nextImage: GalleryImage;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    const alt = String(formData.get("alt") ?? "School image");
    const category = String(formData.get("category") ?? "Campus");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Image file is required." }, { status: 400 });
    }

    try {
      const uploaded = await uploadToCloudinary(file);
      nextImage = {
        id: uploaded.id,
        url: uploaded.url,
        alt,
        category
      };
    } catch (error) {
      return NextResponse.json(
        {
          message:
            error instanceof Error
              ? error.message
              : "Image upload failed."
        },
        { status: 400 }
      );
    }
  } else {
    const payload = await request.json();
    const parsed = imageSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid image payload." },
        { status: 400 }
      );
    }

    nextImage = {
      id: `img-${Date.now()}`,
      ...parsed.data
    };
  }

  const images = await readJsonFile<GalleryImage[]>("gallery.json", []);
  images.unshift(nextImage);
  await writeJsonFile("gallery.json", images);

  return NextResponse.json({ message: "Image saved successfully.", image: nextImage });
}
