import { EventItem, NoticeItem, GalleryImage } from "@/lib/types";
import { readJsonFile } from "@/lib/file-store";

export async function getEvents() {
  return readJsonFile<EventItem[]>("events.json", []);
}

export async function getNotices() {
  return readJsonFile<NoticeItem[]>("notices.json", []);
}

export async function getGalleryImages() {
  return readJsonFile<GalleryImage[]>("gallery.json", []);
}
