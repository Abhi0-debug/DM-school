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
import { AnnouncementBar } from "@/components/announcement-bar";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  ""
);

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "School",
  name: "D.M Public School, Puri",
  alternateName: "DM Public School Puri",
  url: siteUrl,
  image: `${siteUrl}/images/New Building.jpeg`,
  logo: `${siteUrl}/android-chrome-512x512.png`,
  description: siteConfig.description,
  email: siteConfig.contact.email,
  telephone: "+91 8339012220",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Plot no 408, beside Hanuman Temple, near Dr.Baren Pattanaik Eye Clinic, Duttatota",
    addressLocality: "Puri",
    addressRegion: "Odisha",
    postalCode: "752001",
    addressCountry: "IN"
  },
  sameAs: [siteConfig.socials.instagram, siteConfig.socials.youtube]
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <AnnouncementBar />
      <Navbar />

      {/* ✅ UPDATED BANNER
      <AdmissionBanner
        banners={[
          {
            id: 1,
            imageUrl: "/images/admission-banner.jpg",
            title: "Admissions Open 2025–26",
            subtitle: "Secure your child’s future with quality education",
          },
          {
            id: 2,
            imageUrl: "/images/banner2.jpg",
            title: "New Academic Session",
            subtitle: "Enroll today and start your journey",
          },
          {
            id: 3,
            imageUrl: "/images/banner3.jpg",
            title: "Modern Learning Environment",
            subtitle: "Smart classrooms & holistic development",
          },
          {
            id: 4,
            imageUrl: "/images/banner4.jpg",
            title: "Limited Seats Available",
            subtitle: "Apply now before it’s too late",
          },
        ]}
      /> */}

      <main id="main-content" aria-label="D.M Public School Puri homepage">
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
