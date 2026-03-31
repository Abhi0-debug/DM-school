interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className = "" }: CardSkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 ${className}`}
      aria-hidden
    />
  );
}

export function HeroSkeleton() {
  return (
    <section
      id="home"
      className="relative flex h-screen min-h-[100svh] items-end overflow-hidden bg-slate-900 pt-24"
      aria-label="Loading hero section"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800" />
      <div className="section-shell relative z-10 w-full pb-16 pt-32 sm:pb-24 sm:pt-40">
        <div className="mx-auto max-w-4xl space-y-6">
          <CardSkeleton className="h-10 w-56 rounded-full bg-white/20 dark:bg-white/20" />
          <CardSkeleton className="h-16 w-full max-w-2xl bg-white/15 dark:bg-white/15" />
          <CardSkeleton className="h-6 w-full max-w-xl bg-white/10 dark:bg-white/10" />
          <div className="flex gap-4">
            <CardSkeleton className="h-11 w-32 rounded-full bg-white/20 dark:bg-white/20" />
            <CardSkeleton className="h-11 w-32 rounded-full bg-white/15 dark:bg-white/15" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function GallerySkeleton() {
  return (
    <section id="gallery" className="section-shell section-spacing" aria-label="Loading gallery">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <CardSkeleton className="h-14 w-72" />
        <CardSkeleton className="hidden h-4 w-56 md:block" />
      </div>
      <div className="mt-10 grid auto-rows-[200px] gap-6 sm:auto-rows-[220px] sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <CardSkeleton
            key={`gallery-skeleton-${index}`}
            className={index === 0 || index === 5 ? "sm:col-span-2 sm:row-span-2" : ""}
          />
        ))}
      </div>
    </section>
  );
}

export function EventsSkeleton() {
  return (
    <section id="events" className="section-shell section-spacing" aria-label="Loading events">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <CardSkeleton className="h-14 w-80" />
        <CardSkeleton className="h-11 w-48 rounded-xl" />
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton key={`event-skeleton-${index}`} className="h-52" />
        ))}
      </div>
      <CardSkeleton className="mt-10 h-44" />
    </section>
  );
}

export function NoticeBoardSkeleton() {
  return (
    <section
      id="notices"
      className="section-shell section-spacing"
      aria-label="Loading notices"
    >
      <CardSkeleton className="h-14 w-96" />
      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={`notice-tab-${index}`} className="h-10 w-20 rounded-full" />
        ))}
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={`notice-card-${index}`} className="h-44" />
        ))}
      </div>
    </section>
  );
}

export function StaffSkeleton() {
  return (
    <section id="staff" className="section-shell section-spacing" aria-label="Loading staff">
      <CardSkeleton className="h-14 w-72" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={`staff-card-${index}`} className="h-80" />
        ))}
      </div>
    </section>
  );
}

export function DownloadsSkeleton() {
  return (
    <section className="section-shell section-spacing" aria-label="Loading downloads">
      <CardSkeleton className="h-14 w-80" />
      <div className="mt-8 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton key={`download-row-${index}`} className="h-20 rounded-xl" />
        ))}
      </div>
    </section>
  );
}
