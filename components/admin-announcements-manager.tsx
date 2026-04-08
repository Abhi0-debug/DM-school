"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AnnouncementItem } from "@/lib/types";

type ToastType = "success" | "error";

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  action: () => Promise<void> | void;
}

interface AnnouncementFormState {
  text: string;
  isActive: boolean;
}

interface AdminAnnouncementsManagerProps {
  apiRequest: <T,>(url: string, init?: RequestInit) => Promise<T>;
  addToast: (type: ToastType, message: string) => void;
  requestConfirm: (next: ConfirmState) => void;
}

const initialAnnouncementForm: AnnouncementFormState = {
  text: "",
  isActive: true
};

function formatCreatedDate(value?: string) {
  if (!value) {
    return "Unknown";
  }

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

export function AdminAnnouncementsManager({
  apiRequest,
  addToast,
  requestConfirm
}: AdminAnnouncementsManagerProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AnnouncementFormState>(initialAnnouncementForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] =
    useState<AnnouncementFormState>(initialAnnouncementForm);
  const [savingEdit, setSavingEdit] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await apiRequest<{ announcements?: AnnouncementItem[] }>(
        "/api/announcements?include_inactive=true",
        { cache: "no-store" }
      );
      setAnnouncements(payload.announcements ?? []);
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to load announcements."
      );
    } finally {
      setLoading(false);
    }
  }, [addToast, apiRequest]);

  useEffect(() => {
    void loadAnnouncements();

    const onRefresh = () => {
      void loadAnnouncements();
    };

    window.addEventListener("admin:refresh", onRefresh);
    return () => {
      window.removeEventListener("admin:refresh", onRefresh);
    };
  }, [loadAnnouncements]);

  const onCreateAnnouncement = async (event: FormEvent) => {
    event.preventDefault();
    setCreating(true);

    try {
      const payload = await apiRequest<{
        message?: string;
        announcement: AnnouncementItem;
      }>("/api/announcements", {
        method: "POST",
        body: JSON.stringify(form)
      });

      setAnnouncements((current) => [payload.announcement, ...current]);
      setForm(initialAnnouncementForm);
      addToast("success", payload.message ?? "Announcement created.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to create announcement."
      );
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (item: AnnouncementItem) => {
    setEditingId(item.id);
    setEditForm({ text: item.text, isActive: item.isActive });
  };

  const saveEdit = async () => {
    if (!editingId) {
      return;
    }

    setSavingEdit(true);
    try {
      const payload = await apiRequest<{
        message?: string;
        announcement: AnnouncementItem;
      }>(`/api/announcements/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(editForm)
      });

      setAnnouncements((current) =>
        current.map((item) =>
          item.id === editingId ? payload.announcement : item
        )
      );
      setEditingId(null);
      addToast("success", payload.message ?? "Announcement updated.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to update announcement."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleActive = async (item: AnnouncementItem) => {
    setTogglingId(item.id);
    try {
      const payload = await apiRequest<{
        message?: string;
        announcement: AnnouncementItem;
      }>(`/api/announcements/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !item.isActive })
      });

      setAnnouncements((current) =>
        current.map((entry) =>
          entry.id === item.id ? payload.announcement : entry
        )
      );
      addToast("success", payload.message ?? "Announcement updated.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to update announcement."
      );
    } finally {
      setTogglingId(null);
    }
  };

  const deleteAnnouncement = (id: string) => {
    requestConfirm({
      title: "Delete Announcement",
      message: "This announcement will be removed permanently.",
      confirmLabel: "Delete",
      action: async () => {
        const payload = await apiRequest<{ message?: string }>(
          `/api/announcements/${id}`,
          { method: "DELETE" }
        );
        setAnnouncements((current) => current.filter((item) => item.id !== id));
        addToast("success", payload.message ?? "Announcement deleted.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={onCreateAnnouncement}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Create Announcement
        </h3>
        <div className="mt-4 grid gap-3">
          <textarea
            rows={3}
            value={form.text}
            onChange={(event) =>
              setForm((current) => ({ ...current, text: event.target.value }))
            }
            placeholder="Announcement text"
            required
            maxLength={500}
            className="w-full min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <label className="inline-flex min-h-[44px] items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
            <span>Show on website</span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isActive: event.target.checked
                }))
              }
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {creating ? "Adding..." : "Add Announcement"}
        </button>
      </form>

      <div className="space-y-3">
        {loading ? (
          [0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
            />
          ))
        ) : announcements.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No announcements yet.
          </p>
        ) : (
          announcements.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {item.text}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    Created on {formatCreatedDate(item.createdAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase ${
                    item.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="inline-flex min-h-[36px] items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    disabled={togglingId === item.id}
                    onChange={() => {
                      void toggleActive(item);
                    }}
                  />
                  Show on site
                </label>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium dark:border-slate-700"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteAnnouncement(item.id)}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>

              {editingId === item.id ? (
                <div className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
                  <textarea
                    rows={3}
                    value={editForm.text}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        text: event.target.value
                      }))
                    }
                    maxLength={500}
                    className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <label className="inline-flex min-h-[40px] items-center justify-between rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700">
                    <span>Show on website</span>
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          isActive: event.target.checked
                        }))
                      }
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={savingEdit}
                      className="min-h-[36px] rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {savingEdit ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="min-h-[36px] rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
