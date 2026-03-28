-- Run in Supabase SQL Editor

create table if not exists public.hero_content (
  id text primary key,
  admissions_text text not null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists hero_content_set_updated_at on public.hero_content;
create trigger hero_content_set_updated_at
before update on public.hero_content
for each row execute function public.set_updated_at();

insert into public.hero_content (id, admissions_text)
values ('primary', 'Admissions Open 2026')
on conflict (id) do nothing;

alter table public.hero_content enable row level security;

drop policy if exists "hero_content_public_read" on public.hero_content;
create policy "hero_content_public_read"
  on public.hero_content
  for select
  to anon, authenticated
  using (true);

