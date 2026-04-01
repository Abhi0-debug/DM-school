import Image from "next/image";
import { StaffMember } from "@/lib/types";
import { SectionHeading } from "@/components/section-heading";

interface StaffSectionProps {
  initialMembers?: StaffMember[];
}

export function StaffSection({ initialMembers }: StaffSectionProps) {
  const members = initialMembers ?? [];

  return (
    <section
      id="staff"
      className="section-shell section-spacing"
      aria-labelledby="staff-heading"
    >
      <SectionHeading
        title="Faculty"
        subtitle="Meet Our Teaching Team"
        headingId="staff-heading"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member) => {
          const cardContent = (
            <>
              <div className="relative h-52 overflow-hidden rounded-t-2xl">
                <Image
                  src={member.photo}
                  alt={`${member.name}, ${member.subject} teacher at DM Public School Puri`}
                  width={960}
                  height={640}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  loading="lazy"
                  quality={80}
                  className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="break-words text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {member.name}
                </h3>
                <p className="break-words text-sm font-medium text-brand-700 dark:text-brand-300">
                  {member.subject}
                </p>
                <p className="mt-2 break-words text-sm text-slate-600 dark:text-slate-300">
                  {member.bio}
                </p>
              </div>
            </>
          );

          const cardClassName =
            "group block min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-900";

          if (member.pdfUrl) {
            return (
              <a
                key={member.id}
                href={member.pdfUrl}
                download
                className={cardClassName}
                aria-label={`Download ${member.name} PDF`}
                title={member.pdfTitle ?? `${member.name} PDF`}
              >
                {cardContent}
              </a>
            );
          }

          return (
            <article key={member.id} className={cardClassName}>
              {cardContent}
            </article>
          );
        })}
      </div>
    </section>
  );
}

