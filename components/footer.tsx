import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, MapPin, MessageCircleMore, Phone, Youtube } from "lucide-react";
import { navigationLinks } from "@/lib/constants";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const rawPhone = siteConfig.socials.whatsapp.replace(/\D/g, "");
  const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
  const whatsappHref = `https://wa.me/${phone}?text=Hello%20DM%20Public%20School`;

  return (
    <footer className="border-t border-slate-200 bg-white/80 py-10 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="section-shell">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <Image
                  src={siteConfig.logo.imagePath}
                  alt="DM Public School Puri logo"
                  fill
                  sizes="40px"
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0">
                <p className="break-words text-base font-semibold text-slate-900 dark:text-slate-100">
                  {siteConfig.name}
                </p>
                <p className="break-words text-sm text-slate-600 dark:text-slate-300">
                  {siteConfig.tagline}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p className="inline-flex items-start gap-2 break-words">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>{siteConfig.contact.email}</span>
              </p>
              <p className="inline-flex items-start gap-2 break-words">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>{siteConfig.contact.phone}</span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-800 dark:text-slate-100">
              Quick Links
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-brand-600 dark:hover:text-brand-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-800 dark:text-slate-100">
              Connect
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-3 py-1.5 text-sm font-medium text-pink-700 transition hover:bg-pink-100 dark:border-pink-900/60 dark:bg-pink-950/30 dark:text-pink-300"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                aria-label="WhatsApp"
              >
                <MessageCircleMore className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={siteConfig.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
                YouTube
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:text-slate-400">
          <p>© {new Date().getFullYear()} D.M. Public School. All rights reserved.</p>
          <p className="inline-flex items-start gap-1.5 break-words sm:max-w-[60%]">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{siteConfig.contact.address}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
