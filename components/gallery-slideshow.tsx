"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { GalleryImage } from "@/lib/types";

interface GallerySlideshowProps {
  initialImages: GalleryImage[];
}

function getGalleryAltText(image: GalleryImage) {
  const explicitText = (image.title ?? image.alt ?? "").trim();
  if (explicitText.length > 0) {
    return explicitText;
  }

  return `${image.category} activity at DM Public School Puri`;
}

export function GallerySlideshow({ initialImages }: GallerySlideshowProps) {
  const images = initialImages;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const canNavigate = images.length > 1;
  const isPreviewOpen = previewIndex !== null;
  const isPaused = isHovered || isDocumentHidden || isPreviewOpen;

  useEffect(() => {
    setActiveIndex((current) =>
      images.length === 0 ? 0 : Math.min(current, images.length - 1)
    );
  }, [images.length]);

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsDocumentHidden(document.visibilityState !== "visible");
    };

    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (!canNavigate || isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [canNavigate, images.length, isPaused]);

  useEffect(() => {
    if (!isPreviewOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isPreviewOpen]);

  const navigatePreview = useCallback(
    (direction: "next" | "previous") => {
      if (!canNavigate || previewIndex === null) {
        return;
      }

      const nextIndex =
        direction === "next"
          ? (previewIndex + 1) % images.length
          : (previewIndex - 1 + images.length) % images.length;

      setPreviewIndex(nextIndex);
      setActiveIndex(nextIndex);
    },
    [canNavigate, images.length, previewIndex]
  );

  const closePreview = useCallback(() => {
    setPreviewIndex(null);
  }, []);

  useEffect(() => {
    if (!isPreviewOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview();
      }

      if (event.key === "ArrowRight") {
        navigatePreview("next");
      }

      if (event.key === "ArrowLeft") {
        navigatePreview("previous");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closePreview, isPreviewOpen, navigatePreview]);

  const goToPrevious = () => {
    if (!canNavigate) {
      return;
    }

    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    if (!canNavigate) {
      return;
    }

    setActiveIndex((current) => (current + 1) % images.length);
  };

  const openPreview = () => {
    setPreviewIndex(activeIndex);
  };

  const previewImage =
    previewIndex === null ? null : images[Math.min(previewIndex, images.length - 1)] ?? null;

  if (images.length === 0) {
    return (
      <section
        id="gallery"
        className="section-shell section-spacing"
        aria-labelledby="gallery-heading"
      >
        <SectionHeading
          title="Gallery"
          subtitle="Campus Moments & Student Activities"
          headingId="gallery-heading"
        />
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">
          No gallery images available yet. Add images from the admin panel.
        </p>
      </section>
    );
  }

  return (
    <section
      id="gallery"
      className="section-shell section-spacing"
      aria-labelledby="gallery-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          title="Gallery"
          subtitle="Campus Moments & Student Activities"
          headingId="gallery-heading"
        />
      </div>

      <div
        className="group relative mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-soft dark:border-slate-700"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocusCapture={() => setIsHovered(true)}
        onBlurCapture={() => setIsHovered(false)}
        aria-roledescription="carousel"
        aria-label="Campus moments slideshow"
      >
        <div className="relative h-[55vh] min-h-[320px] max-h-[760px] w-full">
          {images.map((image, index) => (
            <div
              key={image.id}
              aria-hidden={index !== activeIndex}
              className={`absolute inset-0 transition-opacity duration-[1100ms] ease-out ${
                index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Image
                src={image.url}
                alt={getGalleryAltText(image)}
                fill
                priority={index === 0}
                sizes="100vw"
                className={`object-cover transition-transform duration-[5200ms] ease-out ${
                  index === activeIndex ? "scale-105" : "scale-100"
                }`}
              />
              {index === activeIndex ? (
                <button
                  type="button"
                  aria-label={`Open full image: ${getGalleryAltText(image)}`}
                  onClick={openPreview}
                  className="absolute inset-0 z-[1] cursor-zoom-in"
                >
                  <span className="sr-only">Open full image</span>
                </button>
              ) : null}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 z-[2] p-5 text-white sm:p-7">
                <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
                  {image.category}
                </p>
                <p className="mt-3 max-w-3xl text-lg font-semibold sm:text-2xl">
                  {getGalleryAltText(image)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {canNavigate ? (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/35 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/45 group-focus-within:opacity-100 group-hover:opacity-100 sm:left-4 sm:h-11 sm:w-11"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/35 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/45 group-focus-within:opacity-100 group-hover:opacity-100 sm:right-4 sm:h-11 sm:w-11"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full bg-black/30 px-2.5 py-2 backdrop-blur-sm sm:bottom-5 sm:right-5">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "w-10 bg-white"
                      : "w-3 bg-white/45 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {previewImage ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/92 backdrop-blur-sm p-3 sm:p-4"
          onClick={closePreview}
        >
          <button
            type="button"
            aria-label="Close preview"
            onClick={(event) => {
              event.stopPropagation();
              closePreview();
            }}
            className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white sm:right-4 sm:top-4"
          >
            <X className="h-5 w-5" />
          </button>

          {canNavigate ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(event) => {
                  event.stopPropagation();
                  navigatePreview("previous");
                }}
                className="absolute left-2 top-1/2 z-[81] inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 sm:left-4 sm:h-11 sm:w-11"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(event) => {
                  event.stopPropagation();
                  navigatePreview("next");
                }}
                className="absolute right-2 top-1/2 z-[81] inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 sm:right-4 sm:h-11 sm:w-11"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}

          <div
            className="relative h-[86vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all duration-200 ease-out"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={previewImage.url}
              alt={getGalleryAltText(previewImage)}
              fill
              unoptimized
              sizes="100vw"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
