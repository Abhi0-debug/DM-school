import { randomUUID } from "crypto";
import { DocumentItem } from "@/lib/types";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

interface DocumentRow {
  id: string;
  title: string;
  file_path: string;
  public_url: string;
  created_at: string;
}

interface CreateDocumentInput {
  title: string;
  file: File;
}

interface UpdateDocumentInput {
  title: string;
  file?: File | null;
}

const DOCUMENT_COLUMNS = "id,title,file_path,public_url,created_at";

function formatError(scope: string, message?: string) {
  return new Error(message ? `${scope}: ${message}` : scope);
}

function normalizeTitle(value: string) {
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
  return `pdfs/${Date.now()}-${randomUUID()}-${base}`;
}

function toDocumentItem(row: DocumentRow): DocumentItem {
  return {
    id: row.id,
    title: row.title,
    filePath: row.file_path,
    publicUrl: row.public_url,
    createdAt: row.created_at
  };
}

export function ensurePdfFile(file: File) {
  const lower = file.name.toLowerCase();
  const isPdfByType = file.type === "application/pdf";
  const isPdfByName = lower.endsWith(".pdf");

  if (!isPdfByType && !isPdfByName) {
    throw new Error("Only PDF files are allowed.");
  }
}

async function uploadPdfFile(file: File) {
  ensurePdfFile(file);

  const supabase = getSupabaseAdminClient();
  const bucket = getDocumentsBucket();
  const storagePath = createStoragePath(file.name);
  const bytes = await file.arrayBuffer();
  const body = Buffer.from(bytes);

  const { error } = await supabase.storage.from(bucket).upload(storagePath, body, {
    contentType: "application/pdf",
    upsert: false
  });

  if (error) {
    throw formatError("Failed to upload PDF", error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  if (!data?.publicUrl) {
    throw new Error("Failed to resolve uploaded PDF public URL.");
  }

  return { storagePath, publicUrl: data.publicUrl };
}

async function removePdfFile(storagePath: string) {
  const supabase = getSupabaseAdminClient();
  const bucket = getDocumentsBucket();
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("not found")) {
      return;
    }
    throw formatError("Failed to delete PDF from storage", error.message);
  }
}

export async function listDocuments(): Promise<DocumentItem[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .select(DOCUMENT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    throw formatError("Failed to fetch documents", error.message);
  }

  return (data ?? []).map((row) => toDocumentItem(row as DocumentRow));
}

export async function createDocument(input: CreateDocumentInput): Promise<DocumentItem> {
  const supabase = getSupabaseAdminClient();
  const uploaded = await uploadPdfFile(input.file);

  try {
    const { data, error } = await supabase
      .from("documents")
      .insert({
        id: `doc-${randomUUID()}`,
        title: normalizeTitle(input.title),
        file_path: uploaded.storagePath,
        public_url: uploaded.publicUrl
      })
      .select(DOCUMENT_COLUMNS)
      .single();

    if (error) {
      throw formatError("Failed to save document record", error.message);
    }

    return toDocumentItem(data as DocumentRow);
  } catch (error) {
    await removePdfFile(uploaded.storagePath).catch(() => undefined);
    throw error;
  }
}

export async function updateDocument(
  id: string,
  input: UpdateDocumentInput
): Promise<DocumentItem | null> {
  const supabase = getSupabaseAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from("documents")
    .select(DOCUMENT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    throw formatError("Failed to load document", existingError.message);
  }

  if (!existing) {
    return null;
  }

  let nextPath = (existing as DocumentRow).file_path;
  let nextUrl = (existing as DocumentRow).public_url;
  let uploadedPath: string | null = null;

  if (input.file) {
    const uploaded = await uploadPdfFile(input.file);
    nextPath = uploaded.storagePath;
    nextUrl = uploaded.publicUrl;
    uploadedPath = uploaded.storagePath;
  }

  try {
    const { data, error } = await supabase
      .from("documents")
      .update({
        title: normalizeTitle(input.title),
        file_path: nextPath,
        public_url: nextUrl
      })
      .eq("id", id)
      .select(DOCUMENT_COLUMNS)
      .maybeSingle();

    if (error) {
      throw formatError("Failed to update document", error.message);
    }

    if (!data) {
      return null;
    }

    if (uploadedPath) {
      await removePdfFile((existing as DocumentRow).file_path).catch(() => undefined);
    }

    return toDocumentItem(data as DocumentRow);
  } catch (error) {
    if (uploadedPath) {
      await removePdfFile(uploadedPath).catch(() => undefined);
    }
    throw error;
  }
}

export async function deleteDocument(id: string): Promise<DocumentItem | null> {
  const supabase = getSupabaseAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from("documents")
    .select(DOCUMENT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    throw formatError("Failed to load document", existingError.message);
  }

  if (!existing) {
    return null;
  }

  await removePdfFile((existing as DocumentRow).file_path);

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) {
    throw formatError("Failed to delete document record", error.message);
  }

  return toDocumentItem(existing as DocumentRow);
}

