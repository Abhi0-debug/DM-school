import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

interface StaffPdfRecord {
  id: string;
  staffId: string;
  title: string;
  filePath: string;
  publicUrl: string;
  createdAt: string;
  updatedAt: string;
}

const STAFF_PDFS_FILE = "staff-pdfs.json";
const LOCAL_PUBLIC_PDF_PREFIX = "/uploads/staff-pdfs/";
const localStaffPdfDir = path.join(process.cwd(), "public", "uploads", "staff-pdfs");

function normalizeText(value: string) {
  return value.trim();
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function getDocumentsBucket() {
  return process.env.SUPABASE_DOCUMENTS_BUCKET ?? "documents";
}

function createStoragePath(filename: string) {
  const base = sanitizeFilename(filename);
  return `staff-pdfs/${Date.now()}-${randomUUID()}-${base}`;
}

function getAbsoluteLocalPathFromPublicUrl(publicUrl: string) {
  if (!publicUrl.startsWith(LOCAL_PUBLIC_PDF_PREFIX)) {
    return null;
  }

  const relative = publicUrl.replace(/^\//, "");
  const absolute = path.join(process.cwd(), "public", relative);
  const normalizedBase = path.resolve(localStaffPdfDir);
  const normalizedTarget = path.resolve(absolute);

  if (!normalizedTarget.startsWith(normalizedBase)) {
    return null;
  }

  return absolute;
}

async function writePdfFileLocal(file: File) {
  await fs.mkdir(localStaffPdfDir, { recursive: true });
  const filename = `${Date.now()}-${randomUUID()}-${sanitizeFilename(file.name)}`;
  const absolutePath = path.join(localStaffPdfDir, filename);
  const publicUrl = `${LOCAL_PUBLIC_PDF_PREFIX}${filename}`;
  const bytes = await file.arrayBuffer();

  await fs.writeFile(absolutePath, Buffer.from(bytes));
  return { storagePath: publicUrl, publicUrl };
}

async function writePdfFile(file: File) {
  try {
    const bytes = await file.arrayBuffer();
    const supabase = getSupabaseAdminClient();
    const bucket = getDocumentsBucket();
    const storagePath = createStoragePath(file.name);

    const { error } = await supabase
      .storage
      .from(bucket)
      .upload(storagePath, Buffer.from(bytes), {
        contentType: "application/pdf",
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    if (!data?.publicUrl) {
      throw new Error("Failed to resolve uploaded PDF public URL.");
    }

    return { storagePath, publicUrl: data.publicUrl };
  } catch {
    // If Supabase RLS/policy blocks this upload path, fallback to local storage.
    return writePdfFileLocal(file);
  }
}

async function removePdfFile(storagePath: string) {
  if (!storagePath) {
    return;
  }

  if (storagePath.startsWith("/")) {
    const absolutePath = getAbsoluteLocalPathFromPublicUrl(storagePath);
    if (!absolutePath) {
      return;
    }

    try {
      await fs.unlink(absolutePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    return;
  }

  const supabase = getSupabaseAdminClient();
  const bucket = getDocumentsBucket();
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);

  if (error) {
    const message = error.message.toLowerCase();
    if (!message.includes("not found")) {
      throw new Error(`Failed to delete PDF: ${error.message}`);
    }
  }
}

export function ensurePdfFile(file: File) {
  const lower = file.name.toLowerCase();
  const isPdfByType = file.type === "application/pdf";
  const isPdfByName = lower.endsWith(".pdf");

  if (!isPdfByType && !isPdfByName) {
    throw new Error("Only PDF files are allowed.");
  }
}

export async function listStaffPdfRecords() {
  return readJsonFile<StaffPdfRecord[]>(STAFF_PDFS_FILE, []);
}

export async function getStaffPdfRecordMapByStaffId() {
  const records = await listStaffPdfRecords();
  return new Map(records.map((item) => [item.staffId, item]));
}

export async function upsertStaffPdfForStaff(
  staffId: string,
  title: string,
  file: File
) {
  ensurePdfFile(file);

  const normalizedStaffId = normalizeText(staffId);
  if (!normalizedStaffId) {
    throw new Error("Staff member is required.");
  }

  const normalizedTitle = normalizeText(title);
  const records = await listStaffPdfRecords();
  const existing = records.find((item) => item.staffId === normalizedStaffId);

  const uploaded = await writePdfFile(file);
  const now = new Date().toISOString();

  const nextRecord: StaffPdfRecord = {
    id: existing?.id ?? `staff-pdf-${randomUUID()}`,
    staffId: normalizedStaffId,
    title: normalizedTitle || existing?.title || "Staff Profile",
    filePath: uploaded.storagePath,
    publicUrl: uploaded.publicUrl,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };

  const nextRecords = records.filter((item) => item.staffId !== normalizedStaffId);
  nextRecords.push(nextRecord);
  await writeJsonFile(STAFF_PDFS_FILE, nextRecords);

  if (existing?.filePath) {
    await removePdfFile(existing.filePath).catch(() => undefined);
  }

  return nextRecord;
}

export async function removeStaffPdfForStaff(staffId: string) {
  const normalizedStaffId = normalizeText(staffId);
  if (!normalizedStaffId) {
    return null;
  }

  const records = await listStaffPdfRecords();
  const existing = records.find((item) => item.staffId === normalizedStaffId);
  if (!existing) {
    return null;
  }

  const nextRecords = records.filter((item) => item.staffId !== normalizedStaffId);
  await writeJsonFile(STAFF_PDFS_FILE, nextRecords);
  await removePdfFile(existing.filePath).catch(() => undefined);

  return existing;
}
