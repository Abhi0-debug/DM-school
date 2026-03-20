import { fallbackHeroSlides } from "@/lib/constants";
import { GalleryImage, HeroSlide } from "@/lib/types";

async function fetchCloudinaryImages(limit = 12): Promise<GalleryImage[]> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_FOLDER ?? "";

  if (!cloudName || !key || !secret) {
    return [];
  }

  const prefix = folder ? `&prefix=${encodeURIComponent(folder)}` : "";
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=${limit}${prefix}`;
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    resources?: Array<{
      asset_id: string;
      secure_url: string;
      context?: { custom?: { alt?: string; category?: string } };
      public_id: string;
    }>;
  };

  return (data.resources ?? []).map((item) => ({
    id: item.asset_id,
    url: item.secure_url,
    alt: item.context?.custom?.alt ?? item.public_id,
    category: item.context?.custom?.category ?? "Campus"
  }));
}

export async function getDynamicImages(fallback: GalleryImage[]): Promise<GalleryImage[]> {
  if ((process.env.IMAGE_PROVIDER ?? "local") !== "cloudinary") {
    return fallback;
  }

  try {
    const cloudinaryImages = await fetchCloudinaryImages(20);
    return cloudinaryImages.length > 0 ? cloudinaryImages : fallback;
  } catch {
    return fallback;
  }
}

export async function getDynamicHero(fallback: HeroSlide[]): Promise<HeroSlide[]> {
  const galleryLike = await getDynamicImages(
    fallback.map((slide) => ({ ...slide, category: "Hero" }))
  );

  return galleryLike.slice(0, 4).map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt
  }));
}

export function getFallbackHero() {
  return fallbackHeroSlides;
}
