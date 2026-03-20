"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Bell, Calendar, SunMedium } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { NoticeItem, NoticeType } from "@/lib/types";
import { formatDate } from "@/lib/format";

const noticeTypeClasses: Record<NoticeType, string> = {
  daily: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/25 dark:text-blue-200 dark:border-blue-800",
  holiday: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800",
  alert: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:border-rose-800"
};

const noticeTabs: Array<{ key: "all" | NoticeType; label: string }> = [
  { key: "all", label: "All" },
  { key: "daily", label: "Daily" },
  { key: "holiday", label: "Holidays" },
  { key: "alert", label: "Alerts" }
];

interface NoticeBoardProps {
  initialNotices: NoticeItem[];
}

export function NoticeBoard({ initialNotices }: NoticeBoardProps) {
  const [tab, setTab] = useState<"all" | NoticeType>("all");

  const filtered = useMemo(() => {
    const sorted = [...initialNotices].sort((a, b) => +new Date(b.date) - +new Date(a.date));
    if (tab === "all") {
      return sorted;
    }
    return sorted.filter((notice) => notice.type === tab);
  }, [initialNotices, tab]);

  return (
    <section id="notices" className="section-shell section-spacing">
      <SectionHeading title="Notice Board" subtitle="Daily Updates, Holidays & Important Alerts" />

      <div className="mt-6 flex flex-wrap gap-2">
        {noticeTabs.map((item) => (
          <button
            type="button"
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === item.key
                ? "bg-brand-600 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No notices available for this filter.
          </p>
        ) : (
          filtered.map((notice) => (
            <article
              key={notice.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${noticeTypeClasses[notice.type]}`}
                >
                  {notice.type === "daily" ? (
                    <SunMedium className="h-3.5 w-3.5" />
                  ) : notice.type === "holiday" ? (
                    <Calendar className="h-3.5 w-3.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  {notice.type}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                  <Bell className="h-3.5 w-3.5" /> {formatDate(notice.date)}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {notice.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {notice.content}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
