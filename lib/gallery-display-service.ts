import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { GalleryDisplayConfig } from "@/lib/types";

const DEFAULT_CONFIG: GalleryDisplayConfig = { mode: "grid" };
const LOCAL_FILE = "gallery-display.json";
const STORAGE_PATH = "configs/gallery-display.json";
const STORAGE_CONTENT_TYPES = [
  "application/json",
  "text/plain",
  "application/octet-stream",
  "application/pdf"
];

function normalizeConfig(
  input: Partial<GalleryDisplayConfig> | null | undefined
): GalleryDisplayConfig {
  return {
    mode: input?.mode === "slideshow" ? "slideshow" : "grid"
  };
}

function getDocumentsBucket() {
  return process.env.SUPABASE_DOCUMENTS_BUCKET ?? "documents";
}

function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

function isNotFoundError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("not found") ||
    normalized.includes("404") ||
    normalized.includes("does not exist")
  );
}

export async function getGalleryDisplayConfig() {
  if (!isProductionRuntime()) {
    const local = await readJsonFile<GalleryDisplayConfig>(LOCAL_FILE, DEFAULT_CONFIG);
    return normalizeConfig(local);
  }

  const supabase = getSupabaseAdminClient();
  const bucket = getDocumentsBucket();
  const { data, error } = await supabase.storage.from(bucket).download(STORAGE_PATH);

  if (error) {
    if (isNotFoundError(error.message)) {
      return DEFAULT_CONFIG;
    }

    throw new Error(`Failed to load gallery display mode: ${error.message}`);
  }

  const raw = await data.text();
  if (!raw.trim()) {
    return DEFAULT_CONFIG;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GalleryDisplayConfig>;
    return normalizeConfig(parsed);
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveGalleryDisplayConfig(config: GalleryDisplayConfig) {
  const normalized = normalizeConfig(config);

  if (!isProductionRuntime()) {
    await writeJsonFile(LOCAL_FILE, normalized);
    return normalized;
  }

  const supabase = getSupabaseAdminClient();
  const bucket = getDocumentsBucket();
  const body = Buffer.from(JSON.stringify(normalized, null, 2), "utf8");
  let lastErrorMessage = "";

  for (const contentType of STORAGE_CONTENT_TYPES) {
    const { error } = await supabase.storage.from(bucket).upload(STORAGE_PATH, body, {
      contentType,
      upsert: true
    });

    if (!error) {
      return normalized;
    }

    lastErrorMessage = error.message;
    const normalizedMessage = error.message.toLowerCase();
    const isMimeRestriction =
      normalizedMessage.includes("mime type") &&
      normalizedMessage.includes("not supported");

    if (!isMimeRestriction) {
      throw new Error(`Failed to save gallery display mode: ${error.message}`);
    }
  }

  throw new Error(
    `Failed to save gallery display mode: ${lastErrorMessage || "Unknown storage error."}`
  );
}
