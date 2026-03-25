export type NoticeType = "daily" | "holiday" | "alert";
export type EventType = "event" | "exam";

export interface HeroSlide {
  id: string;
  url: string;
  alt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  category: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  category: string;
  type: EventType;
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  date: string;
  type: NoticeType;
}

export interface StaffMember {
  id: string;
  name: string;
  subject: string;
  bio: string;
  photo: string;
}

export interface DownloadItem {
  id: string;
  title: string;
  date: string;
  fileUrl: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
  captchaAnswer: number;
  captchaExpected: number;
}
