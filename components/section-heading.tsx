interface SectionHeadingProps {
  title: string;
  subtitle: string;
  align?: "left" | "center";
}

export function SectionHeading({
  title,
  subtitle,
  align = "left"
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
        {title}
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-white">
        {subtitle}
      </h2>
    </div>
  );
}
