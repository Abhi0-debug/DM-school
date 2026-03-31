import Link from "next/link";
import Image from "next/image";
import { Instagram, MessageCircleMore } from "lucide-react";
import { navigationLinks } from "@/lib/constants";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const phone = siteConfig.socials.whatsapp.replace(/\D/g, "");
  const whatsappHref = `https://wa.me/${phone}?text=Hello%20DM%20Public%20School`;

  return (
    <footer className="border-t border-slate-200 bg-white/80 py-8 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="section-shell flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <Image
                src={siteConfig.logo.imagePath}
                alt={`${siteConfig.shortName} logo`}
                fill
                className="object-contain p-0.5"
                sizes="28px"
              />
            </div>
            <div className="min-w-0">
              <p className="break-words text-sm font-semibold text-slate-900 dark:text-slate-100">
                {siteConfig.name}
              </p>
              <p className="break-words text-xs text-slate-600 dark:text-slate-300">
                {siteConfig.tagline}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
          {navigationLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <a
            href={siteConfig.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
            aria-label="Instagram"
          >
            <Instagram className="h-4 w-4" />
            Instagram
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            aria-label="WhatsApp"
          >
            <MessageCircleMore className="h-4 w-4" />
            WhatsApp
          </a>
        </div>

        <p className="break-words text-xs text-slate-500 dark:text-slate-400">
          (c) {new Date().getFullYear()} DM Public School. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
