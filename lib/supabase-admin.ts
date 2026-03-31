import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;
let warnedAboutSupabaseKey = false;

function firstNonEmpty(...values: Array<string | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function getSupabaseUrl() {
  return firstNonEmpty(process.env.SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_URL);
}

function getServiceRoleKey() {
  return firstNonEmpty(
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function getServiceRoleKeySource() {
  if (firstNonEmpty(process.env.SUPABASE_SECRET_KEY)) {
    return "SUPABASE_SECRET_KEY";
  }

  if (firstNonEmpty(process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    return "SUPABASE_SERVICE_ROLE_KEY";
  }

  return "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY";
}

function decodeJwtRole(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const raw = Buffer.from(payload, "base64").toString("utf8");
    const parsed = JSON.parse(raw) as { role?: string };
    return parsed.role ?? null;
  } catch {
    return null;
  }
}

function getServiceRoleKeyWarning(serviceRoleKey: string, source: string) {
  if (serviceRoleKey.startsWith("sb_publishable_")) {
    return `${source} is using a publishable key. Use Supabase service-role (legacy) or secret key instead.`;
  }

  if (serviceRoleKey.startsWith("sb_anon_")) {
    return `${source} is using an anon key. Use Supabase service-role (legacy) or secret key instead.`;
  }

  const jwtRole = decodeJwtRole(serviceRoleKey);
  if (jwtRole && jwtRole !== "service_role") {
    return `${source} has JWT role '${jwtRole}'. Expected role 'service_role'.`;
  }

  return null;
}

export function getSupabaseAdminClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const url = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();
  const serviceRoleKeySource = getServiceRoleKeySource();

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase environment variables are missing. Set SUPABASE_URL and a server key in SUPABASE_SECRET_KEY (preferred) or SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const keyWarning = getServiceRoleKeyWarning(serviceRoleKey, serviceRoleKeySource);
  if (keyWarning && !warnedAboutSupabaseKey) {
    warnedAboutSupabaseKey = true;
    console.warn(`[supabase-admin] ${keyWarning}`);
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return cachedClient;
}

