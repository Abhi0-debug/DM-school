"use client";

import { useEffect, useState } from "react";
import { NavConfig } from "@/lib/types";

type ToastType = "success" | "error";

interface AdminNavbarManagerProps {
  apiRequest: <T,>(url: string, init?: RequestInit) => Promise<T>;
  addToast: (type: ToastType, message: string) => void;
}

const defaultNavConfig: NavConfig = {
  home: true,
  gallery: true,
  events: true,
  notices: true,
  staff: true,
  contact: true
};

const navItems: Array<{ key: keyof NavConfig; label: string }> = [
  { key: "home", label: "Home" },
  { key: "gallery", label: "Gallery" },
  { key: "events", label: "Events" },
  { key: "notices", label: "Notices" },
  { key: "staff", label: "Staff" },
  { key: "contact", label: "Contact" }
];

export function AdminNavbarManager({ apiRequest, addToast }: AdminNavbarManagerProps) {
  const [config, setConfig] = useState<NavConfig>(defaultNavConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadNavConfig = async () => {
      setLoading(true);
      try {
        const payload = await apiRequest<{ config?: NavConfig }>("/api/admin/nav", {
          cache: "no-store"
        });

        if (mounted && payload.config) {
          setConfig(payload.config);
        }
      } catch (error) {
        addToast(
          "error",
          error instanceof Error ? error.message : "Unable to load navbar config."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadNavConfig();

    return () => {
      mounted = false;
    };
  }, [addToast, apiRequest]);

  const saveNavConfig = async () => {
    setSaving(true);
    try {
      const payload = await apiRequest<{ message?: string; config: NavConfig }>(
        "/api/admin/nav",
        {
          method: "PUT",
          body: JSON.stringify(config)
        }
      );
      setConfig(payload.config);
      addToast("success", payload.message ?? "Navbar visibility saved.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to save navbar config."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Navbar Section Visibility
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Toggle which sections appear in the public navigation.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {navItems.map((item) => (
            <label
              key={item.key}
              className="inline-flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
            >
              <span>{item.label}</span>
              <input
                type="checkbox"
                checked={config[item.key]}
                onChange={(event) =>
                  setConfig((current) => ({
                    ...current,
                    [item.key]: event.target.checked
                  }))
                }
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={saveNavConfig}
          disabled={loading || saving}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save Navbar Settings"}
        </button>
      </div>
    </div>
  );
}
