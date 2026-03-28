"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { FileDown, Pencil, Plus, Trash2 } from "lucide-react";
import { DocumentItem } from "@/lib/types";

type ToastType = "success" | "error";

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  action: () => Promise<void> | void;
}

interface AdminDocumentsManagerProps {
  apiRequest: <T,>(url: string, init?: RequestInit) => Promise<T>;
  addToast: (type: ToastType, message: string) => void;
  requestConfirm: (next: ConfirmState) => void;
}

function formatCreatedDate(value: string) {
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

export function AdminDocumentsManager({
  apiRequest,
  addToast,
  requestConfirm
}: AdminDocumentsManagerProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await apiRequest<{ documents?: DocumentItem[] }>("/api/documents", {
        cache: "no-store"
      });
      setDocuments(payload.documents ?? []);
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to load documents."
      );
    } finally {
      setLoading(false);
    }
  }, [addToast, apiRequest]);

  useEffect(() => {
    void loadDocuments();

    const onRefresh = () => {
      void loadDocuments();
    };

    window.addEventListener("admin:refresh", onRefresh);
    return () => {
      window.removeEventListener("admin:refresh", onRefresh);
    };
  }, [loadDocuments]);

  const onCreateDocument = async (event: FormEvent) => {
    event.preventDefault();

    if (!file) {
      addToast("error", "Please select a PDF file.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);

      const payload = await apiRequest<{ message?: string; document: DocumentItem }>(
        "/api/documents",
        {
          method: "POST",
          body: formData
        }
      );

      setDocuments((current) => [payload.document, ...current]);
      setTitle("");
      setFile(null);
      addToast("success", payload.message ?? "Document uploaded.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to upload document."
      );
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (item: DocumentItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditFile(null);
  };

  const saveEdit = async () => {
    if (!editingId) {
      return;
    }

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      if (editFile) {
        formData.append("file", editFile);
      }

      const payload = await apiRequest<{ message?: string; document: DocumentItem }>(
        `/api/documents/${editingId}`,
        {
          method: "PUT",
          body: formData
        }
      );

      setDocuments((current) =>
        current.map((item) => (item.id === editingId ? payload.document : item))
      );
      setEditingId(null);
      setEditFile(null);
      addToast("success", payload.message ?? "Document updated.");
    } catch (error) {
      addToast(
        "error",
        error instanceof Error ? error.message : "Unable to update document."
      );
    } finally {
      setUpdating(false);
    }
  };

  const removeDocument = (id: string) => {
    requestConfirm({
      title: "Delete Document",
      message: "This PDF will be removed permanently.",
      confirmLabel: "Delete",
      action: async () => {
        const payload = await apiRequest<{ message?: string }>(`/api/documents/${id}`, {
          method: "DELETE"
        });
        setDocuments((current) => current.filter((item) => item.id !== id));
        addToast("success", payload.message ?? "Document deleted.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={onCreateDocument}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Upload PDF
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Document title"
            required
            className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required
            className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {uploading ? "Uploading..." : "Add Document"}
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
        ) : documents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No documents found.
          </p>
        ) : (
          documents.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="break-words text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Updated on {formatCreatedDate(item.createdAt)}
                  </p>
                </div>
                <a
                  href={item.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium dark:border-slate-700"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  Open PDF
                </a>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
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
                  onClick={() => removeDocument(item.id)}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>

              {editingId === item.id ? (
                <div className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
                  <input
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(event) => setEditFile(event.target.files?.[0] ?? null)}
                    className="min-h-[40px] rounded-md border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select a new PDF only if you want to replace the current file.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={updating}
                      className="min-h-[36px] rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {updating ? "Saving..." : "Save"}
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
