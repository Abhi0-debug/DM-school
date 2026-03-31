import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { GalleryDisplayConfig } from "@/lib/types";

const DEFAULT_CONFIG: GalleryDisplayConfig = { mode: "grid" };
const LOCAL_FILE = "gallery-display.json";
const SETTINGS_KEY = "gallery_display_mode";
const STORAGE_PATH = "configs/gallery-display.json";
const STORAGE_CONTENT_TYPES = [
  "application/json",
  "text/plain",
  "application/octet-stream",
  "application/pdf"
];
let settingsTableReadyPromise: Promise<void> | null = null;

interface SiteSettingRow {
  value: unknown;
}

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

function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function isNotFoundError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("not found") ||
    normalized.includes("404") ||
    normalized.includes("does not exist")
  );
}

async function ensureSettingsTableReady() {
  if (!settingsTableReadyPromise) {
    settingsTableReadyPromise = prisma
      .$executeRawUnsafe(`
        create table if not exists public.site_settings (
          setting_key text primary key,
          value jsonb not null,
          updated_at timestamptz not null default now()
        );
      `)
      .then(() => undefined);
  }

  await settingsTableReadyPromise;
}

function normalizeConfigFromUnknown(input: unknown) {
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input) as Partial<GalleryDisplayConfig>;
      return normalizeConfig(parsed);
    } catch {
      return null;
    }
  }

  if (input && typeof input === "object") {
    return normalizeConfig(input as Partial<GalleryDisplayConfig>);
  }

  return null;
}

async function loadConfigFromDatabase() {
  if (!isDatabaseConfigured()) {
    return null;
  }

  await ensureSettingsTableReady();
  const rows = await prisma.$queryRaw<SiteSettingRow[]>`
    select value
    from public.site_settings
    where setting_key = ${SETTINGS_KEY}
    limit 1
  `;

  if (!rows[0]) {
    return null;
  }

  return normalizeConfigFromUnknown(rows[0].value);
}

async function saveConfigToDatabase(config: GalleryDisplayConfig) {
  if (!isDatabaseConfigured()) {
    return false;
  }

  await ensureSettingsTableReady();
  await prisma.$executeRaw`
    insert into public.site_settings (setting_key, value)
    values (${SETTINGS_KEY}, jsonb_build_object('mode', ${config.mode}))
    on conflict (setting_key) do update
    set value = excluded.value,
        updated_at = now()
  `;

  return true;
}

export async function getGalleryDisplayConfig() {
  if (!isProductionRuntime()) {
    const local = await readJsonFile<GalleryDisplayConfig>(LOCAL_FILE, DEFAULT_CONFIG);
    return normalizeConfig(local);
  }

  try {
    const databaseConfig = await loadConfigFromDatabase();
    if (databaseConfig) {
      return databaseConfig;
    }
  } catch {
    // Continue to storage fallback.
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
  let databaseSaveError: string | null = null;

  if (!isProductionRuntime()) {
    await writeJsonFile(LOCAL_FILE, normalized);
    return normalized;
  }

  try {
    const savedToDatabase = await saveConfigToDatabase(normalized);
    if (savedToDatabase) {
      return normalized;
    }
  } catch (error) {
    databaseSaveError =
      error instanceof Error ? error.message : "Unknown database save error.";
    // Continue to storage fallback.
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
    const isRlsPolicyError = normalizedMessage.includes("row-level security policy");

    if (isRlsPolicyError) {
      const databaseHint = isDatabaseConfigured()
        ? databaseSaveError
          ? ` Database fallback failed: ${databaseSaveError}`
          : ""
        : " DATABASE_URL is not configured, so database fallback is unavailable.";

      throw new Error(
        `Failed to save gallery display mode: storage write blocked by row-level security policy.${databaseHint} Set SUPABASE_SERVICE_ROLE_KEY to a Supabase service-role or secret key in deployment.`
      );
    }

    if (!isMimeRestriction) {
      throw new Error(`Failed to save gallery display mode: ${error.message}`);
    }
  }

  throw new Error(
    `Failed to save gallery display mode: ${lastErrorMessage || "Unknown storage error."}`
  );
}
