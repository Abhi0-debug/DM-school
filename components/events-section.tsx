"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { EventItem } from "@/lib/types";
import { formatDate, isUpcoming } from "@/lib/format";
import { SectionHeading } from "@/components/section-heading";

function monthLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

interface EventsSectionProps {
  initialEvents: EventItem[];
}

export function EventsSection({ initialEvents }: EventsSectionProps) {
  const [monthFilter, setMonthFilter] = useState("all");

  const sortedEvents = useMemo(
    () => [...initialEvents].sort((a, b) => +new Date(a.date) - +new Date(b.date)),
    [initialEvents]
  );

  const monthOptions = useMemo(() => {
    const months = Array.from(new Set(sortedEvents.map((event) => monthLabel(event.date))));
    return months;
  }, [sortedEvents]);

  const filteredEvents = useMemo(() => {
    if (monthFilter === "all") {
      return sortedEvents;
    }

    return sortedEvents.filter((event) => monthLabel(event.date) === monthFilter);
  }, [monthFilter, sortedEvents]);

  const campusEvents = filteredEvents.filter((event) => event.type === "event");
  const examEvents = filteredEvents.filter((event) => event.type === "exam");

  return (
    <section id="events" className="section-shell section-spacing">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading title="Events" subtitle="Upcoming Events & Exam Schedule" />
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <span>Filter month</span>
          <select
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
            className="bg-transparent outline-none"
          >
            <option value="all">All</option>
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {campusEvents.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No events found for this month filter.
          </p>
        ) : (
          campusEvents.map((event) => (
            <article
              key={event.id}
              className={`rounded-2xl border p-5 shadow-soft transition ${
                isUpcoming(event.date)
                  ? "border-brand-200 bg-brand-50/60 dark:border-brand-800/70 dark:bg-brand-900/20"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700 dark:text-brand-300">
                  {isUpcoming(event.date) ? "Upcoming" : "Completed"}
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                  <Clock3 className="h-3.5 w-3.5" /> Event
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {event.title}
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {event.description}
              </p>
              <div className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                <p className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-brand-600" /> {formatDate(event.date)}
                </p>
                <p className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-600" /> {event.location}
                </p>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Exam Schedule
        </h3>
        <div className="mt-4 space-y-3">
          {examEvents.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              No exams scheduled for this filter.
            </p>
          ) : (
            examEvents.map((exam) => (
              <div
                key={exam.id}
                className="flex flex-col gap-1 rounded-xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {exam.title}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {exam.description}
                  </p>
                </div>
                <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                  {formatDate(exam.date)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
