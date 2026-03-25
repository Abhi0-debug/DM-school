import { siteConfig } from "@/lib/site-config";

const mapUrl =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED ??
  "https://maps.google.com/maps?q=New%20Delhi&t=&z=13&ie=UTF8&iwloc=&output=embed";

export function MapSection() {
  return (
    <section className="section-shell section-spacing pt-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
            Campus Location
          </p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
            Visit {siteConfig.name}
          </h3>
        </div>
        <iframe
          src={mapUrl}
          loading="lazy"
          className="h-72 w-full sm:h-96"
          referrerPolicy="no-referrer-when-downgrade"
          title="DM Public School map"
        />
      </div>
    </section>
  );
}
