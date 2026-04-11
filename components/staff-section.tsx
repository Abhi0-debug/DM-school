"use client";
import Image from "next/image";
import { StaffMember } from "@/lib/types";
import { SectionHeading } from "@/components/section-heading";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import "swiper/css/autoplay";
import { useState } from "react";

interface StaffSectionProps {
  initialMembers?: StaffMember[];
}

export function StaffSection({ initialMembers }: StaffSectionProps) {
  const members = initialMembers ?? [];

  const [expandedId, setExpandedId] = useState<string | null>(null);

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

      {}   {/*swiper */}
      <div className="mt-8">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640:  { slidesPerView: 2 },
            768:  { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          loop={true}
          grabCursor={true}
          className="w-auto"
        >
          {members.map((member) => {
            const cardClassName =
              "group block h-full flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-900";

            const cardContent = (
              <>
                <div className="relative h-52 overflow-hidden rounded-t-2xl">
                  <Image
                    src={member.photo}
                    alt={`${member.name}, ${member.subject} teacher at D.M Public School Puri`}
                    fill
                    className="object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-4 flex flex-col justify-between h-full">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                    {member.name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                  </h3>

                  <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
                    {member.subject}
                  </p>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 min-h-[4.5rem]">
                    {member.bio}
                  </p>
                  <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setExpandedId(expandedId === member.id ? null : member.id);
                  }}
                  className="mt-1 text-sm font-medium text-brand-600 hover:underline"
                  >
                    {expandedId === member.id ? "Read less" : "Read more"}
                  </button>
                </div>
              </>
            );

            return (
              <SwiperSlide key={member.id} className="h-auto">
                {member.pdfUrl ? (
                  <a
                    href={member.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClassName}
                  >
                    {cardContent}
                  </a>
                ) : (
                  <article className={cardClassName}>
                    {cardContent}
                  </article>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
      {}
    </section>
  );
}
