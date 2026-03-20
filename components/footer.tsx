import Link from "next/link";
import { navigationLinks } from "@/lib/constants";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/80 py-8 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="section-shell flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {siteConfig.name}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {siteConfig.tagline}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
          {navigationLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          (c) {new Date().getFullYear()} DM Public School. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
