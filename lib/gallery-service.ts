import { GalleryImage as PrismaGalleryImage } from "@prisma/client";
import {
  deleteImageFromCloudinary,
  listCloudinaryImagesForSync,
  uploadImageToCloudinary
} from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { GalleryImage } from "@/lib/types";

interface GalleryCreateInput {
  imageUrl: string;
  publicId: string;
  category: string;
  title: string;
}

interface UploadMeta {
  title?: string;
  alt?: string;
  category?: string;
}

function normalizeCategory(value?: string) {
  const category = value?.trim();
  return category && category.length > 0 ? category : "Campus";
}

function normalizeCategoryKey(value: string) {
  return value.trim().toLowerCase();
}

function normalizeTitle(value: string | undefined, fallback: string) {
  const title = value?.trim();
  return title && title.length > 0 ? title : fallback;
}

function toClientImage(image: PrismaGalleryImage): GalleryImage {
  return {
    id: image.id,
    url: image.imageUrl,
    alt: image.title,
    title: image.title,
    category: image.category,
    publicId: image.publicId,
    sortOrder: image.sortOrder
  };
}

async function getTopSortStart(offset = 0) {
  const top = await prisma.galleryImage.findFirst({
    select: { sortOrder: true },
    orderBy: { sortOrder: "asc" }
  });
  return (top?.sortOrder ?? 0) - 1 - offset;
}

async function bootstrapGalleryFromCloudinaryIfEmpty() {
  const count = await prisma.galleryImage.count();
  if (count > 0) {
    return;
  }

  const cloudinaryImages = await listCloudinaryImagesForSync();
  if (cloudinaryImages.length === 0) {
    return;
  }

  await prisma.$transaction(
    cloudinaryImages.map((image, index) =>
      prisma.galleryImage.upsert({
        where: { publicId: image.publicId },
        update: {
          imageUrl: image.secureUrl,
          title: image.title,
          category: normalizeCategory(image.category),
          sortOrder: index
        },
        create: {
          imageUrl: image.secureUrl,
          publicId: image.publicId,
          title: image.title,
          category: normalizeCategory(image.category),
          sortOrder: index
        }
      })
    )
  );
}

export async function listGalleryImages(category?: string): Promise<GalleryImage[]> {
  let images: PrismaGalleryImage[] = await prisma.galleryImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });

  if (images.length === 0) {
    try {
      await bootstrapGalleryFromCloudinaryIfEmpty();
      images = await prisma.galleryImage.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      });
    } catch {
      // Keep an empty list when cloud bootstrap is unavailable.
    }
  }

  const filterKey = category ? normalizeCategoryKey(category) : null;
  const filtered = filterKey
    ? images.filter((image) => normalizeCategoryKey(image.category) === filterKey)
    : images;

  return filtered.map(toClientImage);
}

export async function createGalleryImages(
  entries: GalleryCreateInput[]
): Promise<GalleryImage[]> {
  if (entries.length === 0) {
    return [];
  }

  const startOrder = await getTopSortStart(entries.length - 1);
  const created = await prisma.$transaction(
    entries.map((entry, index) =>
      prisma.galleryImage.create({
        data: {
          ...entry,
          sortOrder: startOrder + index
        }
      })
    )
  );

  return created.map(toClientImage);
}

function parseMeta(metaRaw: FormDataEntryValue | null) {
  if (typeof metaRaw !== "string") {
    return [] as UploadMeta[];
  }

  try {
    const parsed = JSON.parse(metaRaw);
    return Array.isArray(parsed) ? (parsed as UploadMeta[]) : [];
  } catch {
    return [] as UploadMeta[];
  }
}

export async function uploadGalleryImagesFromFormData(formData: FormData) {
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
    throw new Error("No image files provided.");
  }

  const meta = parseMeta(formData.get("meta"));
  const defaultTitle = String(formData.get("title") ?? formData.get("alt") ?? "School image");
  const defaultCategory = normalizeCategory(String(formData.get("category") ?? "Campus"));
  const createEntries: GalleryCreateInput[] = [];

  for (const [index, file] of files.entries()) {
    const fileMeta = meta[index] ?? {};
    const category = normalizeCategory(fileMeta.category ?? defaultCategory);
    const fallbackTitle = file.name?.trim() ? file.name : defaultTitle;
    const title = normalizeTitle(fileMeta.title ?? fileMeta.alt ?? defaultTitle, fallbackTitle);
    const upload = await uploadImageToCloudinary(file, { category, title });

    createEntries.push({
      imageUrl: upload.secureUrl,
      publicId: upload.publicId,
      category,
      title
    });
  }

  return createGalleryImages(createEntries);
}

export async function updateGalleryImageMetadata(
  id: string,
  data: { title: string; category: string }
) {
  const updated = await prisma.galleryImage.update({
    where: { id },
    data: {
      title: normalizeTitle(data.title, "School image"),
      category: normalizeCategory(data.category)
    }
  });

  return toClientImage(updated);
}

export async function reorderGalleryImages(ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  const existingCount = await prisma.galleryImage.count({
    where: { id: { in: ids } }
  });

  if (existingCount !== ids.length) {
    throw new Error("Reorder payload has unknown IDs.");
  }

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.galleryImage.update({
        where: { id },
        data: { sortOrder: index }
      })
    )
  );

  return listGalleryImages();
}

export async function deleteGalleryImageById(id: string) {
  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image) {
    return null;
  }

  await deleteImageFromCloudinary(image.publicId);
  await prisma.galleryImage.delete({ where: { id } });
  return toClientImage(image);
}
