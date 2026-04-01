import { FileDown } from "lucide-react";
import { formatDate } from "@/lib/format";
import { SectionHeading } from "@/components/section-heading";
import { DownloadItem } from "@/lib/types";

interface DownloadsSectionProps {
  items: DownloadItem[];
}

export function DownloadsSection({ items }: DownloadsSectionProps) {
  return (
    <section
      id="downloads"
      className="section-shell section-spacing"
      aria-labelledby="downloads-heading"
    >
      <SectionHeading
        title="Downloads"
        subtitle="PDF Notices & Important Documents"
        headingId="downloads-heading"
      />

      <div className="mt-8 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        {items.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No documents available right now.
          </p>
        ) : (
          items.map((item) => (
            <a
              key={item.id}
              href={item.publicUrl ?? item.fileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50/60 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:hover:border-brand-700 dark:hover:bg-brand-900/20"
            >
              <div>
                <p className="break-words font-medium text-slate-900 dark:text-slate-100">
                  {item.title}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Updated on {formatDate(item.date)}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300">
                <FileDown className="h-4 w-4" /> Download PDF
              </span>
            </a>
          ))
        )}
      </div>
    </section>
  );
}
