"use client";

import { useEffect, useMemo, useState } from "react";

interface ActiveAnnouncement {
  id: string;
  text: string;
}

const FALLBACK_TEXT =
  "Admissions Open for 2026 - 2027 • Welcome to D.M. Public School •";

function hasSameAnnouncements(
  previous: ActiveAnnouncement[],
  next: ActiveAnnouncement[]
) {
  if (previous.length !== next.length) {
    return false;
  }

  return previous.every(
    (item, index) => 
      item.id === next[index]?.id && 
      item.text === next[index]?.text
  );
}

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<ActiveAnnouncement[]>([]);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadAnnouncements = async () => {
      try {
        const response = await fetch("/api/announcements", {
          cache: "no-store",
          signal: controller.signal
        });

        if (!response.ok) {
          return;
        }

        const payload = await response.json();

        const next = (payload.announcements ?? [])
          .filter((item: ActiveAnnouncement) => item.text)
          .map((item: ActiveAnnouncement) => ({ 
            id: item.id, 
            text: item.text.trim() 
          }));

        setAnnouncements((current) =>
          hasSameAnnouncements(current, next) ? current : next
        );
      } catch {
        // Keep fallback text if request fails.
      }
    };

    void loadAnnouncements();
    const interval = setInterval(loadAnnouncements, 60000);

    return () => {
      controller.abort();
      clearInterval(interval)
    };
  }, []);

  // Hide on scroll down
  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const current = window.scrollY;

      if (current > lastScroll && current > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScroll = current;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const text = useMemo(() => {
    if (!announcements.length) return FALLBACK_TEXT;

    return announcements.map((a) => a.text).join(" ◆ ") + " ◆ ";
  }, [announcements]);

  return (
    <div
      className={`fixed top-0 left-0 z-50 w-full h-12 bg-slate-900 text-white overflow-hidden transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex h-full items-center group">

        {/* Label */}

        <div className="hidden md:flex items-center px-5 font-semibold border-r border-white/20 whitespace-nowrap">
          📢 ANNOUNCEMENTS
        </div>

        {/* Marquee */}

        <div className="relative flex-1 overflow-hidden">

          <div className="flex whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]">

            <span className="px-6">{text}</span>

            <span className="px-6" aria-hidden="true">
              {text}
            </span>

            <span className="px-6" aria-hidden="true">
              {text}
            </span>

          </div>

        </div>

      </div>
    </div>
  );
}
