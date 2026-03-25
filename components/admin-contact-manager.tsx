"use client";

import { FormEvent, useEffect, useState } from "react";
import { Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { ContactMessage, ContactSettings } from "@/lib/types";

type ToastType = "success" | "error";

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  action: () => Promise<void> | void;
}

interface AdminContactManagerProps {
  apiRequest: <T,>(url: string, init?: RequestInit) => Promise<T>;
  addToast: (type: ToastType, message: string) => void;
  requestConfirm: (next: ConfirmState) => void;
}

const initialSettings: ContactSettings = {
  email: "",
  phone: "",
  address: ""
};

export function AdminContactManager({
  apiRequest,
  addToast,
  requestConfirm
}: AdminContactManagerProps) {
  const [settings, setSettings] = useState<ContactSettings>(initialSettings);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadContactData = async () => {
      setLoading(true);
      try {
        const payload = await apiRequest<{
          settings?: ContactSettings;
          messages?: ContactMessage[];
        }>("/api/admin/contact", {
          cache: "no-store"
        });

        if (mounted) {
          setSettings(payload.settings ?? initialSettings);
          setMessages(payload.messages ?? []);
        }
      } catch (error) {
        addToast(
          "error",
          error instanceof Error ? error.message : "Unable to load contact data."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadContactData();

    return () => {
      mounted = false;
    };
  }, [addToast, apiRequest]);

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = await apiRequest<{ message?: string; settings: ContactSettings }>(
        "/api/admin/contact",
        {
          method: "PUT",
          body: JSON.stringify(settings)
        }
      );

      setSettings(payload.settings);
      addToast("success", payload.message ?? "Contact settings updated.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to update contact settings."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteMessage = (id: string) => {
    requestConfirm({
      title: "Delete Message",
      message: "This contact message will be removed permanently.",
      confirmLabel: "Delete",
      action: async () => {
        const payload = await apiRequest<{ message?: string }>(
          `/api/admin/contact/messages/${id}`,
          {
            method: "DELETE"
          }
        );
        setMessages((current) => current.filter((item) => item.id !== id));
        addToast("success", payload.message ?? "Message deleted.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={saveSettings}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Contact Info
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Update public phone, email and address used across the website.
        </p>

        <div className="mt-4 grid gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <Mail className="h-4 w-4 text-blue-600" />
            <input
              type="email"
              value={settings.email}
              onChange={(event) =>
                setSettings((current) => ({ ...current, email: event.target.value }))
              }
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <Phone className="h-4 w-4 text-blue-600" />
            <input
              value={settings.phone}
              onChange={(event) =>
                setSettings((current) => ({ ...current, phone: event.target.value }))
              }
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="inline-flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
            <MapPin className="mt-2 h-4 w-4 text-blue-600" />
            <textarea
              rows={2}
              value={settings.address}
              onChange={(event) =>
                setSettings((current) => ({ ...current, address: event.target.value }))
              }
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save Contact Info"}
        </button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Submitted Messages
        </h3>

        <div className="mt-4 space-y-3">
          {loading ? (
            [0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"
              />
            ))
          ) : messages.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No messages submitted yet.
            </p>
          ) : (
            messages.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {item.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => deleteMessage(item.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:text-rose-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {item.email} | {item.phone}
                </p>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                  {item.message}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {new Date(item.createdAt).toLocaleString("en-IN")}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
