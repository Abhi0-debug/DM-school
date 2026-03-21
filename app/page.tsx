import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Gallery } from "@/components/gallery";
import { EventsSection } from "@/components/events-section";
import { NoticeBoard } from "@/components/notice-board";
import { StaffSection } from "@/components/staff-section";
import { DownloadsSection } from "@/components/downloads-section";
import { NewsletterSection } from "@/components/newsletter-section";
import { ContactSection } from "@/components/contact-section";
import { MapSection } from "@/components/map-section";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import {
  getEvents,
  getGalleryImages,
  getHeroSlides,
  getNotices,
  getStaffMembers
} from "@/lib/data";
import { getDynamicHero, getDynamicImages } from "@/lib/media-provider";

export default async function HomePage() {
  const [events, notices, galleryFallback, heroFallback, staff] = await Promise.all([
    getEvents(),
    getNotices(),
    getGalleryImages(),
    getHeroSlides(),
    getStaffMembers()
  ]);

  const [galleryImages, heroSlides] = await Promise.all([
    getDynamicImages(galleryFallback),
    getDynamicHero(heroFallback)
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero initialSlides={heroSlides} />
        <Gallery initialImages={galleryImages} />
        <EventsSection initialEvents={events} />
        <NoticeBoard initialNotices={notices} />
        <StaffSection initialMembers={staff} />
        <DownloadsSection />
        <NewsletterSection />
        <ContactSection />
        <MapSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
