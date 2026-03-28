import { v2 as cloudinary, type TransformationOptions } from "cloudinary";

let configured = false;

function ensureCloudinaryConfigured() {
  if (configured) {
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  configured = true;
}

function toDataUri(file: File, bytes: Buffer) {
  const mime = file.type || "application/octet-stream";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

export async function uploadImageToCloudinary(
  file: File,
  options?: { title?: string; category?: string; folder?: string }
) {
  ensureCloudinaryConfigured();

  const bytes = Buffer.from(await file.arrayBuffer());
  const dataUri = toDataUri(file, bytes);
  const folder = options?.folder ?? process.env.CLOUDINARY_FOLDER ?? "dm-public-school";

  const uploadResult = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    overwrite: false,
    context: options?.title
      ? {
          caption: options.title,
          category: options.category ?? ""
        }
      : undefined
  });

  return {
    publicId: uploadResult.public_id,
    secureUrl: uploadResult.secure_url
  };
}

export function getOptimizedCloudinaryImageUrl(
  publicId: string,
  options?: { transformations?: TransformationOptions | TransformationOptions[] }
) {
  ensureCloudinaryConfigured();

  const baseTransforms: TransformationOptions[] = [
    { fetch_format: "auto", quality: "auto" }
  ];

  const extra =
    options?.transformations === undefined
      ? []
      : Array.isArray(options.transformations)
        ? options.transformations
        : [options.transformations];

  return cloudinary.url(publicId, {
    secure: true,
    resource_type: "image",
    transformation: [...baseTransforms, ...extra]
  });
}

export async function deleteImageFromCloudinary(publicId: string) {
  ensureCloudinaryConfigured();
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image"
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error("Unable to delete image from Cloudinary.");
  }
}
