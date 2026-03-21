import Image from "next/image";
import { staffMembers } from "@/lib/constants";
import { StaffMember } from "@/lib/types";
import { SectionHeading } from "@/components/section-heading";

interface StaffSectionProps {
  initialMembers?: StaffMember[];
}

export function StaffSection({ initialMembers }: StaffSectionProps) {
  const members = initialMembers && initialMembers.length > 0
    ? initialMembers
    : staffMembers;

  return (
    <section id="staff" className="section-shell section-spacing">
      <SectionHeading title="Faculty" subtitle="Meet Our Teaching Team" />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member) => (
          <article
            key={member.id}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="relative h-52 overflow-hidden">
              <Image
                src={member.photo}
                alt={member.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                loading="lazy"
                quality={80}
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {member.name}
              </h3>
              <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
                {member.subject}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {member.bio}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

