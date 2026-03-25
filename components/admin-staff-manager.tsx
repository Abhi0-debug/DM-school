"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { StaffMember } from "@/lib/types";

type ToastType = "success" | "error";

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  action: () => Promise<void> | void;
}

interface StaffFormState {
  name: string;
  subject: string;
  bio: string;
  photo: string;
}

interface AdminStaffManagerProps {
  apiRequest: <T,>(url: string, init?: RequestInit) => Promise<T>;
  addToast: (type: ToastType, message: string) => void;
  requestConfirm: (next: ConfirmState) => void;
}

const initialStaffForm: StaffFormState = {
  name: "",
  subject: "",
  bio: "",
  photo: ""
};

export function AdminStaffManager({
  apiRequest,
  addToast,
  requestConfirm
}: AdminStaffManagerProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [staffForm, setStaffForm] = useState<StaffFormState>(initialStaffForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [staffEditForm, setStaffEditForm] = useState<StaffFormState>(initialStaffForm);

  useEffect(() => {
    let mounted = true;

    const loadStaff = async () => {
      setLoading(true);
      try {
        const payload = await apiRequest<{ staff?: StaffMember[] }>("/api/admin/staff", {
          cache: "no-store"
        });

        if (mounted) {
          setStaff(payload.staff ?? []);
        }
      } catch (error) {
        addToast(
          "error",
          error instanceof Error ? error.message : "Unable to load staff."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadStaff();

    return () => {
      mounted = false;
    };
  }, [addToast, apiRequest]);

  const onCreateStaff = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const payload = await apiRequest<{ message?: string; member: StaffMember }>(
        "/api/admin/staff",
        {
          method: "POST",
          body: JSON.stringify(staffForm)
        }
      );

      setStaff((current) => [payload.member, ...current]);
      setStaffForm(initialStaffForm);
      addToast("success", payload.message ?? "Staff member added.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to add staff member."
      );
    }
  };

  const startEditStaff = (member: StaffMember) => {
    setEditingId(member.id);
    setStaffEditForm({
      name: member.name,
      subject: member.subject,
      bio: member.bio,
      photo: member.photo
    });
  };

  const saveStaffEdit = async () => {
    if (!editingId) {
      return;
    }

    try {
      const payload = await apiRequest<{ message?: string; member: StaffMember }>(
        `/api/admin/staff/${editingId}`,
        {
          method: "PUT",
          body: JSON.stringify(staffEditForm)
        }
      );

      setStaff((current) =>
        current.map((item) => (item.id === editingId ? payload.member : item))
      );

      setEditingId(null);
      addToast("success", payload.message ?? "Staff member updated.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to update staff member."
      );
    }
  };

  const deleteStaff = (id: string) => {
    requestConfirm({
      title: "Delete Staff Member",
      message: "This staff member will be removed permanently.",
      confirmLabel: "Delete",
      action: async () => {
        const payload = await apiRequest<{ message?: string }>(
          `/api/admin/staff/${id}`,
          {
            method: "DELETE"
          }
        );
        setStaff((current) => current.filter((item) => item.id !== id));
        addToast("success", payload.message ?? "Staff member deleted.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={onCreateStaff}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Add Teacher
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={staffForm.name}
            onChange={(event) =>
              setStaffForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Teacher name"
            required
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <input
            value={staffForm.subject}
            onChange={(event) =>
              setStaffForm((current) => ({ ...current, subject: event.target.value }))
            }
            placeholder="Subject"
            required
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <input
            value={staffForm.photo}
            onChange={(event) =>
              setStaffForm((current) => ({ ...current, photo: event.target.value }))
            }
            placeholder="Photo URL or /uploads path"
            required
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 md:col-span-2"
          />
        </div>
        <textarea
          rows={3}
          value={staffForm.bio}
          onChange={(event) =>
            setStaffForm((current) => ({ ...current, bio: event.target.value }))
          }
          placeholder="Teacher bio"
          required
          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Teacher
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {loading ? (
          [0, 1].map((item) => (
            <div
              key={item}
              className="h-44 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
            />
          ))
        ) : staff.length === 0 ? (
          <p className="col-span-full rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No staff members found.
          </p>
        ) : (
          staff.map((member) => (
            <article
              key={member.id}
              className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {member.name}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {member.subject}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{member.bio}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{member.photo}</p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEditStaff(member)}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium dark:border-slate-700"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteStaff(member.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>

              {editingId === member.id ? (
                <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
                  <input
                    value={staffEditForm.name}
                    onChange={(event) =>
                      setStaffEditForm((current) => ({
                        ...current,
                        name: event.target.value
                      }))
                    }
                    className="rounded-md border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    value={staffEditForm.subject}
                    onChange={(event) =>
                      setStaffEditForm((current) => ({
                        ...current,
                        subject: event.target.value
                      }))
                    }
                    className="rounded-md border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    value={staffEditForm.photo}
                    onChange={(event) =>
                      setStaffEditForm((current) => ({
                        ...current,
                        photo: event.target.value
                      }))
                    }
                    className="rounded-md border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <textarea
                    rows={3}
                    value={staffEditForm.bio}
                    onChange={(event) =>
                      setStaffEditForm((current) => ({
                        ...current,
                        bio: event.target.value
                      }))
                    }
                    className="rounded-md border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveStaffEdit}
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
