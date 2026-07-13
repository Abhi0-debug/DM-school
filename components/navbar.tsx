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
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      for (const link of navigationLinks) {
        const section = document.querySelector(link.href);

        if (!section) continue;

        const top = (section as HTMLElement).offsetTop - 120;
        const bottom = top + (section as HTMLElement).offsetHeight;

        if (window.scrollY >= top && window.scrollY < bottom) {
          setActiveLink(link.href);
        }
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-[48px] z-50 px-3 sm:px-5">
      <div className="mx-auto max-w-7xl">
        <div
          className={`flex items-center justify-between rounded-2xl border px-3 sm:px-4 py-3 backdrop-blur-xl transition-all duration-300 ${
            scrolled
              ? "border-slate-200 bg-white/90 shadow-xl"
              : "border-white/30 bg-white/50 shadow-lg"
          }`}
        >
          {/* Logo */}

          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Logo compact mode="dark" size={34} />

            <span className="font-semibold text-slate-900 text-sm sm:text-base">
              D.M Public School
            </span>
          </Link>

          {/* Desktop Nav */}

          <nav className="hidden md:flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-2 py-2 backdrop-blur-xl">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeLink === link.href
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-700 hover:bg-white hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right */}

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              onClick={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border bg-white/80 text-slate-700 hover:bg-white dark:bg-slate-800 dark:text-white"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <Link
              href="/admin"
              className="hidden sm:inline-flex rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Admin
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border bg-white/80 text-slate-700 hover:bg-white dark:bg-slate-800 dark:text-white md:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}

        <div
          className={`overflow-hidden transition-all duration-300 md:hidden ${
            mobileOpen
              ? "mt-3 max-h-96 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="rounded-2xl border border-white/50 bg-white/90 p-3 shadow-xl backdrop-blur-xl">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  activeLink === link.href
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex justify-center rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 sm:hidden"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}