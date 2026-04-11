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
      setScrolled(window.scrollY > 50);

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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 w-full z-50 relative before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-3 before:bg-white/98 transition-all duration-300 ${
        scrolled ? "top-0" : "top-[48px]"
      } ${
        scrolled
          ? "overflow-hidden border-b border-slate-200/70 bg-white/96 supports-[backdrop-filter]:bg-white/88 backdrop-blur-xl shadow-[0_14px_38px_rgba(15,23,42,0.16)]"
          : "overflow-hidden border-b border-white/55 bg-white/86 supports-[backdrop-filter]:bg-white/62 backdrop-blur-2xl shadow-[0_10px_30px_rgba(15,23,42,0.14)]"
      }`}
    >
      <div className="section-shell relative flex items-center justify-between py-3">

        {/* 🔹 LEFT LOGO */}
        <Link
          href="#home"
          className="flex items-center gap-2"
          aria-label="Go to home section"
        >
          <Logo compact mode="dark" size={32} />
          <span className="font-semibold text-sm text-slate-900">
            D.M Public School
          </span>
        </Link>

        {/* 🔹 CENTER NAV */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-2 rounded-full border border-white/70 bg-white/82 px-4 py-1 shadow-[0_8px_24px_rgba(15,23,42,0.14)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/60"
        >
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-out ${
                activeLink === link.href
                  ? "bg-blue-600 text-white shadow-[0_6px_14px_rgba(37,99,235,0.4)]"
                  : "text-slate-700 hover:bg-white hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 🔹 RIGHT ACTIONS */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="h-10 w-10 flex items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-800 shadow-[0_6px_16px_rgba(15,23,42,0.12)] backdrop-blur-md transition duration-200 ease-out hover:bg-white supports-[backdrop-filter]:bg-white/60"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <Link
            href="/admin"
            className="rounded-full border border-blue-200/80 bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.34)] transition duration-200 ease-out hover:bg-blue-700"
          >
            Admin
          </Link>
        </div>

        {/* 🔹 MOBILE BUTTON */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-800 shadow-[0_6px_16px_rgba(15,23,42,0.12)] backdrop-blur-md transition duration-200 ease-out hover:bg-white supports-[backdrop-filter]:bg-white/60"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* 🔹 MOBILE MENU */}
      {mobileOpen && (
        <div
          id="mobile-navigation"
          className="lg:hidden space-y-2 border-t border-white/70 bg-white/90 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.18)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/72"
        >
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-slate-800 transition duration-200 ease-out hover:bg-white/85"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
