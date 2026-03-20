"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GalleryImage } from "@/lib/types";
import { SectionHeading } from "@/components/section-heading";

interface GalleryProps {
  initialImages: GalleryImage[];
}

export function Gallery({ initialImages }: GalleryProps) {
  const images = initialImages;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null || images.length === 0) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? 0 : (current + 1) % images.length
        );
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? 0 : (current - 1 + images.length) % images.length
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, images.length]);

  useEffect(() => {
    if (activeIndex === null || images.length < 2) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((current) =>
        current === null ? 0 : (current + 1) % images.length
      );
    }, 3500);

    return () => clearInterval(timer);
  }, [activeIndex, images.length]);

  const activeImage = useMemo(
    () => (activeIndex === null ? null : images[activeIndex]),
    [activeIndex, images]
  );

  return (
    <section id="gallery" className="section-shell section-spacing">
      <div className="flex items-end justify-between gap-4">
        <SectionHeading
          title="Gallery"
          subtitle="Campus Moments & Student Activities"
        />
        <p className="hidden text-sm text-slate-600 md:block dark:text-slate-300">
          Auto-fetched from cloud storage or local data.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative h-52 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-800"
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              quality={80}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-3 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-200">
                {image.category}
              </p>
              <p className="line-clamp-1 text-sm">{image.alt}</p>
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
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 p-4"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Previous image"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex((current) =>
                current === null ? 0 : (current - 1 + images.length) % images.length
              );
            }}
            className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Next image"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex((current) =>
                current === null ? 0 : (current + 1) % images.length
              );
            }}
            className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            key={activeImage.id}
            className="relative h-[70vh] w-full max-w-5xl overflow-hidden rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={activeImage.url}
              alt={activeImage.alt}
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
