import { randomUUID } from "crypto";
import { EventItem, NoticeItem, NoticeType } from "@/lib/types";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

interface EventRow {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  description: string;
  type: EventItem["type"];
  created_at: string;
}

interface NoticeRow {
  id: string;
  title: string;
  date: string;
  type: NoticeType;
  content: string;
  created_at: string;
}

interface EventInput {
  title: string;
  date: string;
  location: string;
  category?: string;
  description: string;
  type: EventItem["type"];
}

interface NoticeInput {
  title: string;
  date: string;
  type: NoticeType;
  content: string;
}

const EVENT_COLUMNS =
  "id,title,date,location,category,description,type,created_at";
const NOTICE_COLUMNS = "id,title,date,type,content,created_at";

function formatSupabaseError(scope: string, message?: string) {
  return new Error(message ? `${scope}: ${message}` : scope);
}

function normalizeText(value: string) {
  return value.trim();
}

function normalizeCategory(type: EventItem["type"], category?: string) {
  if (category && category.trim().length > 0) {
    return category.trim();
  }

  return type === "exam" ? "Exam" : "General";
}

function createItemId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

function toEventItem(row: EventRow): EventItem {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    location: row.location,
    category: row.category,
    description: row.description,
    type: row.type,
    createdAt: row.created_at
  };
}

function toNoticeItem(row: NoticeRow): NoticeItem {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    type: row.type,
    content: row.content,
    createdAt: row.created_at
  };
}

export async function listEvents(): Promise<EventItem[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .order("date", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw formatSupabaseError("Failed to fetch events", error.message);
  }

  return (data ?? []).map((row) => toEventItem(row as EventRow));
}

export async function listNotices(): Promise<NoticeItem[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notices")
    .select(NOTICE_COLUMNS)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw formatSupabaseError("Failed to fetch notices", error.message);
  }

  return (data ?? []).map((row) => toNoticeItem(row as NoticeRow));
}

export async function createEvent(input: EventInput): Promise<EventItem> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("events")
    .insert({
      id: createItemId("event"),
      title: normalizeText(input.title),
      date: input.date,
      location: normalizeText(input.location),
      category: normalizeCategory(input.type, input.category),
      description: normalizeText(input.description),
      type: input.type
    })
    .select(EVENT_COLUMNS)
    .single();

  if (error) {
    throw formatSupabaseError("Failed to create event", error.message);
  }

  return toEventItem(data as EventRow);
}

export async function updateEvent(
  id: string,
  input: EventInput
): Promise<EventItem | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("events")
    .update({
      title: normalizeText(input.title),
      date: input.date,
      location: normalizeText(input.location),
      category: normalizeCategory(input.type, input.category),
      description: normalizeText(input.description),
      type: input.type
    })
    .eq("id", id)
    .select(EVENT_COLUMNS)
    .maybeSingle();

  if (error) {
    throw formatSupabaseError("Failed to update event", error.message);
  }

  if (!data) {
    return null;
  }

  return toEventItem(data as EventRow);
}

export async function deleteEvent(id: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw formatSupabaseError("Failed to delete event", error.message);
  }

  return Boolean(data);
}

export async function listEventsByIds(ids: string[]): Promise<EventItem[]> {
  if (ids.length === 0) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .in("id", ids);

  if (error) {
    throw formatSupabaseError("Failed to load events for reorder", error.message);
  }

  const eventMap = new Map(
    (data ?? []).map((row) => {
      const mapped = toEventItem(row as EventRow);
      return [mapped.id, mapped] as const;
    })
  );

  return ids
    .map((id) => eventMap.get(id))
    .filter((item): item is EventItem => Boolean(item));
}

export async function createNotice(input: NoticeInput): Promise<NoticeItem> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notices")
    .insert({
      id: createItemId("notice"),
      title: normalizeText(input.title),
      date: input.date,
      type: input.type,
      content: normalizeText(input.content)
    })
    .select(NOTICE_COLUMNS)
    .single();

  if (error) {
    throw formatSupabaseError("Failed to create notice", error.message);
  }

  return toNoticeItem(data as NoticeRow);
}

export async function updateNotice(
  id: string,
  input: NoticeInput
): Promise<NoticeItem | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notices")
    .update({
      title: normalizeText(input.title),
      date: input.date,
      type: input.type,
      content: normalizeText(input.content)
    })
    .eq("id", id)
    .select(NOTICE_COLUMNS)
    .maybeSingle();

  if (error) {
    throw formatSupabaseError("Failed to update notice", error.message);
  }

  if (!data) {
    return null;
  }

  return toNoticeItem(data as NoticeRow);
}

export async function deleteNotice(id: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notices")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw formatSupabaseError("Failed to delete notice", error.message);
  }

  return Boolean(data);
}

export async function listNoticesByIds(ids: string[]): Promise<NoticeItem[]> {
  if (ids.length === 0) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notices")
    .select(NOTICE_COLUMNS)
    .in("id", ids);

  if (error) {
    throw formatSupabaseError("Failed to load notices for reorder", error.message);
  }

  const noticeMap = new Map(
    (data ?? []).map((row) => {
      const mapped = toNoticeItem(row as NoticeRow);
      return [mapped.id, mapped] as const;
    })
  );

  return ids
    .map((id) => noticeMap.get(id))
    .filter((item): item is NoticeItem => Boolean(item));
}

