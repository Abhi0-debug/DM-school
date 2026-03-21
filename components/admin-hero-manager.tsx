"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { HeroSlide } from "@/lib/types";

type ToastType = "success" | "error";

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  action: () => Promise<void> | void;
}

interface HeroFormState {
  url: string;
  alt: string;
}

interface AdminHeroManagerProps {
  apiRequest: <T,>(url: string, init?: RequestInit) => Promise<T>;
  addToast: (type: ToastType, message: string) => void;
  requestConfirm: (next: ConfirmState) => void;
}

const initialHeroForm: HeroFormState = {
  url: "",
  alt: ""
};

export function AdminHeroManager({
  apiRequest,
  addToast,
  requestConfirm
}: AdminHeroManagerProps) {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(false);
  const [heroForm, setHeroForm] = useState<HeroFormState>(initialHeroForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [heroEditForm, setHeroEditForm] = useState<HeroFormState>(initialHeroForm);

  useEffect(() => {
    let mounted = true;

    const loadSlides = async () => {
      setLoading(true);
      try {
        const payload = await apiRequest<{ slides?: HeroSlide[] }>("/api/admin/hero", {
          cache: "no-store"
        });

        if (mounted) {
          setSlides(payload.slides ?? []);
        }
      } catch (error) {
        addToast(
          "error",
          error instanceof Error ? error.message : "Unable to load hero slides."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSlides();

    return () => {
      mounted = false;
    };
  }, [addToast, apiRequest]);

  const onCreateSlide = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const payload = await apiRequest<{ message?: string; slide: HeroSlide }>(
        "/api/admin/hero",
        {
          method: "POST",
          body: JSON.stringify(heroForm)
        }
      );

      setSlides((current) => [payload.slide, ...current]);
      setHeroForm(initialHeroForm);
      addToast("success", payload.message ?? "Hero slide added.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to add hero slide."
      );
    }
  };

  const startEditSlide = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setHeroEditForm({
      url: slide.url,
      alt: slide.alt
    });
  };

  const saveSlideEdit = async () => {
    if (!editingId) {
      return;
    }

    try {
      const payload = await apiRequest<{ message?: string; slide: HeroSlide }>(
        `/api/admin/hero/${editingId}`,
        {
          method: "PUT",
          body: JSON.stringify(heroEditForm)
        }
      );

      setSlides((current) =>
        current.map((item) => (item.id === editingId ? payload.slide : item))
      );

      setEditingId(null);
      addToast("success", payload.message ?? "Hero slide updated.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to update hero slide."
      );
    }
  };

  const deleteSlide = (id: string) => {
    requestConfirm({
      title: "Delete Hero Slide",
      message: "This slide will be removed permanently.",
      confirmLabel: "Delete",
      action: async () => {
        const payload = await apiRequest<{ message?: string }>(
          `/api/admin/hero/${id}`,
          {
            method: "DELETE"
          }
        );
        setSlides((current) => current.filter((item) => item.id !== id));
        addToast("success", payload.message ?? "Hero slide deleted.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={onCreateSlide}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Add Hero Slide
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={heroForm.url}
            onChange={(event) =>
              setHeroForm((current) => ({ ...current, url: event.target.value }))
            }
            placeholder="Image URL or /uploads path"
            required
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <input
            value={heroForm.alt}
            onChange={(event) =>
              setHeroForm((current) => ({ ...current, alt: event.target.value }))
            }
            placeholder="Slide caption"
            required
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <button
          type="submit"
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Slide
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {loading ? (
          [0, 1].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
            />
          ))
        ) : slides.length === 0 ? (
          <p className="col-span-full rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No hero slides found.
          </p>
        ) : (
          slides.map((slide) => (
            <article
              key={slide.id}
              className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">{slide.url}</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {slide.alt}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEditSlide(slide)}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium dark:border-slate-700"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteSlide(slide.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>

              {editingId === slide.id ? (
                <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
                  <input
                    value={heroEditForm.url}
                    onChange={(event) =>
                      setHeroEditForm((current) => ({
                        ...current,
                        url: event.target.value
                      }))
                    }
                    className="rounded-md border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    value={heroEditForm.alt}
                    onChange={(event) =>
                      setHeroEditForm((current) => ({
                        ...current,
                        alt: event.target.value
                      }))
                    }
                    className="rounded-md border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveSlideEdit}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-slate-700"
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
