"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { StaffMember, Teacher } from "@/lib/types";

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
}

interface AdminStaffManagerProps {
  apiRequest: <T,>(url: string, init?: RequestInit) => Promise<T>;
  addToast: (type: ToastType, message: string) => void;
  requestConfirm: (next: ConfirmState) => void;
}

const initialStaffForm: StaffFormState = {
  name: "",
  subject: "",
  bio: ""
};

type StaffApiPayload = StaffMember | Teacher;

function toStaffMember(item: StaffApiPayload): StaffMember {
  if ("bio" in item && "photo" in item) {
    return item;
  }

  const teacher = item as Teacher;
  return {
    id: teacher.id,
    name: teacher.name,
    subject: teacher.subject,
    bio: teacher.description,
    photo: teacher.imageUrl,
    publicId: teacher.publicId,
    pdfUrl: teacher.pdfUrl,
    pdfTitle: teacher.pdfTitle
  };
}

function revokeUrl(url: string | null) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function AdminStaffManager({
  apiRequest,
  addToast,
  requestConfirm
}: AdminStaffManagerProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [staffForm, setStaffForm] = useState<StaffFormState>(initialStaffForm);
  const [staffImageFile, setStaffImageFile] = useState<File | null>(null);
  const [staffImagePreview, setStaffImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [staffEditForm, setStaffEditForm] = useState<StaffFormState>(initialStaffForm);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [staffPdfTitle, setStaffPdfTitle] = useState("");
  const [staffPdfFile, setStaffPdfFile] = useState<File | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadStaff = async () => {
      setLoading(true);
      try {
        const payload = await apiRequest<{
          staff?: StaffApiPayload[];
          teachers?: Teacher[];
        }>("/api/admin/staff", { cache: "no-store" });

        if (mounted) {
          const records = payload.staff ?? payload.teachers ?? [];
          setStaff(records.map(toStaffMember));
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

  useEffect(() => {
    return () => {
      revokeUrl(staffImagePreview);
      revokeUrl(editImagePreview);
    };
  }, [editImagePreview, staffImagePreview]);

  useEffect(() => {
    setSelectedStaffId((current) => {
      if (current && staff.some((item) => item.id === current)) {
        return current;
      }
      return staff[0]?.id ?? "";
    });
  }, [staff]);

  const onCreateImageChange = (file: File | null) => {
    revokeUrl(staffImagePreview);

    if (!file) {
      setStaffImageFile(null);
      setStaffImagePreview(null);
      return;
    }

    setStaffImageFile(file);
    setStaffImagePreview(URL.createObjectURL(file));
  };

  const onEditImageChange = (file: File | null) => {
    revokeUrl(editImagePreview);

    if (!file) {
      setEditImageFile(null);
      setEditImagePreview(null);
      return;
    }

    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const onCreateStaff = async (event: FormEvent) => {
    event.preventDefault();

    if (!staffImageFile) {
      addToast("error", "Please select a teacher image.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", staffForm.name);
      formData.append("subject", staffForm.subject);
      formData.append("description", staffForm.bio);
      formData.append("image", staffImageFile);

      const payload = await apiRequest<{
        message?: string;
        member?: StaffApiPayload;
        teacher?: Teacher;
      }>(
        "/api/admin/staff",
        {
          method: "POST",
          body: formData
        }
      );

      const created = payload.member ?? payload.teacher;
      if (!created) {
        throw new Error("Invalid create staff response.");
      }

      setStaff((current) => [toStaffMember(created), ...current]);
      setStaffForm(initialStaffForm);
      setStaffImageFile(null);
      revokeUrl(staffImagePreview);
      setStaffImagePreview(null);
      addToast("success", payload.message ?? "Staff member added.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to add staff member."
      );
    }
  };

  const onUploadStaffPdf = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedStaffId) {
      addToast("error", "Please select a staff member.");
      return;
    }

    if (!staffPdfFile) {
      addToast("error", "Please select a PDF file.");
      return;
    }

    setPdfUploading(true);
    try {
      const formData = new FormData();
      formData.append("staffId", selectedStaffId);
      formData.append("title", staffPdfTitle);
      formData.append("file", staffPdfFile);

      const payload = await apiRequest<{
        message?: string;
        member?: StaffApiPayload;
      }>("/api/admin/staff/pdfs", {
        method: "POST",
        body: formData
      });

      if (!payload.member) {
        throw new Error("Invalid staff PDF response.");
      }

      const updatedMember = toStaffMember(payload.member);
      setStaff((current) =>
        current.map((item) =>
          item.id === updatedMember.id ? updatedMember : item
        )
      );

      setStaffPdfFile(null);
      setStaffPdfTitle("");
      addToast("success", payload.message ?? "Staff PDF uploaded.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to upload staff PDF."
      );
    } finally {
      setPdfUploading(false);
    }
  };

  const startEditStaff = (member: StaffMember) => {
    setEditingId(member.id);
    setStaffEditForm({
      name: member.name,
      subject: member.subject,
      bio: member.bio
    });
    setEditImageFile(null);
    revokeUrl(editImagePreview);
    setEditImagePreview(member.photo);
  };

  const saveStaffEdit = async () => {
    if (!editingId) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", staffEditForm.name);
      formData.append("subject", staffEditForm.subject);
      formData.append("description", staffEditForm.bio);
      if (editImageFile) {
        formData.append("image", editImageFile);
      }

      const payload = await apiRequest<{
        message?: string;
        member?: StaffApiPayload;
        teacher?: Teacher;
      }>(
        `/api/admin/staff/${editingId}`,
        {
          method: "PUT",
          body: formData
        }
      );

      const updated = payload.member ?? payload.teacher;
      if (!updated) {
        throw new Error("Invalid update staff response.");
      }

      setStaff((current) =>
        current.map((item) =>
          item.id === editingId ? toStaffMember(updated) : item
        )
      );

      setEditingId(null);
      setEditImageFile(null);
      revokeUrl(editImagePreview);
      setEditImagePreview(null);
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

  const selectedStaff = staff.find((item) => item.id === selectedStaffId);

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
            className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <input
            value={staffForm.subject}
            onChange={(event) =>
              setStaffForm((current) => ({ ...current, subject: event.target.value }))
            }
            placeholder="Subject"
            required
            className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(event) => onCreateImageChange(event.target.files?.[0] ?? null)}
            required
            className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 md:col-span-2"
          />
        </div>
        {staffImagePreview ? (
          <div className="relative mt-3 h-36 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <Image
              src={staffImagePreview}
              alt="Teacher preview"
              fill
              className="object-cover"
            />
          </div>
        ) : null}
        <textarea
          rows={3}
          value={staffForm.bio}
          onChange={(event) =>
            setStaffForm((current) => ({ ...current, bio: event.target.value }))
          }
          placeholder="Teacher bio"
          required
          className="mt-3 min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Teacher
        </button>
      </form>

      <form
        onSubmit={onUploadStaffPdf}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Upload Staff PDF
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Upload or replace the downloadable PDF for a selected staff card.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            value={selectedStaffId}
            onChange={(event) => setSelectedStaffId(event.target.value)}
            required
            className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="" disabled>
              Select staff member
            </option>
            {staff.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input
            value={staffPdfTitle}
            onChange={(event) => setStaffPdfTitle(event.target.value)}
            placeholder="PDF title (optional)"
            className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => setStaffPdfFile(event.target.files?.[0] ?? null)}
            required
            className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 md:col-span-2"
          />
        </div>

        {selectedStaff?.pdfUrl ? (
          <p className="mt-2 break-words text-xs text-slate-500 dark:text-slate-400">
            Current PDF: {selectedStaff.pdfTitle ?? "Staff Profile"}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pdfUploading || staff.length === 0}
          className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {pdfUploading ? "Uploading..." : "Upload Staff PDF"}
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
              <p className="break-words text-sm text-slate-600 dark:text-slate-300">{member.bio}</p>
              <p className="break-all text-xs text-slate-500 dark:text-slate-400">{member.photo}</p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEditStaff(member)}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium dark:border-slate-700"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteStaff(member.id)}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:text-rose-300"
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
                    className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    value={staffEditForm.subject}
                    onChange={(event) =>
                      setStaffEditForm((current) => ({
                        ...current,
                        subject: event.target.value
                      }))
                    }
                    className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => onEditImageChange(event.target.files?.[0] ?? null)}
                    className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  {editImagePreview ? (
                    <div className="relative h-32 w-full overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
                      <Image
                        src={editImagePreview}
                        alt="Teacher edit preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <textarea
                    rows={3}
                    value={staffEditForm.bio}
                    onChange={(event) =>
                      setStaffEditForm((current) => ({
                        ...current,
                        bio: event.target.value
                      }))
                    }
                    className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={saveStaffEdit}
                      className="min-h-[36px] rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditImageFile(null);
                        revokeUrl(editImagePreview);
                        setEditImagePreview(null);
                      }}
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
