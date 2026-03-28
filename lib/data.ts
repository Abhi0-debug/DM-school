import {
  ContactMessage,
  ContactSettings,
  EventItem,
  GalleryImage,
  HeroSlide,
  NavConfig,
  NoticeItem,
  StaffMember
} from "@/lib/types";
import { readJsonFile } from "@/lib/file-store";
import { fallbackHeroSlides, navigationLinks } from "@/lib/constants";
import { siteConfig } from "@/lib/site-config";

export async function getEvents() {
  try {
    const { listEvents } = await import("@/lib/events-notices-service");
    return await listEvents();
  } catch {
    return [];
  }
}

export async function getNotices() {
  try {
    const { listNotices } = await import("@/lib/events-notices-service");
    return await listNotices();
  } catch {
    return [];
  }
}

export async function getGalleryImages() {
  return readJsonFile<GalleryImage[]>("gallery.json", []);
}

export async function getHeroSlides() {
  return readJsonFile<HeroSlide[]>("hero.json", fallbackHeroSlides);
}

export async function getStaffMembers() {
  try {
    const { listTeacherStaffMembers } = await import("@/lib/teacher-service");
    return await listTeacherStaffMembers();
  } catch {
    return [];
  }
}

export async function getContactSettings() {
  const fallback: ContactSettings = {
    email: siteConfig.contact.email,
    phone: siteConfig.contact.phone,
    address: siteConfig.contact.address
  };

  return readJsonFile<ContactSettings>("contact-settings.json", fallback);
}

export async function getContactMessages() {
  return readJsonFile<ContactMessage[]>("messages.json", []);
}

export async function getNavConfig() {
  const defaultConfig = navigationLinks.reduce((acc, link) => {
    const key = link.href.replace("#", "") as keyof NavConfig;
    acc[key] = true;
    return acc;
  }, {} as NavConfig);

  return readJsonFile<NavConfig>("nav-config.json", defaultConfig);
}
