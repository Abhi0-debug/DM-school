"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { HeroSlide } from "@/lib/types";
import { Logo } from "@/components/logo";

interface HeroProps {
  initialSlides: HeroSlide[];
  admissionsText: string;
}

export function Hero({ initialSlides }: HeroProps) {
  const slides = initialSlides;
  const [activeIndex, setActiveIndex] = useState(0);
  const hasSlides = slides.length > 0;

  useEffect(() => {
    if (!hasSlides || slides.length < 2) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [hasSlides, slides.length]);

  const current = useMemo(
    () => (hasSlides ? slides[activeIndex] ?? slides[0] : null),
    [activeIndex, hasSlides, slides]
  );

  if (!hasSlides) return null;

  return (
    <section
      id="home"
      className="relative flex h-screen min-h-[100svh] items-end overflow-hidden bg-hero-gradient pt-[160px]"
    >
      {/* 🔹 BACKGROUND */}
      {slides.map((slide, index) => (
        <Image
          key={slide.id}
          src={slide.url}
          alt={slide.alt}
          fill
          priority={index === 0}
          className={`object-cover transition-all duration-1000 ${
            activeIndex === index ? "opacity-100 scale-105" : "opacity-0"
          }`}
        />
      ))}

      {/* 🔹 OVERLAYS */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/55 to-slate-950/45" />

      {/* 🔹 CONTENT */}
      <div className="section-shell relative z-10 pb-20 pt-10 text-white sm:pb-28">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">

          {/* LOGO + TITLE */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <div className="scale-125 sm:scale-150 md:scale-175">
              <Logo mode="light" variant="hero" />
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold">
              {siteConfig.name}
            </h1>
          </div>

          {/* TAGLINE */}
          <p className="mt-6 max-w-2xl text-base text-slate-100 sm:text-lg">
            {siteConfig.tagline}
          </p>

          {/* BUTTONS */}
          <div className="mt-10 flex gap-4">
            <Link
              href="#gallery"
              className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:scale-105 hover:bg-blue-700 transition"
            >
              Explore
            </Link>

            <Link
              href="#contact"
              className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md hover:scale-105 hover:bg-white/20 transition"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* DOTS */}
        <div className="mt-12 flex justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className={`h-2.5 rounded-full ${
                index === activeIndex ? "w-7 bg-white" : "w-2.5 bg-white/50"
              }`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>

        {/* SLIDE TEXT */}
        <p className="mt-4 text-center text-xs text-slate-200/80">
          {current?.alt}
        </p>
      </div>
    </section>
  );
}