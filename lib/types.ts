export type NoticeType = "daily" | "holiday" | "observation";
export type EventType = "event" | "exam";

export interface HeroSlide {
  id: string;
  url: string;
  alt: string;
}

export interface HeroContent {
  id: string;
  admissionsText: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  category: string;
  title?: string;
  publicId?: string;
  sortOrder?: number;
}

export type GalleryDisplayMode = "grid" | "slideshow";

export interface GalleryDisplayConfig {
  mode: GalleryDisplayMode;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  category: string;
  type: EventType;
  createdAt?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  date: string;
  type: NoticeType;
  createdAt?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  subject: string;
  bio: string;
  photo: string;
  publicId?: string;
  pdfUrl?: string;
  pdfTitle?: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  description: string;
  imageUrl: string;
  publicId: string;
  pdfUrl?: string;
  pdfTitle?: string;
}

export interface ContactSettings {
  email: string;
  phone: string;
  address: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

export type NavSectionKey =
  | "home"
  | "gallery"
  | "events"
  | "notices"
  | "staff"
  | "contact";

export type NavConfig = Record<NavSectionKey, boolean>;

export interface DownloadItem {
  id: string;
  title: string;
  date: string;
  fileUrl: string;
  filePath?: string;
  publicUrl?: string;
  createdAt?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  filePath: string;
  publicUrl: string;
  createdAt: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
  captchaAnswer: number;
  captchaExpected: number;
}
