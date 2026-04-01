"use client";

import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { navigationLinks } from "@/lib/constants";
import { Logo } from "@/components/logo";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("#home");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);

      for (const link of navigationLinks) {
        const section = document.querySelector(link.href);
        if (!section) {
          continue;
        }

        const top = (section as HTMLElement).offsetTop - 120;
        const bottom = top + (section as HTMLElement).offsetHeight;
        if (window.scrollY >= top && window.scrollY < bottom) {
          setActiveLink(link.href);
        }
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 py-4 transition-all duration-300">
      <div className="section-shell">
        <div
          className={`flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 shadow-xl backdrop-blur-lg transition-all duration-300 sm:gap-4 sm:px-4 ${
            scrolled
              ? "border-slate-200/80 bg-white/85"
              : "border-white/20 bg-white/20"
          }`}
        >
          <Link href="#home" className="flex min-w-0 flex-1 items-center lg:flex-none">
            <div className="flex min-w-0 flex-col items-center justify-center gap-1 text-center">
              <Logo compact mode={scrolled ? "dark" : "light"} size={28} />
              <p
                className={`truncate text-xs font-semibold leading-none sm:text-sm ${
                  scrolled ? "text-slate-900" : "text-white drop-shadow-md"
                }`}
              >
                D.M. Public School
              </p>
            </div>
          </Link>

          <nav
            className={`hidden items-center gap-1 rounded-full border p-1 backdrop-blur-lg lg:flex ${
              scrolled
                ? "border-slate-200 bg-slate-100/80"
                : "border-white/20 bg-white/10"
            }`}
          >
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  activeLink === link.href
                    ? "bg-blue-600 text-white shadow-lg"
                    : scrolled
                      ? "text-slate-700 hover:bg-slate-200"
                      : "text-white/95 hover:bg-white/20"
                }`}
                aria-current={activeLink === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 ${
                scrolled
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <Link
              href="/admin"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-700"
            >
              Admin
            </Link>
          </div>

          <button
            type="button"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 lg:hidden ${
              scrolled
                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                : "border-white/20 bg-white/10 text-white hover:bg-white/20"
            }`}
            onClick={() => setMobileOpen((current) => !current)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          className={`section-shell mt-2 flex flex-col gap-2 rounded-2xl border p-4 shadow-xl backdrop-blur-lg transition-all duration-300 lg:hidden ${
            scrolled
              ? "border-slate-200/80 bg-white/90"
              : "border-white/20 bg-white/20"
          }`}
        >
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                activeLink === link.href
                  ? "bg-blue-600 text-white"
                  : scrolled
                    ? "text-slate-700 hover:bg-slate-200"
                    : "text-white/95 hover:bg-white/20"
              }`}
              onClick={() => setMobileOpen(false)}
              aria-current={activeLink === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 ${
                scrolled
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-700"
            >
              Admin
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
