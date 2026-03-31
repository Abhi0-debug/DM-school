"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { GalleryImage } from "@/lib/types";

interface GallerySlideshowProps {
  initialImages: GalleryImage[];
}

export function GallerySlideshow({ initialImages }: GallerySlideshowProps) {
  const images = initialImages;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);

  const canNavigate = images.length > 1;
  const isPaused = isHovered || isDocumentHidden;

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

  if (images.length === 0) {
    return (
      <section id="gallery" className="section-shell section-spacing">
        <SectionHeading
          title="Gallery"
          subtitle="Campus Moments & Student Activities"
        />
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">
          No gallery images available yet. Add images from the admin panel.
        </p>
      </section>
    );
  }

  return (
    <section id="gallery" className="section-shell section-spacing">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          title="Gallery"
          subtitle="Campus Moments & Student Activities"
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
                alt={image.title ?? image.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className={`object-cover transition-transform duration-[5200ms] ease-out ${
                  index === activeIndex ? "scale-105" : "scale-100"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
                <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
                  {image.category}
                </p>
                <p className="mt-3 max-w-3xl text-lg font-semibold sm:text-2xl">
                  {image.title ?? image.alt}
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
    </section>
  );
}
