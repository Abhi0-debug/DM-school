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
const STAFF_PDFS_STORAGE_PATH = "staff-pdfs/records.json";
const LOCAL_PUBLIC_PDF_PREFIX = "/uploads/staff-pdfs/";
const localStaffPdfDir = path.join(process.cwd(), "public", "uploads", "staff-pdfs");
const STORAGE_CONTENT_TYPES = [
  "application/json",
  "text/plain",
  "application/octet-stream",
  "application/pdf"
];

function normalizeText(value: string) {
  return value.trim();
}

function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function getDocumentsBucket() {
  return process.env.SUPABASE_DOCUMENTS_BUCKET ?? "documents";
}

function isNotFoundStorageError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("not found") ||
    normalized.includes("404") ||
    normalized.includes("does not exist")
  );
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
  } catch (error) {
    if (isProductionRuntime()) {
      const message = error instanceof Error ? error.message : "Unknown storage error.";
      throw new Error(
        `Failed to upload staff PDF to storage: ${message}. In production, configure SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) with write access to bucket '${getDocumentsBucket()}'.`
      );
    }

    // Local development fallback.
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
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "ENOENT" && code !== "EROFS" && code !== "EPERM") {
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

async function readRecordsFromStorage() {
  const supabase = getSupabaseAdminClient();
  const bucket = getDocumentsBucket();
  const { data, error } = await supabase.storage.from(bucket).download(STAFF_PDFS_STORAGE_PATH);

  if (error) {
    if (isNotFoundStorageError(error.message)) {
      return [] as StaffPdfRecord[];
    }

    throw new Error(`Failed to load staff PDF records: ${error.message}`);
  }

  const raw = await data.text();
  if (!raw.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StaffPdfRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRecordsToStorage(records: StaffPdfRecord[]) {
  const supabase = getSupabaseAdminClient();
  const bucket = getDocumentsBucket();
  const body = Buffer.from(JSON.stringify(records, null, 2), "utf8");

  let lastErrorMessage = "";

  for (const contentType of STORAGE_CONTENT_TYPES) {
    const { error } = await supabase.storage.from(bucket).upload(STAFF_PDFS_STORAGE_PATH, body, {
      contentType,
      upsert: true
    });

    if (!error) {
      return;
    }

    lastErrorMessage = error.message;
    const normalized = error.message.toLowerCase();
    const isMimeRestriction =
      normalized.includes("mime type") && normalized.includes("not supported");
    const isRlsPolicyError = normalized.includes("row-level security policy");

    if (isRlsPolicyError) {
      throw new Error(
        "Failed to persist staff PDF records: storage write blocked by row-level security policy. Set SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) to a service-role/secret key in deployment."
      );
    }

    if (!isMimeRestriction) {
      throw new Error(`Failed to persist staff PDF records: ${error.message}`);
    }
  }

  throw new Error(
    `Failed to persist staff PDF records: ${lastErrorMessage || "Unknown storage error."}`
  );
}

async function loadRecords(options?: { tolerateErrors?: boolean }) {
  if (!isProductionRuntime()) {
    return readJsonFile<StaffPdfRecord[]>(STAFF_PDFS_FILE, []);
  }

  try {
    return await readRecordsFromStorage();
  } catch (error) {
    if (options?.tolerateErrors) {
      return [];
    }

    throw error;
  }
}

async function persistRecords(records: StaffPdfRecord[]) {
  if (!isProductionRuntime()) {
    await writeJsonFile(STAFF_PDFS_FILE, records);
    return;
  }

  await writeRecordsToStorage(records);
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
  return loadRecords({ tolerateErrors: true });
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
  const records = await loadRecords();
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

  try {
    await persistRecords(nextRecords);
  } catch (error) {
    await removePdfFile(uploaded.storagePath).catch(() => undefined);
    throw error;
  }

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

  const records = await loadRecords();
  const existing = records.find((item) => item.staffId === normalizedStaffId);
  if (!existing) {
    return null;
  }

  const nextRecords = records.filter((item) => item.staffId !== normalizedStaffId);
  await persistRecords(nextRecords);
  await removePdfFile(existing.filePath).catch(() => undefined);

  return existing;
}
