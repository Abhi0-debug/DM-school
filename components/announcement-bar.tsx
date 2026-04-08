"use client";

export function AnnouncementBar() {
  const text =
    "GENERAL SCIENCE AND SPARK ENGINEERING ARE PUBLISHED NOW!! • SECOND LIST (UNIT-1) FOR GENERAL SCIENCE AND SPARK ENGINEERING IS OUT NOW!!";

  return (
    <div className="fixed top-0 left-0 w-full z-40 bg-green-600 text-white h-12 flex items-center overflow-hidden">
      
      {/* 🔹 LEFT STATIC LABEL */}
      <div className="flex items-center gap-2 px-4 font-semibold whitespace-nowrap border-r border-white/30">
        📢 <span>ANNOUNCEMENTS</span>
      </div>

      {/* 🔹 SCROLLING TEXT */}
      <div className="relative flex-1 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee gap-10 px-4 text-sm">
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
        </div>
      </div>
    </div>
  );
}