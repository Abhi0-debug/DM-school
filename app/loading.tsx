import {
  EventsSkeleton,
  GallerySkeleton,
  HeroSkeleton,
  NoticeBoardSkeleton
} from "@/components/section-skeletons";

export default function Loading() {
  return (
    <main>
      <HeroSkeleton />
      <GallerySkeleton />
      <EventsSkeleton />
      <NoticeBoardSkeleton />
    </main>
  );
}
