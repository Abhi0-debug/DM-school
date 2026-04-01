import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { NewsletterSection } from "@/components/newsletter-section";
import { MapSection } from "@/components/map-section";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import {
  ContactSectionContent,
  DownloadsSectionContent,
  EventsSectionContent,
  GallerySectionContent,
  HeroSectionContent,
  NoticeBoardSectionContent,
  StaffSectionContent
} from "@/components/home-sections";
import {
  DownloadsSkeleton,
  EventsSkeleton,
  GallerySkeleton,
  HeroSkeleton,
  NoticeBoardSkeleton,
  StaffSkeleton
} from "@/components/section-skeletons";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content" aria-label="DM Public School Puri homepage">
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSectionContent />
        </Suspense>

        <Suspense fallback={<GallerySkeleton />}>
          <GallerySectionContent />
        </Suspense>

        <Suspense fallback={<EventsSkeleton />}>
          <EventsSectionContent />
        </Suspense>

        <Suspense fallback={<NoticeBoardSkeleton />}>
          <NoticeBoardSectionContent />
        </Suspense>

        <Suspense fallback={<StaffSkeleton />}>
          <StaffSectionContent />
        </Suspense>

        <Suspense fallback={<DownloadsSkeleton />}>
          <DownloadsSectionContent />
        </Suspense>

        <NewsletterSection />
        <ContactSectionContent />
        <MapSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
