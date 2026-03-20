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
import { getEvents, getGalleryImages, getNotices } from "@/lib/data";
import { fallbackHeroSlides } from "@/lib/constants";
import { getDynamicHero, getDynamicImages } from "@/lib/media-provider";

export default async function HomePage() {
  const [events, notices, galleryFallback] = await Promise.all([
    getEvents(),
    getNotices(),
    getGalleryImages()
  ]);

  const [galleryImages, heroSlides] = await Promise.all([
    getDynamicImages(galleryFallback),
    getDynamicHero(fallbackHeroSlides)
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero initialSlides={heroSlides} />
        <Gallery initialImages={galleryImages} />
        <EventsSection initialEvents={events} />
        <NoticeBoard initialNotices={notices} />
        <StaffSection />
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
