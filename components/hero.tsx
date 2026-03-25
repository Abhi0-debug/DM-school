"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { HeroSlide } from "@/lib/types";
import { fallbackHeroSlides } from "@/lib/constants";

interface HeroProps {
  initialSlides: HeroSlide[];
}

export function Hero({ initialSlides }: HeroProps) {
  const slides = initialSlides.length > 0 ? initialSlides : fallbackHeroSlides;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [slides.length]);

  const current = useMemo(
    () => slides[activeIndex] ?? slides[0],
    [activeIndex, slides]
  );

  return (
    <section
      id="home"
      className="relative flex min-h-[92vh] items-end overflow-hidden bg-hero-gradient pt-24"
    >
      {slides.map((slide, index) => (
        <Image
          key={slide.id}
          src={slide.url}
          alt={slide.alt}
          fill
          priority={index === 0}
          loading={index === 0 ? "eager" : "lazy"}
          sizes="100vw"
          quality={82}
          className={`object-cover transition-opacity duration-700 ${
            activeIndex === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/65 to-slate-950/55" />

      <div className="section-shell relative z-10 pb-20 pt-24 text-white sm:pb-24 sm:pt-32">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <p
            className="inline-flex animate-rise-in rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-md"
            style={{ animationDelay: "0ms" }}
          >
            Admissions Open 2026
          </p>

          <h1
            className="mt-8 max-w-3xl animate-rise-in text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            {siteConfig.name}
          </h1>

          <p
            className="mt-6 max-w-2xl animate-rise-in text-base text-slate-100 sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            {siteConfig.tagline}
          </p>

          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-rise-in"
            style={{ animationDelay: "220ms" }}
          >
            <Link
              href="#gallery"
              className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-700"
            >
              Explore
            </Link>
            <Link
              href="#contact"
              className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20"
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-7 bg-white" : "w-2.5 bg-white/50"
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-slate-200/80">{current?.alt}</p>
      </div>
    </section>
  );
}
