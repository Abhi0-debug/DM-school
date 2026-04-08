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
      className={`fixed left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "top-0" : "top-[48px]"
      } ${
        scrolled
          ? "bg-white shadow-md border-b border-slate-200"
          : "bg-white/80 backdrop-blur-md border-b border-slate-200/50"
      }`}
    >
      <div className="section-shell flex items-center justify-between py-3">

        {/* 🔹 LEFT LOGO */}
        <Link href="#home" className="flex items-center gap-2">
          <Logo compact mode="dark" size={32} />
          <span className="font-semibold text-sm text-slate-900">
            D.M Public School
          </span>
        </Link>

        {/* 🔹 CENTER NAV */}
        <nav className="hidden md:flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-1 rounded-full shadow-lg">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeLink === link.href
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-200"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 🔹 RIGHT ACTIONS */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-100 shadow-sm"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <Link
            href="/admin"
            className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 shadow-sm"
          >
            Admin
          </Link>
        </div>

        {/* 🔹 MOBILE BUTTON */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* 🔹 MOBILE MENU */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t p-4 space-y-2 shadow-md">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-800"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}