import { NavbarSkeleton } from "@/components/navbar-skeleton";
import { AnnouncementBarSkeleton } from "@/components/announcement-bar-skeleton";
import {
  HeroSkeleton,
  GallerySkeleton,
  EventsSkeleton,
  NoticeBoardSkeleton,
  StaffSkeleton,
  DownloadsSkeleton,
} from "@/components/section-skeletons";

export default function Loading() {
  return (
    <>
      <AnnouncementBarSkeleton />
      <NavbarSkeleton />

      <main>
        <HeroSkeleton />
        <GallerySkeleton />
        <EventsSkeleton />
        <NoticeBoardSkeleton />
        <StaffSkeleton />
        <DownloadsSkeleton />
      </main>
    </>
  );
}