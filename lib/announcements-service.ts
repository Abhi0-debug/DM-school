import { AnnouncementItem } from "@/lib/types";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

interface AnnouncementRow {
  id: string;
  text: string;
  is_active: boolean;
  created_at: string;
}

interface ActiveAnnouncementRow {
  id: string;
  text: string;
}

interface AnnouncementCreateInput {
  text: string;
  isActive?: boolean;
}

interface AnnouncementUpdateInput {
  text?: string;
  isActive?: boolean;
}

const ANNOUNCEMENT_COLUMNS = "id,text,is_active,created_at";
const ACTIVE_ANNOUNCEMENT_COLUMNS = "id,text";

function formatSupabaseError(scope: string, message?: string) {
  return new Error(message ? `${scope}: ${message}` : scope);
}

function normalizeText(value: string) {
  return value.trim();
}

function toAnnouncementItem(row: AnnouncementRow): AnnouncementItem {
  return {
    id: row.id,
    text: row.text,
    isActive: row.is_active,
    createdAt: row.created_at
  };
}

export async function listAnnouncements(): Promise<AnnouncementItem[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("announcements")
    .select(ANNOUNCEMENT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    throw formatSupabaseError("Failed to fetch announcements", error.message);
  }

  return (data ?? []).map((row) => toAnnouncementItem(row as AnnouncementRow));
}

export async function listActiveAnnouncementTexts(): Promise<
  Array<Pick<AnnouncementItem, "id" | "text">>
> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("announcements")
    .select(ACTIVE_ANNOUNCEMENT_COLUMNS)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw formatSupabaseError("Failed to fetch active announcements", error.message);
  }

  return (data ?? []).map((row) => {
    const item = row as ActiveAnnouncementRow;
    return { id: item.id, text: item.text };
  });
}

export async function createAnnouncement(
  input: AnnouncementCreateInput
): Promise<AnnouncementItem> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      text: normalizeText(input.text),
      is_active: input.isActive ?? true
    })
    .select(ANNOUNCEMENT_COLUMNS)
    .single();

  if (error) {
    throw formatSupabaseError("Failed to create announcement", error.message);
  }

  return toAnnouncementItem(data as AnnouncementRow);
}

export async function updateAnnouncement(
  id: string,
  input: AnnouncementUpdateInput
): Promise<AnnouncementItem | null> {
  const updates: { text?: string; is_active?: boolean } = {};

  if (typeof input.text === "string") {
    updates.text = normalizeText(input.text);
  }

  if (typeof input.isActive === "boolean") {
    updates.is_active = input.isActive;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No announcement fields were provided.");
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("announcements")
    .update(updates)
    .eq("id", id)
    .select(ANNOUNCEMENT_COLUMNS)
    .maybeSingle();

  if (error) {
    throw formatSupabaseError("Failed to update announcement", error.message);
  }

  if (!data) {
    return null;
  }

  return toAnnouncementItem(data as AnnouncementRow);
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw formatSupabaseError("Failed to delete announcement", error.message);
  }

  return Boolean(data);
}
