import Image from "next/image";
import { BookOpen, Flame } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

interface LogoProps {
  compact?: boolean;
  mode?: "light" | "dark";
}

export function Logo({ compact = false, mode = "light" }: LogoProps) {
  const useImage = siteConfig.logo.mode === "image";
  const isDarkModeSurface = mode === "dark";

  if (useImage) {
    return (
      <div
        className={`relative h-11 w-11 overflow-hidden rounded-full border shadow-lg backdrop-blur-lg ${
          isDarkModeSurface
            ? "border-slate-200 bg-white"
            : "border-white/25 bg-white/15"
        }`}
      >
        <Image
          src={siteConfig.logo.imagePath}
          alt={`${siteConfig.shortName} logo`}
          fill
          className="object-cover"
          sizes="44px"
          priority
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-11 w-11 items-center justify-center overflow-hidden border shadow-lg backdrop-blur-lg ${
        siteConfig.logo.style === "shield" ? "rounded-[14px]" : "rounded-full"
      } ${
        isDarkModeSurface ? "border-brand-200" : "border-white/25"
      }`}
      data-surface={mode}
      aria-label={`${siteConfig.shortName} placeholder logo`}
    >
      <div
        className={`absolute inset-0 ${
          isDarkModeSurface
            ? "bg-gradient-to-br from-brand-100 to-brand-300"
            : "bg-white/15"
        }`}
      />
      <BookOpen
        className={`relative z-[1] h-5 w-5 ${
          isDarkModeSurface ? "text-brand-900" : "text-white"
        }`}
        strokeWidth={2.1}
      />
      <Flame
        className={`absolute -top-1 right-0 h-4 w-4 ${
          isDarkModeSurface ? "text-orange-500" : "text-orange-300"
        }`}
        strokeWidth={2.1}
      />
      {!compact ? (
        <span className="absolute -bottom-[2px] left-1/2 z-[1] -translate-x-1/2 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white">
          {siteConfig.shortName}
        </span>
      ) : null}
    </div>
  );
}
