"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  FileText,
  GripVertical,
  ImageIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Pencil,
  Plus,
  Settings,
  Shield,
  Trash2,
  UploadCloud,
  X,
  type LucideIcon
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  EventItem,
  GalleryDisplayMode,
  GalleryImage,
  NoticeItem,
  NoticeType
} from "@/lib/types";
import { AdminStaffManager } from "@/components/admin-staff-manager";
import { AdminDocumentsManager } from "@/components/admin-documents-manager";


type SectionKey =
  | "overview"
  | "events"
  | "notices"
  | "gallery"
  | "documents"
  | "staff"
  | "popup"
  | "settings";
type ToastType = "success" | "error";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  action: () => Promise<void> | void;
}

interface UploadDraft {
  id: string;
  file: File;
  preview: string;
  alt: string;
  category: string;
}

interface EventFormState {
  title: string;
  date: string;
  location: string;
  category: string;
  type: "event" | "exam";
  description: string;
}

interface NoticeFormState {
  title: string;
  date: string;
  type: NoticeType;
  content: string;
}

interface ImageEditState {
  alt: string;
  category: string;
  url?: string;
}

interface ApiMessage {
  message?: string;
}

const sidebarItems: Array<{
  key: SectionKey;
  label: string;
  icon: LucideIcon;
}> = [
  { key: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
  { key: "popup", label:"Event Popup", icon: ImageIcon},
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "notices", label: "Notices", icon: Bell },
  { key: "gallery", label: "Gallery", icon: ImageIcon },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "staff", label: "Staff", icon: Shield },
  { key: "settings", label: "Settings", icon: Settings }
  
];

const noticeTypeStyles: Record<NoticeType, string> = {
  daily: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  holiday:
    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  alert: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800"
};

const initialEventForm: EventFormState = {
  title: "",
  date: "",
  location: "",
  category: "General",
  type: "event",
  description: ""
};

const initialNoticeForm: NoticeFormState = {
  title: "",
  date: "",
  type: "daily",
  content: ""
};

const initialPinChange = {
  currentPin: "",
  newPin: ""
};

const defaultHeroAdmissionsText = "Admissions Open 2026";

function formatPrettyDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(parsed);
}

function normalizeEventItem(item: EventItem): EventItem {
  return {
    ...item,
    category:
      item.category?.trim() || (item.type === "exam" ? "Exam" : "General")
  };
}

function SortableListItem({
  id,
  children
}: {
  id: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative rounded-xl border border-slate-200 bg-white p-4 shadow-md transition dark:border-slate-700 dark:bg-slate-900 ${
        isDragging ? "opacity-80 ring-2 ring-blue-300" : ""
      }`}
    >
      <button
        type="button"
        aria-label="Reorder item"
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="pr-12">{children}</div>
    </article>
  );
}

function SortableImageCard({
  id,
  children
}: {
  id: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md transition dark:border-slate-700 dark:bg-slate-900 ${
        isDragging ? "opacity-80 ring-2 ring-blue-300" : ""
      }`}
    >
      <button
        type="button"
        aria-label="Reorder image"
        className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/40 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {children}
    </article>
  );
}

