import { HeroContent } from "@/lib/types";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

interface HeroContentRow {
  id: string;
  admissions_text: string;
  updated_at: string;
}

const DEFAULT_ADMISSIONS_TEXT = "Admissions Open 2026";
const PRIMARY_HERO_CONTENT_ID = "primary";
const HERO_COLUMNS = "id,admissions_text,updated_at";

function toHeroContent(row: HeroContentRow): HeroContent {
  return {
    id: row.id,
    admissionsText: row.admissions_text,
    updatedAt: row.updated_at
  };
}

function formatError(scope: string, message?: string) {
  return new Error(message ? `${scope}: ${message}` : scope);
}

export function getDefaultAdmissionsText() {
  return DEFAULT_ADMISSIONS_TEXT;
}

export async function getHeroContent(): Promise<HeroContent> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("hero_content")
    .select(HERO_COLUMNS)
    .eq("id", PRIMARY_HERO_CONTENT_ID)
    .maybeSingle();

  if (error) {
    throw formatError("Failed to fetch hero content", error.message);
  }

  if (!data) {
    return {
      id: PRIMARY_HERO_CONTENT_ID,
      admissionsText: DEFAULT_ADMISSIONS_TEXT,
      updatedAt: new Date(0).toISOString()
    };
  }

  return toHeroContent(data as HeroContentRow);
}

export async function updateHeroAdmissionsText(
  admissionsText: string
): Promise<HeroContent> {
  const supabase = getSupabaseAdminClient();
  const cleaned = admissionsText.trim();

  const { data, error } = await supabase
    .from("hero_content")
    .upsert(
      {
        id: PRIMARY_HERO_CONTENT_ID,
        admissions_text: cleaned
      },
      { onConflict: "id" }
    )
    .select(HERO_COLUMNS)
    .single();

  if (error) {
    throw formatError("Failed to update hero content", error.message);
  }

  return toHeroContent(data as HeroContentRow);
}

