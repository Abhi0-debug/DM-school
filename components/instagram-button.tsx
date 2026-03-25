"use client";

import { Instagram } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function InstagramButton() {
  const instaLink = siteConfig.socials.instagram || "#"; // ✅ THIS LINE WAS MISSING

  return (
    <a
      href={instaLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:scale-[1.02]"
      aria-label="Instagram"
    >
      <Instagram className="h-5 w-5" />
      Instagram
    </a>
  );
}