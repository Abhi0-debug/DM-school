"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GalleryImage } from "@/lib/types";
import { SectionHeading } from "@/components/section-heading";

interface GalleryProps {
  initialImages: GalleryImage[];
  externalImageId?: string | null;
}

function normalizeCategory(value: string) {
  return value.trim().toLowerCase();
}

export function Gallery({ initialImages, externalImageId }: GalleryProps) {
  const images = initialImages;
  const [viewerImages, setViewerImages] = useState<GalleryImage[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const closeViewer = useCallback(() => {
    setActiveIndex(null);
    setViewerImages([]);
  }, []);

  const openSingleImage = useCallback((image: GalleryImage) => {
    setViewerImages([image]);
    setActiveIndex(0);
  }, []);

  const openCategoryImages = useCallback(
    (image: GalleryImage) => {
      const sameCategory = images.filter(
        (item) => normalizeCategory(item.category) === normalizeCategory(image.category)
      );
      const collection = sameCategory.length > 0 ? sameCategory : [image];
      const startIndex = Math.max(
        0,
        collection.findIndex((item) => item.id === image.id)
      );

      setViewerImages(collection);
      setActiveIndex(startIndex);
    },
    [images]
  );

  useEffect(() => {
    if (!externalImageId) {
      return;
    }

    const image = images.find((item) => item.id === externalImageId);
    if (image) {
      openSingleImage(image);
    }
  }, [externalImageId, images, openSingleImage]);

  useEffect(() => {
    if (activeIndex === null || viewerImages.length === 0) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeViewer();
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? 0 : (current + 1) % viewerImages.length
        );
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? 0 : (current - 1 + viewerImages.length) % viewerImages.length
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, closeViewer, viewerImages.length]);

  const activeImage = useMemo(
    () => (activeIndex === null ? null : viewerImages[activeIndex] ?? null),
    [activeIndex, viewerImages]
  );

  const canNavigate = viewerImages.length > 1;

  return (
    <section id="gallery" className="section-shell section-spacing">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          title="Gallery"
          subtitle="Campus Moments & Student Activities"
        />
        <p className="hidden text-sm text-slate-600 md:block dark:text-slate-300">
          Auto-fetched from cloud storage or local data.
        </p>
      </div>

      <div className="mt-10 grid auto-rows-[200px] gap-6 sm:auto-rows-[220px] sm:grid-cols-2 lg:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => openCategoryImages(image)}
            className={`group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 ${
              index === 0 || index === 5
                ? "sm:col-span-2 sm:row-span-2"
                : ""
            }`}
          >
            {!loadedImages[image.id] ? (
              <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" />
            ) : null}
            <Image
              src={image.url}
              alt={image.title ?? image.alt}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              quality={80}
              onLoad={() =>
                setLoadedImages((current) => ({ ...current, [image.id]: true }))
              }
              className={`object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 ${
                loadedImages[image.id] ? "opacity-100" : "opacity-0"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 max-w-full p-4 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
                {image.category}
              </p>
              <p className="mt-1 line-clamp-2 text-base font-semibold sm:text-lg">
                {image.title ?? image.alt}
              </p>
            </div>
          </button>
        ))}
      </div>

      {images.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">
          No gallery images available yet. Add images from the admin panel.
        </p>
      ) : null}

      {activeImage ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/95 p-3 sm:p-4"
          onClick={closeViewer}
        >
          <button
            type="button"
            aria-label="Close preview"
            onClick={closeViewer}
            className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white sm:right-4 sm:top-4"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Previous image"
            disabled={!canNavigate}
            onClick={(event) => {
              event.stopPropagation();
              if (!canNavigate) {
                return;
              }

              setActiveIndex((current) =>
                current === null
                  ? 0
                  : (current - 1 + viewerImages.length) % viewerImages.length
              );
            }}
            className="absolute left-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white disabled:cursor-not-allowed disabled:opacity-40 sm:left-4 sm:h-11 sm:w-11"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Next image"
            disabled={!canNavigate}
            onClick={(event) => {
              event.stopPropagation();
              if (!canNavigate) {
                return;
              }

              setActiveIndex((current) =>
                current === null ? 0 : (current + 1) % viewerImages.length
              );
            }}
            className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white disabled:cursor-not-allowed disabled:opacity-40 sm:right-4 sm:h-11 sm:w-11"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            key={activeImage.id}
            className="relative h-[62vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:h-[70vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={activeImage.url}
              alt={activeImage.title ?? activeImage.alt}
              fill
              sizes="100vw"
              quality={86}
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
