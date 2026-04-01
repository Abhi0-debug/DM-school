interface SectionHeadingProps {
  title: string;
  subtitle: string;
  align?: "left" | "center";
  headingId?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = "left",
  headingId
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "min-w-0 text-center" : "min-w-0 text-left"}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
        {title}
      </p>
      <h2
        id={headingId}
        className="mt-3 break-words text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-white"
      >
        {subtitle}
      </h2>
    </div>
  );
}
