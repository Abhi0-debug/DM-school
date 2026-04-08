"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface BannerItem {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
}

interface AdmissionBannerProps {
  banners?: BannerItem[];
}

export function AdmissionBanner({ banners = [] }: AdmissionBannerProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // ✅ ALWAYS call hooks first
  useEffect(() => {
    if (banners.length <= 1 || paused) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners, paused]);

  // ✅ THEN conditionally render
  if (!banners || banners.length === 0) return null;

  return (
    <section className="relative z-40 -mb-14 mt-[90px] sm:mt-[100px]">
      <div className="w-full">

        <div
          className="relative h-[120px] sm:h-[140px] md:h-[160px] overflow-hidden shadow-xl border border-white/10 rounded-none sm:rounded-xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >

          {/* 🔹 SLIDES */}
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === active
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-105"
              }`}
            >
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
              />

              {/* 🔥 PREMIUM OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
              <div className="absolute inset-0 backdrop-blur-[4px]" />

              {/* 🔹 CONTENT */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-white">

                <h2 className="text-base sm:text-xl md:text-2xl font-semibold tracking-wide">
                  {banner.title}
                </h2>

                <p className="mt-1 text-xs sm:text-sm text-white/80 max-w-md">
                  {banner.subtitle}
                </p>

              </div>
            </div>
          ))}

          {/* 🔹 DOTS */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActive(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === active
                      ? "w-6 bg-white"
                      : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}

          {/* 🔥 BLEND */}
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-transparent to-black/40" />

        </div>
      </div>
    </section>
  );
}