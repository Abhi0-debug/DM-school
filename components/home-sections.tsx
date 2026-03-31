import { Hero } from "@/components/hero";
import { GalleryModeRenderer } from "@/components/gallery-mode-renderer";
import { EventsSection } from "@/components/events-section";
import { NoticeBoard } from "@/components/notice-board";
import { StaffSection } from "@/components/staff-section";
import { DownloadsSection } from "@/components/downloads-section";
import { ContactSection } from "@/components/contact-section";
import { fallbackHeroSlides } from "@/lib/constants";
import {
  getDocuments,
  getEvents,
  getGalleryDisplayConfig,
  getHeroAdmissionsText,
  getNotices,
  getPublicGalleryImages,
  getStaffMembers
} from "@/lib/data";
import { getDynamicHero } from "@/lib/media-provider";
import { DownloadItem } from "@/lib/types";

function createCaptchaChallenge() {
  const a = Math.floor(Math.random() * 8) + 1;
  const b = Math.floor(Math.random() * 8) + 1;
  return { a, b, expected: a + b };
}

function toDownloadItem(item: {
  id: string;
  title: string;
  createdAt: string;
  filePath: string;
  publicUrl: string;
}): DownloadItem {
  return {
    id: item.id,
    title: item.title,
    date: item.createdAt,
    fileUrl: item.publicUrl,
    filePath: item.filePath,
    publicUrl: item.publicUrl,
    createdAt: item.createdAt
  };
}

export async function HeroSectionContent() {
  const [slides, admissionsText] = await Promise.all([
    getDynamicHero(fallbackHeroSlides),
    getHeroAdmissionsText()
  ]);

  if (slides.length === 0) {
    return null;
  }

  return <Hero initialSlides={slides} admissionsText={admissionsText} />;
}

export async function GallerySectionContent() {
  const [images, galleryDisplayConfig] = await Promise.all([
    getPublicGalleryImages(),
    getGalleryDisplayConfig()
  ]);

  return <GalleryModeRenderer mode={galleryDisplayConfig.mode} images={images} />;
}

export async function EventsSectionContent() {
  const events = await getEvents();
  return <EventsSection initialEvents={events} />;
}

export async function NoticeBoardSectionContent() {
  const notices = await getNotices();
  return <NoticeBoard initialNotices={notices} />;
}

export async function StaffSectionContent() {
  const staff = await getStaffMembers();
  return <StaffSection initialMembers={staff} />;
}

export async function DownloadsSectionContent() {
  const items = (await getDocuments()).map(toDownloadItem);
  return <DownloadsSection items={items} />;
}

export function ContactSectionContent() {
  return <ContactSection initialChallenge={createCaptchaChallenge()} />;
}
