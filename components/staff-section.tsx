"use client";

import { useState } from "react";
import Image from "next/image";
import { StaffMember } from "@/lib/types";
import { SectionHeading } from "@/components/section-heading";
import { InfiniteCarousel } from "@/components/InfiniteCarousel";

interface StaffSectionProps {
  initialMembers?: StaffMember[];
}

export function StaffSection({ initialMembers }: StaffSectionProps){

  const members = initialMembers ?? [];
  const[ selectedStaff, setSelectedStaff ] = useState<StaffMember  | null>(null);
  

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

      <InfiniteCarousel className="mt-8" speed={0.45}>
    {members.map((member, index) => {

      const cardContent = (
        <>
          <div className="relative h-56 sm:h-52 shrink-0 overflow-hidden rounded-t-2xl bg-slate-100">
            <Image
              src={member.photo}
              alt={`${member.name}, ${member.subject} teacher at DM Public School Puri`}
              width={960}
              height={960}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              loading="lazy"
              quality={90}
              className=" h-full w-full object-cover object-[center_20%] transition duration-500 group-hover:scale-105 "
            />
          </div>


          <div className="flex flex-1 flex-col p-4 sm:p-3">

            <h3 className=" line-clamp-2 min-h-[48px] break-words text-[clamp(14px,1vw,18px)] font-bold leading-tight text-slate-900 dark:text-slate-100 ">
              {member.name}
            </h3>


            <p className="break-words text-sm font-medium text-brand-700 dark:text-brand-300">
              {member.subject}
            </p>


            <p className=" mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300 ">
              {member.bio}
            </p>


            <button
            type="button"
            onClick={(e)=>{

              e.preventDefault();
              
              setSelectedStaff(member);

            }}
              className="
              mt-3
              text-left
              text-sm
              font-semibold
              text-brand-600
              hover:underline
              "
            >
              See More
            </button>


          </div>
        </>
      );


      const cardClassName =
        "group shrink-0 flex h-[430px] w-[85vw] max-w-[300px] sm:w-[260px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-900";

      if (member.pdfUrl) {

        return (

          <a
            key={`${member.id}-${index}`}
            href={member.pdfUrl}
            download
            className={cardClassName}
            aria-label={`Download ${member.name} PDF`}
          >

            {cardContent}

          </a>

        );

      }


      return (

        <article
          key={`${member.id}-${index}`}
          className={cardClassName}
        >

          {cardContent}

        </article>

      );

    })}

</InfiniteCarousel>



{selectedStaff && (

<div
className="
fixed
inset-0
z-50
flex
items-center
justify-center
bg-black/50
p-4
"
>


<div
className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6"
>


<Image

src={selectedStaff.photo}

alt={selectedStaff.name}

width={300}

height={300}

className="mx-auto h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover"

/>



<h2
className="
mt-4
text-center
text-2xl
font-bold
"
>

{selectedStaff.name}

</h2>



<p
className="
text-center
font-medium
text-brand-600
"
>

{selectedStaff.subject}

</p>




<p
className="
mt-5
text-sm
text-slate-600
dark:text-slate-300
"
>

{selectedStaff.bio}

</p>




<button
  onClick={() => {
    setSelectedStaff(null);
  }}
  className="mt-6 w-full rounded-xl  bg-brand-600 py-2  text-white"
>
  
 Close
</button>


</div>


</div>


)}

    </section>
  );
}
