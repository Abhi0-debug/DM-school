-- Run in Supabase SQL Editor

create table if not exists public.events (
  id text primary key,
  title text not null,
  date date not null,
  location text not null,
  category text not null,
  description text not null,
  type text not null check (type in ('event', 'exam')),
  created_at timestamptz not null default now()
);

create table if not exists public.notices (
  id text primary key,
  title text not null,
  date date not null,
  type text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;
alter table public.notices enable row level security;

-- Read access for public pages
drop policy if exists "events_public_read" on public.events;
create policy "events_public_read"
  on public.events
  for select
  to anon, authenticated
  using (true);

drop policy if exists "notices_public_read" on public.notices;
create policy "notices_public_read"
  on public.notices
  for select
  to anon, authenticated
  using (true);

-- Mutations are done from API routes using service role key.

