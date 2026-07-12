-- Run in Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

drop policy if exists "announcements_public_read_active" on public.announcements;
create policy "announcements_public_read_active"
  on public.announcements
  for select
  to anon, authenticated
  using (is_active = true);

-- Mutations are done from API routes using service role key.
