import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

function getSupabaseUrl() {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
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

function getServiceRoleKeyIssue(serviceRoleKey: string) {
  if (serviceRoleKey.startsWith("sb_publishable_")) {
    return "SUPABASE_SERVICE_ROLE_KEY is using a publishable key. Use Supabase service-role (legacy) or secret key instead.";
  }

  if (serviceRoleKey.startsWith("sb_anon_")) {
    return "SUPABASE_SERVICE_ROLE_KEY is using an anon key. Use Supabase service-role (legacy) or secret key instead.";
  }

  const jwtRole = decodeJwtRole(serviceRoleKey);
  if (jwtRole && jwtRole !== "service_role") {
    return `SUPABASE_SERVICE_ROLE_KEY has JWT role '${jwtRole}'. Expected role 'service_role'.`;
  }

  return null;
}

export function getSupabaseAdminClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const url = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase environment variables are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const keyIssue = getServiceRoleKeyIssue(serviceRoleKey);
  if (keyIssue) {
    throw new Error(keyIssue);
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return cachedClient;
}

