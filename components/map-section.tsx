import { siteConfig } from "@/lib/site-config";

const mapUrl =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED ??
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4628.70474440823!2d85.82680267595559!3d19.806225628641517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19c74d67f7fd71%3A0x6dff7237ed41ef16!2sD.M.PUBLIC%20SCHOOL!5e1!3m2!1sen!2sin!4v1774950217299!5m2!1sen!2sin";

export function MapSection() {
  return (
    <section
      id="location"
      className="section-shell section-spacing pt-6"
      aria-labelledby="location-heading"
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-5 dark:border-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
            Campus Location
          </p>
          <h2
            id="location-heading"
            className="mt-1 break-words text-xl font-semibold text-slate-900 dark:text-white"
          >
            Visit {siteConfig.name}
          </h2>
        </div>
        <iframe
          src={mapUrl}
          allowFullScreen
          loading="lazy"
          className="h-64 w-full sm:h-96"
          referrerPolicy="no-referrer-when-downgrade"
          title="DM Public School map"
        />
      </div>
    </section>
  );
}
