-- Run in Supabase SQL Editor

create table if not exists public.documents (
  id text primary key,
  title text not null,
  file_path text not null unique,
  public_url text not null,
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;

drop policy if exists "documents_public_read" on public.documents;
create policy "documents_public_read"
  on public.documents
  for select
  to anon, authenticated
  using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  true,
  10485760,
  array['application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "documents_bucket_public_read" on storage.objects;
create policy "documents_bucket_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'documents');

-- Writes/deletes are done via API routes using service role key.

