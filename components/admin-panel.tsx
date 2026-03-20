"use client";

import { FormEvent, useEffect, useState } from "react";
import { SectionHeading } from "@/components/section-heading";

type SubmissionState = "idle" | "loading" | "success" | "error";

interface EventForm {
  title: string;
  date: string;
  description: string;
  location: string;
  type: "event" | "exam";
}

interface NoticeForm {
  title: string;
  content: string;
  date: string;
  type: "daily" | "holiday" | "alert";
}

interface GalleryForm {
  url: string;
  alt: string;
  category: string;
  file: File | null;
}

const defaultEvent: EventForm = {
  title: "",
  date: "",
  description: "",
  location: "",
  type: "event"
};

const defaultNotice: NoticeForm = {
  title: "",
  content: "",
  date: "",
  type: "daily"
};

const defaultGallery: GalleryForm = {
  url: "",
  alt: "",
  category: "Campus",
  file: null
};

export function AdminPanel() {
  const [adminKey, setAdminKey] = useState("");
  const [eventsCount, setEventsCount] = useState(0);
  const [noticesCount, setNoticesCount] = useState(0);
  const [galleryCount, setGalleryCount] = useState(0);

  const [eventForm, setEventForm] = useState<EventForm>(defaultEvent);
  const [noticeForm, setNoticeForm] = useState<NoticeForm>(defaultNotice);
  const [galleryForm, setGalleryForm] = useState<GalleryForm>(defaultGallery);

  const [eventStatus, setEventStatus] = useState<SubmissionState>("idle");
  const [noticeStatus, setNoticeStatus] = useState<SubmissionState>("idle");
  const [galleryStatus, setGalleryStatus] = useState<SubmissionState>("idle");

  const [eventMessage, setEventMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [galleryMessage, setGalleryMessage] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("dmps_admin_key");
    if (saved) {
      setAdminKey(saved);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("dmps_admin_key", adminKey);
  }, [adminKey]);

  const refreshCounts = async () => {
    const [eventRes, noticeRes, galleryRes] = await Promise.all([
      fetch("/api/events", { cache: "no-store" }),
      fetch("/api/notices", { cache: "no-store" }),
      fetch("/api/gallery", { cache: "no-store" })
    ]);

    const [eventData, noticeData, galleryData] = await Promise.all([
      eventRes.json(),
      noticeRes.json(),
      galleryRes.json()
    ]);

    setEventsCount((eventData.events ?? []).length);
    setNoticesCount((noticeData.notices ?? []).length);
    setGalleryCount((galleryData.images ?? []).length);
  };

  useEffect(() => {
    refreshCounts().catch(() => {
      setEventsCount(0);
      setNoticesCount(0);
      setGalleryCount(0);
    });
  }, []);

  const submitEvent = async (event: FormEvent) => {
    event.preventDefault();
    setEventStatus("loading");
    setEventMessage("");

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify(eventForm)
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to add event");
      }

      setEventStatus("success");
      setEventMessage(payload.message ?? "Event added.");
      setEventForm(defaultEvent);
      await refreshCounts();
    } catch (error) {
      setEventStatus("error");
      setEventMessage(error instanceof Error ? error.message : "Failed to add event.");
    }
  };

  const submitNotice = async (event: FormEvent) => {
    event.preventDefault();
    setNoticeStatus("loading");
    setNoticeMessage("");

    try {
      const response = await fetch("/api/admin/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify(noticeForm)
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to add notice");
      }

      setNoticeStatus("success");
      setNoticeMessage(payload.message ?? "Notice added.");
      setNoticeForm(defaultNotice);
      await refreshCounts();
    } catch (error) {
      setNoticeStatus("error");
      setNoticeMessage(error instanceof Error ? error.message : "Failed to add notice.");
    }
  };

  const submitGallery = async (event: FormEvent) => {
    event.preventDefault();
    setGalleryStatus("loading");
    setGalleryMessage("");

    try {
      let response: Response;

      if (galleryForm.file) {
        const body = new FormData();
        body.append("file", galleryForm.file);
        body.append("alt", galleryForm.alt);
        body.append("category", galleryForm.category);

        response = await fetch("/api/admin/images", {
          method: "POST",
          headers: {
            "x-admin-key": adminKey
          },
          body
        });
      } else {
        response = await fetch("/api/admin/images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": adminKey
          },
          body: JSON.stringify({
            url: galleryForm.url,
            alt: galleryForm.alt,
            category: galleryForm.category
          })
        });
      }

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to add image");
      }

      setGalleryStatus("success");
      setGalleryMessage(payload.message ?? "Image added.");
      setGalleryForm(defaultGallery);
      await refreshCounts();
    } catch (error) {
      setGalleryStatus("error");
      setGalleryMessage(error instanceof Error ? error.message : "Failed to add image.");
    }
  };

  return (
    <div>
      <SectionHeading title="Admin Panel" subtitle="Manage Events, Notices & Gallery" />
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        Use ADMIN_SECRET from your environment for write access.
      </p>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <label className="text-sm font-medium" htmlFor="admin-secret">
          Admin key
        </label>
        <input
          id="admin-secret"
          type="password"
          value={adminKey}
          onChange={(event) => setAdminKey(event.target.value)}
          placeholder="Enter ADMIN_SECRET"
          className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-brand-300 focus:ring dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">Events</p>
          <p className="text-2xl font-semibold">{eventsCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">Notices</p>
          <p className="text-2xl font-semibold">{noticesCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">Gallery Images</p>
          <p className="text-2xl font-semibold">{galleryCount}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <form
          onSubmit={submitEvent}
          className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
        >
          <h3 className="text-lg font-semibold">Add Event</h3>
          <div className="mt-3 space-y-3">
            <input
              required
              value={eventForm.title}
              onChange={(event) =>
                setEventForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Title"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <input
              required
              type="date"
              value={eventForm.date}
              onChange={(event) =>
                setEventForm((current) => ({ ...current, date: event.target.value }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <input
              required
              value={eventForm.location}
              onChange={(event) =>
                setEventForm((current) => ({ ...current, location: event.target.value }))
              }
              placeholder="Location"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <select
              value={eventForm.type}
              onChange={(event) =>
                setEventForm((current) => ({
                  ...current,
                  type: event.target.value as "event" | "exam"
                }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="event">Event</option>
              <option value="exam">Exam</option>
            </select>
            <textarea
              required
              rows={3}
              value={eventForm.description}
              onChange={(event) =>
                setEventForm((current) => ({
                  ...current,
                  description: event.target.value
                }))
              }
              placeholder="Description"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
              disabled={eventStatus === "loading"}
            >
              {eventStatus === "loading" ? "Saving..." : "Add Event"}
            </button>
            {eventMessage ? (
              <p className="text-xs text-slate-600 dark:text-slate-300">{eventMessage}</p>
            ) : null}
          </div>
        </form>

        <form
          onSubmit={submitNotice}
          className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
        >
          <h3 className="text-lg font-semibold">Add Notice</h3>
          <div className="mt-3 space-y-3">
            <input
              required
              value={noticeForm.title}
              onChange={(event) =>
                setNoticeForm((current) => ({
                  ...current,
                  title: event.target.value
                }))
              }
              placeholder="Title"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <input
              required
              type="date"
              value={noticeForm.date}
              onChange={(event) =>
                setNoticeForm((current) => ({ ...current, date: event.target.value }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <select
              value={noticeForm.type}
              onChange={(event) =>
                setNoticeForm((current) => ({
                  ...current,
                  type: event.target.value as "daily" | "holiday" | "alert"
                }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="daily">Daily</option>
              <option value="holiday">Holiday</option>
              <option value="alert">Alert</option>
            </select>
            <textarea
              required
              rows={4}
              value={noticeForm.content}
              onChange={(event) =>
                setNoticeForm((current) => ({
                  ...current,
                  content: event.target.value
                }))
              }
              placeholder="Notice content"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
              disabled={noticeStatus === "loading"}
            >
              {noticeStatus === "loading" ? "Saving..." : "Add Notice"}
            </button>
            {noticeMessage ? (
              <p className="text-xs text-slate-600 dark:text-slate-300">{noticeMessage}</p>
            ) : null}
          </div>
        </form>

        <form
          onSubmit={submitGallery}
          className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
        >
          <h3 className="text-lg font-semibold">Upload/Add Image</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Upload file (Cloudinary mode) or paste a direct URL.
          </p>
          <div className="mt-3 space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setGalleryForm((current) => ({ ...current, file }));
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <input
              value={galleryForm.url}
              onChange={(event) =>
                setGalleryForm((current) => ({ ...current, url: event.target.value }))
              }
              placeholder="https://... image URL"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <input
              required
              value={galleryForm.alt}
              onChange={(event) =>
                setGalleryForm((current) => ({ ...current, alt: event.target.value }))
              }
              placeholder="Alt text"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <input
              required
              value={galleryForm.category}
              onChange={(event) =>
                setGalleryForm((current) => ({
                  ...current,
                  category: event.target.value
                }))
              }
              placeholder="Category"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
              disabled={galleryStatus === "loading"}
            >
              {galleryStatus === "loading" ? "Saving..." : "Add Image"}
            </button>
            {galleryMessage ? (
              <p className="text-xs text-slate-600 dark:text-slate-300">{galleryMessage}</p>
            ) : null}
          </div>
        </form>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <p className="font-medium text-slate-900 dark:text-slate-100">Logo Replace Option</p>
        <p className="mt-1">
          To replace the placeholder logo, set siteConfig.logo.mode = image and point
          siteConfig.logo.imagePath to your uploaded file, for example /logo.png inside
          the public folder.
        </p>
      </div>
    </div>
  );
}