export function AdminPanel() {
  const [popupImage, setPopupImage] = useState("");
  const [popupActive, setPopupActive] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  const [activeSection, setActiveSection] = useState<SectionKey>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);

  const [eventForm, setEventForm] = useState<EventFormState>(initialEventForm);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventEditForm, setEventEditForm] =
    useState<EventFormState>(initialEventForm);

  const [noticeForm, setNoticeForm] = useState<NoticeFormState>(initialNoticeForm);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [noticeEditForm, setNoticeEditForm] =
    useState<NoticeFormState>(initialNoticeForm);

  const [uploadDrafts, setUploadDrafts] = useState<UploadDraft[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [imageEditForm, setImageEditForm] = useState<ImageEditState>({
    alt: "",
    category: "",
    url: ""
  });

  const [pinChange, setPinChange] = useState(initialPinChange);
  const [pinChangeLoading, setPinChangeLoading] = useState(false);
  const [heroAdmissionsText, setHeroAdmissionsText] = useState(
    defaultHeroAdmissionsText
  );
  const [heroContentLoading, setHeroContentLoading] = useState(false);
  const [heroContentSaving, setHeroContentSaving] = useState(false);
  const [galleryDisplayMode, setGalleryDisplayMode] =
    useState<GalleryDisplayMode>("grid");
  const [galleryDisplayLoading, setGalleryDisplayLoading] = useState(false);
  const [galleryDisplaySaving, setGalleryDisplaySaving] = useState(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const previewRegistryRef = useRef<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    })
  );

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, type, message }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2600);
  }, []);

  const broadcastGalleryUpdated = useCallback(() => {
    window.dispatchEvent(new CustomEvent("gallery:updated"));
  }, []);

  const revokePreview = useCallback((url: string) => {
    URL.revokeObjectURL(url);
    previewRegistryRef.current = previewRegistryRef.current.filter(
      (item) => item !== url
    );
  }, []);

  useEffect(() => {
    return () => {
      previewRegistryRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewRegistryRef.current = [];
    };
  }, []);

  const apiRequest = useCallback(
    async <T,>(url: string, init?: RequestInit): Promise<T> => {
      const headers = new Headers(init?.headers ?? {});
      const isFormData = init?.body instanceof FormData;

      if (init?.body && !isFormData && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(url, {
        ...init,
        headers
      });

      let payload: unknown = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (!response.ok) {
        if (response.status === 401) {
          setAuthenticated(false);
        }

        const message =
          (payload as { message?: string })?.message ?? "Request failed.";
        throw new Error(message);
      }

      return payload as T;
    },
    []
  );

  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);

    try {
      const [eventsRes, noticesRes, imagesRes] = await Promise.all([
        fetch("/api/events", { cache: "no-store" }),
        fetch("/api/notices", { cache: "no-store" }),
        fetch("/api/admin/images", { cache: "no-store" })
      ]);

      const [eventsPayload, noticesPayload, imagesPayload] = await Promise.all([
        eventsRes.json(),
        noticesRes.json(),
        imagesRes.json()
      ]);

      if (!eventsRes.ok || !noticesRes.ok || !imagesRes.ok) {
        throw new Error("Unable to load dashboard data.");
      }

      const nextEvents = ((eventsPayload as { events?: EventItem[] }).events ?? [])
        .map(normalizeEventItem);
      const nextNotices =
        (noticesPayload as { notices?: NoticeItem[] }).notices ?? [];
      const nextImages =
        (imagesPayload as { images?: GalleryImage[] }).images ?? [];

      setEvents(nextEvents);
      setNotices(nextNotices);
      setImages(nextImages);
      window.dispatchEvent(new CustomEvent("admin:refresh"));
    } catch (error) {
      addToast(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoadingData(false);
    }
  }, [addToast]);

  const loadHeroAdmissionsText = useCallback(async () => {
    setHeroContentLoading(true);
    try {
      const response = await fetch("/api/hero", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load hero admissions text.");
      }

      const payload = (await response.json()) as { admissionsText?: string };
      const nextText = payload.admissionsText?.trim();
      setHeroAdmissionsText(nextText && nextText.length > 0 ? nextText : defaultHeroAdmissionsText);
    } catch (error) {
      addToast(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to load hero admissions text."
      );
    } finally {
      setHeroContentLoading(false);
    }
  }, [addToast]);

  const loadGalleryDisplayMode = useCallback(async () => {
    setGalleryDisplayLoading(true);
    try {
      const response = await fetch("/api/admin/gallery-display", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Unable to load gallery display mode.");
      }

      const payload = (await response.json()) as {
        config?: { mode?: GalleryDisplayMode };
      };

      setGalleryDisplayMode(
        payload.config?.mode === "slideshow" ? "slideshow" : "grid"
      );
    } catch (error) {
      addToast(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to load gallery display mode."
      );
    } finally {
      setGalleryDisplayLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      try {
        const response = await fetch("/api/admin/auth/session", {
          cache: "no-store"
        });

        if (response.ok && mounted) {
          setAuthenticated(true);
          await Promise.all([
            loadDashboardData(),
            loadHeroAdmissionsText(),
            loadGalleryDisplayMode()
          ]);
        }
      } finally {
        if (mounted) {
          setAuthChecked(true);
        }
      }
    };

    verifySession();

    return () => {
      mounted = false;
    };
  }, [loadDashboardData, loadHeroAdmissionsText, loadGalleryDisplayMode]);

  const stats = useMemo(
    () => [
      {
        label: "Total Events",
        value: events.length,
        icon: CalendarDays,
        accent: "text-blue-600"
      },
      {
        label: "Total Notices",
        value: notices.length,
        icon: Bell,
        accent: "text-emerald-600"
      },
      {
        label: "Total Images",
        value: images.length,
        icon: ImageIcon,
        accent: "text-violet-600"
      }
    ],
    [events.length, notices.length, images.length]
  );

  const upcomingEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .slice(0, 4);
  }, [events]);

  const latestNotices = useMemo(() => {
    return [...notices]
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .slice(0, 5);
  }, [notices]);

  const requestConfirm = useCallback((next: ConfirmState) => {
    setConfirmState(next);
  }, []);

  const runConfirmAction = async () => {
    if (!confirmState) {
      return;
    }

    setConfirmLoading(true);
    try {
      await confirmState.action();
      setConfirmState(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    setPinError("");
    setPinLoading(true);

    try {
      await apiRequest<ApiMessage>("/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ pin })
      });

      setAuthenticated(true);
      setPin("");
      addToast("success", "Login successful.");
      await Promise.all([
        loadDashboardData(),
        loadHeroAdmissionsText(),
        loadGalleryDisplayMode()
      ]);
    } catch (error) {
      setPinError(error instanceof Error ? error.message : "Unable to login.");
    } finally {
      setPinLoading(false);
      setAuthChecked(true);
    }
  };

  const saveGalleryDisplaySettings = async () => {
    setGalleryDisplaySaving(true);

    try {
      const payload = await apiRequest<{
        message?: string;
        config?: { mode?: GalleryDisplayMode };
      }>("/api/admin/gallery-display", {
        method: "PUT",
        body: JSON.stringify({ mode: galleryDisplayMode })
      });

      setGalleryDisplayMode(
        payload.config?.mode === "slideshow" ? "slideshow" : "grid"
      );
      addToast("success", payload.message ?? "Gallery mode updated.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to save gallery mode."
      );
    } finally {
      setGalleryDisplaySaving(false);
    }
  };

  const saveHeroAdmissionsText = async (event: FormEvent) => {
    event.preventDefault();
    setHeroContentSaving(true);

    try {
      const payload = await apiRequest<{
        message?: string;
        admissionsText?: string;
      }>("/api/hero", {
        method: "PUT",
        body: JSON.stringify({ admissionsText: heroAdmissionsText })
      });

      const nextText =
        payload.admissionsText?.trim() && payload.admissionsText.trim().length > 0
          ? payload.admissionsText.trim()
          : defaultHeroAdmissionsText;

      setHeroAdmissionsText(nextText);
      try {
        localStorage.setItem("hero:admissionsText", nextText);
      } catch {
        // Ignore localStorage errors in restrictive environments.
      }
      window.dispatchEvent(
        new CustomEvent("hero:content-updated", {
          detail: { admissionsText: nextText }
        })
      );
      addToast("success", payload.message ?? "Hero admissions text updated.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to update hero admissions text."
      );
    } finally {
      setHeroContentSaving(false);
    }
  };

  const onLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      setAuthenticated(false);
      addToast("success", "Logged out.");
    }
  };

  const onCreateEvent = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const payload = await apiRequest<{ message?: string; event: EventItem }>(
        "/api/events",
        {
          method: "POST",
          body: JSON.stringify(eventForm)
        }
      );

      setEvents((current) => [normalizeEventItem(payload.event), ...current]);
      setEventForm(initialEventForm);
      addToast("success", payload.message ?? "Event created.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to create event."
      );
    }
  };

  const startEditEvent = (item: EventItem) => {
    setEditingEventId(item.id);
    setEventEditForm({
      title: item.title,
      date: item.date,
      location: item.location,
      category: item.category,
      type: item.type,
      description: item.description
    });
  };

  const saveEventEdit = async () => {
    if (!editingEventId) {
      return;
    }

    try {
      const payload = await apiRequest<{ message?: string; event: EventItem }>(
        `/api/events/${editingEventId}`,
        {
          method: "PUT",
          body: JSON.stringify(eventEditForm)
        }
      );

      setEvents((current) =>
        current.map((item) =>
          item.id === editingEventId
            ? normalizeEventItem(payload.event)
            : item
        )
      );

      setEditingEventId(null);
      addToast("success", payload.message ?? "Event updated.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to update event."
      );
    }
  };

  const deleteEvent = (id: string) => {
    requestConfirm({
      title: "Delete Event",
      message: "This event will be removed permanently.",
      confirmLabel: "Delete",
      action: async () => {
        const payload = await apiRequest<ApiMessage>(`/api/events/${id}`, {
          method: "DELETE"
        });
        setEvents((current) => current.filter((item) => item.id !== id));
        addToast("success", payload.message ?? "Event deleted.");
      }
    });
  };

  const reorderEvents = async (dragEvent: DragEndEvent) => {
    const { active, over } = dragEvent;

    if (!over || active.id === over.id) {
      return;
    }

    const fromIndex = events.findIndex((item) => item.id === String(active.id));
    const toIndex = events.findIndex((item) => item.id === String(over.id));

    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    const previous = events;
    const reordered = arrayMove(events, fromIndex, toIndex);
    setEvents(reordered);

    try {
      await apiRequest<ApiMessage>("/api/events", {
        method: "PATCH",
        body: JSON.stringify({ ids: reordered.map((item) => item.id) })
      });
    } catch (error) {
      setEvents(previous);
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to reorder events."
      );
    }
  };
  const onCreateNotice = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const payload = await apiRequest<{ message?: string; notice: NoticeItem }>(
        "/api/notices",
        {
          method: "POST",
          body: JSON.stringify(noticeForm)
        }
      );

      setNotices((current) => [payload.notice, ...current]);
      setNoticeForm(initialNoticeForm);
      addToast("success", payload.message ?? "Notice created.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to create notice."
      );
    }
  };

  const startEditNotice = (item: NoticeItem) => {
    setEditingNoticeId(item.id);
    setNoticeEditForm({
      title: item.title,
      date: item.date,
      type: item.type,
      content: item.content
    });
  };

  const saveNoticeEdit = async () => {
    if (!editingNoticeId) {
      return;
    }

    try {
      const payload = await apiRequest<{ message?: string; notice: NoticeItem }>(
        `/api/notices/${editingNoticeId}`,
        {
          method: "PUT",
          body: JSON.stringify(noticeEditForm)
        }
      );

      setNotices((current) =>
        current.map((item) =>
          item.id === editingNoticeId ? payload.notice : item
        )
      );

      setEditingNoticeId(null);
      addToast("success", payload.message ?? "Notice updated.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to update notice."
      );
    }
  };

  const deleteNotice = (id: string) => {
    requestConfirm({
      title: "Delete Notice",
      message: "This notice will be removed permanently.",
      confirmLabel: "Delete",
      action: async () => {
        const payload = await apiRequest<ApiMessage>(`/api/notices/${id}`, {
          method: "DELETE"
        });
        setNotices((current) => current.filter((item) => item.id !== id));
        addToast("success", payload.message ?? "Notice deleted.");
      }
    });
  };

  const reorderNotices = async (dragEvent: DragEndEvent) => {
    const { active, over } = dragEvent;

    if (!over || active.id === over.id) {
      return;
    }

    const fromIndex = notices.findIndex((item) => item.id === String(active.id));
    const toIndex = notices.findIndex((item) => item.id === String(over.id));

    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    const previous = notices;
    const reordered = arrayMove(notices, fromIndex, toIndex);
    setNotices(reordered);

    try {
      await apiRequest<ApiMessage>("/api/notices", {
        method: "PATCH",
        body: JSON.stringify({ ids: reordered.map((item) => item.id) })
      });
    } catch (error) {
      setNotices(previous);
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to reorder notices."
      );
    }
  };

  const addUploadDrafts = useCallback(
    (files: File[]) => {
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      if (imageFiles.length === 0) {
        addToast("error", "Please choose valid image files.");
        return;
      }

      const drafts = imageFiles.map((file, index) => {
        const preview = URL.createObjectURL(file);
        previewRegistryRef.current.push(preview);

        return {
          id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          preview,
          alt: file.name
            .replace(/\.[^.]+$/, "")
            .replace(/[-_]/g, " ")
            .trim(),
          category: "Campus"
        };
      });

      setUploadDrafts((current) => [...current, ...drafts]);
    },
    [addToast]
  );

  const onUploadInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      addUploadDrafts(files);
    }
    event.target.value = "";
  };

  const removeUploadDraft = (id: string) => {
    setUploadDrafts((current) => {
      const target = current.find((item) => item.id === id);
      if (target) {
        revokePreview(target.preview);
      }
      return current.filter((item) => item.id !== id);
    });
  };

  const clearUploadDrafts = useCallback(() => {
    setUploadDrafts((current) => {
      current.forEach((item) => revokePreview(item.preview));
      return [];
    });
  }, [revokePreview]);

  const onUploadDrafts = async () => {
    if (uploadDrafts.length === 0) {
      addToast("error", "Add at least one image first.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      uploadDrafts.forEach((draft) => formData.append("files", draft.file));
      formData.append(
        "meta",
        JSON.stringify(
          uploadDrafts.map((draft) => ({
            alt: draft.alt,
            title: draft.alt,
            category: draft.category
          }))
        )
      );

      const payload = await apiRequest<{
        message?: string;
        images?: GalleryImage[];
      }>("/api/admin/images", {
        method: "POST",
        body: formData
      });

      const uploaded = payload.images ?? [];
      setImages((current) => [...uploaded, ...current]);
      clearUploadDrafts();
      broadcastGalleryUpdated();
      addToast(
        "success",
        payload.message ?? `${uploaded.length} image(s) uploaded.`
      );
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to upload images."
      );
    } finally {
      setUploading(false);
    }
  };

  const startEditImage = (item: GalleryImage) => {
    setEditingImageId(item.id);
    setImageEditForm({
      alt: item.alt,
      category: item.category,
      url: item.url
    });
  };

  const saveImageEdit = async () => {
    if (!editingImageId) {
      return;
    }

    try {
      const payload = await apiRequest<{ message?: string; image: GalleryImage }>(
        `/api/admin/images/${editingImageId}`,
        {
          method: "PUT",
          body: JSON.stringify(imageEditForm)
        }
      );

      setImages((current) =>
        current.map((item) =>
          item.id === editingImageId ? payload.image : item
        )
      );

      setEditingImageId(null);
      broadcastGalleryUpdated();
      addToast("success", payload.message ?? "Image updated.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to update image."
      );
    }
  };

  const deleteImage = (id: string) => {
    requestConfirm({
      title: "Delete Image",
      message: "This image will be removed from gallery permanently.",
      confirmLabel: "Delete",
      action: async () => {
        const payload = await apiRequest<ApiMessage>(`/api/admin/images/${id}`, {
          method: "DELETE"
        });
        setImages((current) => current.filter((item) => item.id !== id));
        broadcastGalleryUpdated();
        addToast("success", payload.message ?? "Image deleted.");
      }
    });
  };

  const reorderImages = async (dragEvent: DragEndEvent) => {
    const { active, over } = dragEvent;

    if (!over || active.id === over.id) {
      return;
    }

    const fromIndex = images.findIndex((item) => item.id === String(active.id));
    const toIndex = images.findIndex((item) => item.id === String(over.id));

    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    const previous = images;
    const reordered = arrayMove(images, fromIndex, toIndex);
    setImages(reordered);

    try {
      await apiRequest<ApiMessage>("/api/admin/images", {
        method: "PATCH",
        body: JSON.stringify({ ids: reordered.map((item) => item.id) })
      });
      broadcastGalleryUpdated();
    } catch (error) {
      setImages(previous);
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to reorder gallery."
      );
    }
  };

  const changePin = async (event: FormEvent) => {
    event.preventDefault();
    setPinChangeLoading(true);

    try {
      const payload = await apiRequest<ApiMessage>("/api/admin/auth/pin", {
        method: "POST",
        body: JSON.stringify(pinChange)
      });
      setPinChange(initialPinChange);
      addToast("success", payload.message ?? "PIN updated.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to update PIN."
      );
    } finally {
      setPinChangeLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <section className="space-y-6">
        <div className="h-14 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!authenticated) {
    return (
      <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-xl backdrop-blur sm:p-6 dark:border-slate-700 dark:bg-slate-900/80">
        <div className="mb-6 flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              DMPS Admin Access
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Enter your secure PIN to continue.
            </p>
          </div>
        </div>

        <form onSubmit={onLogin} className="space-y-4">
          <input
            type="password"
            required
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder="Admin PIN"
            className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />

          {pinError ? (
            <p className="inline-flex items-center gap-2 text-sm text-rose-600">
              <AlertCircle className="h-4 w-4" />
              {pinError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pinLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pinLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {pinLoading ? "Verifying..." : "Login to Dashboard"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/85 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:hidden dark:border-slate-700">
        <button
          type="button"
          onClick={() => setSidebarOpen((current) => !current)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700"
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        <aside
          className={`${sidebarOpen ? "block" : "hidden"} border-b border-slate-200 bg-white/70 p-4 md:sticky md:top-24 md:block md:h-[calc(100vh-7rem)] md:w-72 md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r dark:border-slate-700 dark:bg-slate-900/70`}
        >
          <div className="mb-5 flex min-w-0 items-center gap-3 rounded-xl bg-blue-600/10 p-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                DM Public School
              </h2>
              <p className="truncate text-xs text-slate-600 dark:text-slate-300">
                Admin Dashboard
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={onLogout}
            className="mt-6 hidden w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 md:inline-flex dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="break-words text-xl font-semibold text-slate-900 sm:text-2xl dark:text-slate-100">
                {sidebarItems.find((item) => item.key === activeSection)?.label}
              </h1>
              <p className="break-words text-sm text-slate-600 dark:text-slate-300">
                Manage school content with secure controls and real-time updates.
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <Link
                href="/"
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <button
                type="button"
                onClick={loadDashboardData}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {loadingData ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Refresh Data
              </button>
            </div>
          </header>

          {activeSection === "overview" ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {stats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.label}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {item.label}
                          </p>
                          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                            {loadingData ? "-" : item.value}
                          </p>
                        </div>
                        <Icon className={`h-7 w-7 ${item.accent}`} />
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Quick Actions
                </h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSection("events")}
                    className="min-h-[44px] rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Add Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection("notices")}
                    className="min-h-[44px] rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Add Notice
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection("gallery")}
                    className="min-h-[44px] rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    Upload Images
                  </button>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Upcoming Events
                  </h3>
                  <div className="mt-4 space-y-3">
                    {upcomingEvents.length === 0 ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        No events available yet.
                      </p>
                    ) : (
                      upcomingEvents.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                        >
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                            {formatPrettyDate(item.date)} | {item.location}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Latest Notices
                  </h3>
                  <div className="mt-4 space-y-3">
                    {latestNotices.length === 0 ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        No notices available yet.
                      </p>
                    ) : (
                      latestNotices.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {item.title}
                            </p>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase ${noticeTypeStyles[item.type]}`}
                            >
                              {item.type}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                            {formatPrettyDate(item.date)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {activeSection === "events" ? (
            <div className="space-y-6">
              <form
                onSubmit={onCreateEvent}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Create Event
                </h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    value={eventForm.title}
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        title: event.target.value
                      }))
                    }
                    placeholder="Title"
                    required
                    className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        date: event.target.value
                      }))
                    }
                    required
                    className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    value={eventForm.location}
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        location: event.target.value
                      }))
                    }
                    placeholder="Location"
                    required
                    className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    value={eventForm.category}
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        category: event.target.value
                      }))
                    }
                    placeholder="Category"
                    required
                    className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <select
                    value={eventForm.type}
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        type: event.target.value as EventFormState["type"]
                      }))
                    }
                    className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="event">Event</option>
                    <option value="exam">Exam</option>
                  </select>
                  <button
                    type="submit"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Event
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={eventForm.description}
                  onChange={(event) =>
                    setEventForm((current) => ({
                      ...current,
                      description: event.target.value
                    }))
                  }
                  placeholder="Description"
                  required
                  className="mt-3 w-full min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </form>

              {loadingData ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                    />
                  ))}
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={reorderEvents}
                >
                  <SortableContext
                    items={events.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {events.map((item) => (
                        <SortableListItem key={item.id} id={item.id}>
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="break-words text-base font-semibold text-slate-900 dark:text-slate-100">
                                  {item.title}
                                </p>
                                <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">
                                  {item.description}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs font-semibold uppercase text-slate-700 dark:border-slate-700 dark:text-slate-200">
                                  {item.type}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => startEditEvent(item)}
                                  className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium dark:border-slate-700"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteEvent(item.id)}
                                  className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:text-rose-300"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300">
                              <span className="inline-flex break-words items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatPrettyDate(item.date)}
                              </span>
                              <span className="inline-flex break-words items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {item.location}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                                {item.category}
                              </span>
                            </div>

                            {editingEventId === item.id ? (
                              <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
                                <input
                                  value={eventEditForm.title}
                                  onChange={(event) =>
                                    setEventEditForm((current) => ({
                                      ...current,
                                      title: event.target.value
                                    }))
                                  }
                                  className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                />
                                <input
                                  type="date"
                                  value={eventEditForm.date}
                                  onChange={(event) =>
                                    setEventEditForm((current) => ({
                                      ...current,
                                      date: event.target.value
                                    }))
                                  }
                                  className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                />
                                <input
                                  value={eventEditForm.location}
                                  onChange={(event) =>
                                    setEventEditForm((current) => ({
                                      ...current,
                                      location: event.target.value
                                    }))
                                  }
                                  className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                />
                                <input
                                  value={eventEditForm.category}
                                  onChange={(event) =>
                                    setEventEditForm((current) => ({
                                      ...current,
                                      category: event.target.value
                                    }))
                                  }
                                  className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                />
                                <select
                                  value={eventEditForm.type}
                                  onChange={(event) =>
                                    setEventEditForm((current) => ({
                                      ...current,
                                      type: event.target.value as EventFormState["type"]
                                    }))
                                  }
                                  className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                >
                                  <option value="event">Event</option>
                                  <option value="exam">Exam</option>
                                </select>
                                <textarea
                                  rows={3}
                                  value={eventEditForm.description}
                                  onChange={(event) =>
                                    setEventEditForm((current) => ({
                                      ...current,
                                      description: event.target.value
                                    }))
                                  }
                                  className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                />
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={saveEventEdit}
                                    className="min-h-[36px] rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingEventId(null)}
                                    className="min-h-[36px] rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-slate-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </SortableListItem>
                      ))}

                      {events.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                          No events yet.
                        </p>
                      ) : null}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          ) : null}

          {activeSection === "notices" ? (
            <div className="space-y-6">
              <form
                onSubmit={onCreateNotice}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Create Notice
                </h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    value={noticeForm.title}
                    onChange={(event) =>
                      setNoticeForm((current) => ({
                        ...current,
                        title: event.target.value
                      }))
                    }
                    placeholder="Title"
                    required
                    className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    type="date"
                    value={noticeForm.date}
                    onChange={(event) =>
                      setNoticeForm((current) => ({
                        ...current,
                        date: event.target.value
                      }))
                    }
                    required
                    className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <select
                    value={noticeForm.type}
                    onChange={(event) =>
                      setNoticeForm((current) => ({
                        ...current,
                        type: event.target.value as NoticeType
                      }))
                    }
                    className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="daily">Daily</option>
                    <option value="holiday">Holiday</option>
                    <option value="alert">Important</option>
                  </select>
                  <button
                    type="submit"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Notice
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={noticeForm.content}
                  onChange={(event) =>
                    setNoticeForm((current) => ({
                      ...current,
                      content: event.target.value
                    }))
                  }
                  placeholder="Notice content"
                  required
                  className="mt-3 w-full min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </form>

              {loadingData ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                    />
                  ))}
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={reorderNotices}
                >
                  <SortableContext
                    items={notices.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {notices.map((item) => (
                        <SortableListItem key={item.id} id={item.id}>
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="break-words text-base font-semibold text-slate-900 dark:text-slate-100">
                                  {item.title}
                                </p>
                                <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">
                                  {item.content}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase ${noticeTypeStyles[item.type]}`}
                                >
                                  {item.type}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => startEditNotice(item)}
                                  className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium dark:border-slate-700"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteNotice(item.id)}
                                  className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:text-rose-300"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              {formatPrettyDate(item.date)}
                            </p>

                            {editingNoticeId === item.id ? (
                              <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
                                <input
                                  value={noticeEditForm.title}
                                  onChange={(event) =>
                                    setNoticeEditForm((current) => ({
                                      ...current,
                                      title: event.target.value
                                    }))
                                  }
                                  className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                />
                                <input
                                  type="date"
                                  value={noticeEditForm.date}
                                  onChange={(event) =>
                                    setNoticeEditForm((current) => ({
                                      ...current,
                                      date: event.target.value
                                    }))
                                  }
                                  className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                />
                                <select
                                  value={noticeEditForm.type}
                                  onChange={(event) =>
                                    setNoticeEditForm((current) => ({
                                      ...current,
                                      type: event.target.value as NoticeType
                                    }))
                                  }
                                  className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                >
                                  <option value="daily">Daily</option>
                                  <option value="holiday">Holiday</option>
                                  <option value="alert">Important</option>
                                </select>
                                <textarea
                                  rows={3}
                                  value={noticeEditForm.content}
                                  onChange={(event) =>
                                    setNoticeEditForm((current) => ({
                                      ...current,
                                      content: event.target.value
                                    }))
                                  }
                                  className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                />
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={saveNoticeEdit}
                                    className="min-h-[36px] rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingNoticeId(null)}
                                    className="min-h-[36px] rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-slate-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </SortableListItem>
                      ))}

                      {notices.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                          No notices yet.
                        </p>
                      ) : null}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          ) : null}
          {activeSection === "gallery" ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Gallery Presentation Mode
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Keep the current gallery grid or switch to slideshow mode.
                </p>

                <label className="mt-4 inline-flex min-h-[44px] w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700">
                  <span>Enable Slideshow Mode</span>
                  <input
                    type="checkbox"
                    checked={galleryDisplayMode === "slideshow"}
                    onChange={(event) =>
                      setGalleryDisplayMode(
                        event.target.checked ? "slideshow" : "grid"
                      )
                    }
                  />
                </label>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Current mode:{" "}
                  {galleryDisplayMode === "slideshow"
                    ? "Slideshow"
                    : "Default grid"}
                </p>

                <button
                  type="button"
                  onClick={saveGalleryDisplaySettings}
                  disabled={galleryDisplaySaving || galleryDisplayLoading}
                  className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {galleryDisplaySaving || galleryDisplayLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {galleryDisplaySaving
                    ? "Saving..."
                    : galleryDisplayLoading
                      ? "Loading..."
                      : "Save Gallery Mode"}
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Upload Images
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Drag and drop multiple images, preview them, then upload.
                </p>

                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                    addUploadDrafts(Array.from(event.dataTransfer.files));
                  }}
                  className={`mt-4 rounded-xl border-2 border-dashed p-6 text-center transition ${
                    dragActive
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <UploadCloud className="mx-auto h-8 w-8 text-blue-600" />
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Drop files here or choose from your device
                  </p>
                  <label className="mt-3 inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
                    Select Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={onUploadInputChange}
                    />
                  </label>
                </div>

                {uploadDrafts.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {uploadDrafts.map((draft) => (
                        <div
                          key={draft.id}
                          className="grid gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                        >
                          <div className="relative h-36 w-full overflow-hidden rounded-lg">
                            <Image
                              src={draft.preview}
                              alt={draft.alt}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <input
                            value={draft.alt}
                            onChange={(event) =>
                              setUploadDrafts((current) =>
                                current.map((item) =>
                                  item.id === draft.id
                                    ? { ...item, alt: event.target.value }
                                    : item
                                )
                              )
                            }
                            placeholder="Caption"
                            className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                          />
                          <input
                            value={draft.category}
                            onChange={(event) =>
                              setUploadDrafts((current) =>
                                current.map((item) =>
                                  item.id === draft.id
                                    ? { ...item, category: event.target.value }
                                    : item
                                )
                              )
                            }
                            placeholder="Category"
                            className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => removeUploadDraft(draft.id)}
                            className="inline-flex min-h-[36px] items-center justify-center rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:border-rose-800 dark:text-rose-300"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={onUploadDrafts}
                        disabled={uploading}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UploadCloud className="h-4 w-4" />
                        )}
                        {uploading ? "Uploading..." : "Upload Images"}
                      </button>
                      <button
                        type="button"
                        onClick={clearUploadDrafts}
                        className="min-h-[44px] rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-slate-700"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={reorderImages}
              >
                <SortableContext
                  items={images.map((item) => item.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {images.map((item) => (
                      <SortableImageCard key={item.id} id={item.id}>
                        <div className="relative h-44 w-full">
                          <Image
                            src={item.url}
                            alt={item.alt}
                            fill
                            sizes="(max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-3 text-white">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/80">
                              {item.category}
                            </p>
                            <p className="text-sm font-semibold">{item.alt}</p>
                          </div>
                        </div>

                        <div className="space-y-2 p-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEditImage(item)}
                              className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold dark:border-slate-700"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteImage(item.id)}
                              className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 dark:border-rose-800 dark:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>

                          {editingImageId === item.id ? (
                            <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950">
                              <input
                                value={imageEditForm.alt}
                                onChange={(event) =>
                                  setImageEditForm((current) => ({
                                    ...current,
                                    alt: event.target.value
                                  }))
                                }
                                className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                              />
                              <input
                                value={imageEditForm.category}
                                onChange={(event) =>
                                  setImageEditForm((current) => ({
                                    ...current,
                                    category: event.target.value
                                  }))
                                }
                                className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                              />
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={saveImageEdit}
                                  className="min-h-[36px] rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingImageId(null)}
                                  className="min-h-[36px] rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-slate-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </SortableImageCard>
                    ))}

                    {!loadingData && images.length === 0 ? (
                      <p className="col-span-full rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        No gallery images found.
                      </p>
                    ) : null}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ) : null}

          {activeSection === "popup" ? (
  <div className="space-y-6 ">
    <div className="rounded-xl border p-5 bg-white dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-3">Event Popup</h3>

      <input
        type="text"
        placeholder="Enter image URL"
        value={popupImage}
        onChange={(e) => setPopupImage(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <label className="flex items-center gap-2 mb-3">
        <input
          type="checkbox"
          checked={popupActive}
          onChange={(e) => setPopupActive(e.target.checked)}
        />
        Enable Popup
      </label>

      <button
        onClick={() => {
          addToast("success", "Popup saved (UI only)");
          console.log({ popupImage, popupActive });
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Popup
      </button>
    </div>
  </div>
) : null}

          {activeSection === "staff" ? (
            <AdminStaffManager
              apiRequest={apiRequest}
              addToast={addToast}
              requestConfirm={requestConfirm}
            />
          ) : null}

          {activeSection === "documents" ? (
            <AdminDocumentsManager
              apiRequest={apiRequest}
              addToast={addToast}
              requestConfirm={requestConfirm}
            />
          ) : null}

          {activeSection === "settings" ? (
            <div className="space-y-6">
              <form
                onSubmit={changePin}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Change Admin PIN
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Update your secure admin PIN used for dashboard login.
                </p>

                <div className="mt-4 space-y-3">
                  <input
                    type="password"
                    required
                    value={pinChange.currentPin}
                    onChange={(event) =>
                      setPinChange((current) => ({
                        ...current,
                        currentPin: event.target.value
                      }))
                    }
                    placeholder="Current PIN"
                    className="w-full min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    type="password"
                    required
                    value={pinChange.newPin}
                    onChange={(event) =>
                      setPinChange((current) => ({
                        ...current,
                        newPin: event.target.value
                      }))
                    }
                    placeholder="New PIN"
                    className="w-full min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pinChangeLoading}
                  className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {pinChangeLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {pinChangeLoading ? "Updating..." : "Update PIN"}
                </button>
              </form>

              <form
                onSubmit={saveHeroAdmissionsText}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Hero Admissions Badge
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Update the homepage admissions badge text.
                </p>

                <div className="mt-4 space-y-3">
                  <input
                    value={heroAdmissionsText}
                    onChange={(event) => setHeroAdmissionsText(event.target.value)}
                    placeholder="Admissions Open 2026"
                    required
                    className="w-full min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={heroContentSaving || heroContentLoading}
                  className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {heroContentSaving || heroContentLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {heroContentSaving
                    ? "Saving..."
                    : heroContentLoading
                      ? "Loading..."
                      : "Save Admissions Text"}
                </button>
              </form>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Gallery Presentation Mode
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Keep the current gallery grid or switch to slideshow mode.
                </p>

                <label className="mt-4 inline-flex min-h-[44px] w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700">
                  <span>Enable Slideshow Mode</span>
                  <input
                    type="checkbox"
                    checked={galleryDisplayMode === "slideshow"}
                    onChange={(event) =>
                      setGalleryDisplayMode(
                        event.target.checked ? "slideshow" : "grid"
                      )
                    }
                  />
                </label>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Current mode:{" "}
                  {galleryDisplayMode === "slideshow"
                    ? "Slideshow"
                    : "Default grid"}
                </p>

                <button
                  type="button"
                  onClick={saveGalleryDisplaySettings}
                  disabled={galleryDisplaySaving || galleryDisplayLoading}
                  className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {galleryDisplaySaving || galleryDisplayLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {galleryDisplaySaving
                    ? "Saving..."
                    : galleryDisplayLoading
                      ? "Loading..."
                      : "Save Gallery Mode"}
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Session
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  You can end the current admin session anytime.
                </p>
                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold sm:w-auto dark:border-slate-700"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {confirmState ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {confirmState.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {confirmState.message}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="min-h-[36px] rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={runConfirmAction}
                disabled={confirmLoading}
                className="inline-flex min-h-[36px] items-center gap-2 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {confirmLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="fixed left-4 right-4 top-4 z-[90] space-y-2 sm:left-auto sm:right-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`inline-flex w-full max-w-[calc(100vw-2rem)] items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-md sm:min-w-[260px] sm:max-w-none ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              aria-label="Dismiss toast"
              onClick={() =>
                setToasts((current) =>
                  current.filter((item) => item.id !== toast.id)
                )
              }
              className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}




