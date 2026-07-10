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

export function Hero({ initialSlides, admissionsText }: HeroProps) {
  const slides = initialSlides;
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeButton, setActiveButton] = useState<"explore" | "contact">( "explore");
  const bannerText = admissionsText.trim();
  const hasSlides = slides.length > 0;

  useEffect(() => {
    if (!hasSlides || slides.length < 2) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [hasSlides, slides.length]);

  const current = useMemo(
    () => (hasSlides ? slides[activeIndex] ?? slides[0] : null),
    [activeIndex, hasSlides, slides]
  );

  if (!hasSlides) {
    return null;
  }

  return (
    <section
      id="home"
      className="relative flex h-screen min-h-[100svh] items-end overflow-hidden bg-hero-gradient pt-24"
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
          className={`object-cover object-center transition-all duration-1000 ${
            activeIndex === index ? "opacity-100 scale-105" : "opacity-0 scale-100"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/55 to-slate-950/45" />

      <div className="section-shell relative z-10 pb-16 pt-32 text-white sm:pb-24 sm:pt-40">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          {bannerText ? (
            <p
              className="inline-flex max-w-full animate-rise-in rounded-full border border-white/25 bg-white/10 px-4 py-2 text-center text-xs font-semibold uppercase leading-tight tracking-[0.2em] backdrop-blur-md sm:px-5 sm:text-sm md:text-base md:tracking-[0.25em]"
              style={{ animationDelay: "0ms" }}
            >
              {bannerText}
            </p>
          ) : null}

          <div
            className="mt-8 flex animate-rise-in flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
            style={{ animationDelay: "80ms" }}
          >
            <div className="scale-125 sm:scale-150 md:scale-175">
              <Logo mode="light" variant="hero" />
            </div>
            <h1 className="max-w-3xl break-words text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {siteConfig.name}
            </h1>
          </div>

          <p
            className="mt-6 max-w-2xl animate-rise-in text-base text-slate-100 sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            {siteConfig.tagline}
          </p>

          <div
          className="relative mt-10 flex rounded-full border border-white/30 bg-white/10 p-1 backdrop-blur-md animate-rise-in "
           style={{ animationDelay: "220ms" }}
           >
             <div className={` absolute top-1 h-[calc(100%-8px)] w-32 rounded-full bg-blue-600 transition-all duration-300 ease-in-out
              ${  activeButton === "explore"  ? "left-1": "left-[132px]"   } `}
              
            />
            <Link href="#gallery"
              onMouseEnter={() => setActiveButton("explore")}
              className=" relative z-10 flex h-12 w-32 items-center justify-center rounded-full text-s font-semibold text-white " >
                
              Explore
               </Link>
              
               <Link
                href="#contact"
                onMouseEnter={() => setActiveButton("contact")}
                className="relative  z-10 flex h-12 w-32 items-center justify-center rounded-full text-sm font-semibold text-white "
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

        <p className="mt-4 break-words text-center text-xs text-slate-200/80">{current?.alt}</p>
      </div>
    </section>
  );
}
