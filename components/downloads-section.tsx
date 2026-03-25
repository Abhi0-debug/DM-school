import { FileDown } from "lucide-react";
import { downloadItems } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { SectionHeading } from "@/components/section-heading";

export function DownloadsSection() {
  return (
    <section className="section-shell section-spacing">
      <SectionHeading title="Downloads" subtitle="PDF Notices & Important Documents" />

      <div className="mt-8 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        {downloadItems.map((item) => (
          <a
            key={item.id}
            href={item.fileUrl}
            download
            className="flex flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50/60 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:hover:border-brand-700 dark:hover:bg-brand-900/20"
          >
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Updated on {formatDate(item.date)}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300">
              <FileDown className="h-4 w-4" /> Download PDF
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
