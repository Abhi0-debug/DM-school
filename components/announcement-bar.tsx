"use client";

import { useEffect, useMemo, useState } from "react";

interface ActiveAnnouncement {
  id: string;
  text: string;
}

const FALLBACK_TEXT =
  "GENERAL SCIENCE AND SPARK ENGINEERING ARE PUBLISHED NOW!! \u2022 SECOND LIST (UNIT-1) FOR GENERAL SCIENCE AND SPARK ENGINEERING IS OUT NOW!!";

function hasSameAnnouncements(
  previous: ActiveAnnouncement[],
  next: ActiveAnnouncement[]
) {
  if (previous.length !== next.length) {
    return false;
  }

  return previous.every(
    (item, index) => item.id === next[index]?.id && item.text === next[index]?.text
  );
}

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<ActiveAnnouncement[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const loadAnnouncements = async () => {
      try {
        const response = await fetch("/api/announcements", {
          cache: "no-store",
          signal: controller.signal
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          announcements?: ActiveAnnouncement[];
        };

        if (!mounted) {
          return;
        }

        const next = (payload.announcements ?? [])
          .filter((item) => typeof item.text === "string")
          .map((item) => ({ id: item.id, text: item.text.trim() }))
          .filter((item) => item.text.length > 0);

        setAnnouncements((current) =>
          hasSameAnnouncements(current, next) ? current : next
        );
      } catch {
        // Keep fallback text if request fails.
      }
    };

    void loadAnnouncements();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const text = useMemo(() => {
    const merged = announcements.map((item) => item.text).join(" \u2022 ");
    return merged.length > 0 ? merged : FALLBACK_TEXT;
  }, [announcements]);

  const loopText = useMemo(() => {
    return text.endsWith(" \u2022") ? text : `${text} \u2022`;
  }, [text]);

  return (
    <div className="fixed top-0 left-0 w-full z-40 bg-green-600 text-white h-12 flex items-center overflow-hidden">
      {/* LEFT STATIC LABEL */}
      <div className="flex items-center gap-2 px-4 font-semibold whitespace-nowrap border-r border-white/30">
        {"\u{1F4E2}"} <span>ANNOUNCEMENTS</span>
      </div>

      {/* SCROLLING TEXT */}
      <div className="relative flex-1 overflow-hidden">
        <div className="flex whitespace-nowrap text-sm">
          <span className="shrink-0 min-w-full px-4 animate-marquee">
            {loopText}
          </span>
          <span
            aria-hidden="true"
            className="shrink-0 min-w-full px-4 animate-marquee"
          >
            {loopText}
          </span>
        </div>
      </div>
    </div>
  );
}
