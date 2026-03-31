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

function normalizeContextText(value: string | undefined, fallback: string) {
  const cleaned = value?.trim();
  return cleaned && cleaned.length > 0 ? cleaned : fallback;
}

function titleFromPublicId(publicId: string) {
  const raw = publicId.split("/").pop() ?? publicId;
  const withoutExt = raw.replace(/\.[a-zA-Z0-9]+$/, "");
  const cleaned = withoutExt.replace(/[-_]+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : "School image";
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

export async function listCloudinaryImagesForSync(limit = 200) {
  ensureCloudinaryConfigured();
  const folder = process.env.CLOUDINARY_FOLDER ?? "dm-public-school";
  const prefix = folder.trim() ? `${folder.trim()}/` : undefined;

  const fetchResources = async (nextPrefix?: string) =>
    cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      max_results: limit,
      prefix: nextPrefix,
      direction: "desc"
    });

  let result = await fetchResources(prefix);
  if ((result.resources?.length ?? 0) === 0 && prefix) {
    // Fallback in case CLOUDINARY_FOLDER doesn't match historical uploads.
    result = await fetchResources();
  }

  const resources = (result.resources ?? []) as Array<{
    public_id: string;
    secure_url: string;
    context?: { custom?: { caption?: string; category?: string } };
  }>;

  return resources.map((item) => ({
    publicId: item.public_id,
    secureUrl: item.secure_url,
    title: normalizeContextText(
      item.context?.custom?.caption,
      titleFromPublicId(item.public_id)
    ),
    category: normalizeContextText(item.context?.custom?.category, "Campus")
  }));
}
