-- Run this once in your Supabase project: SQL Editor -> New query -> paste -> Run.
-- Creates the projects table used by the portfolio + admin dashboard.

create table if not exists public.projects (
  id            bigint primary key,
  title         text not null,
  description   text default '',
  image         text default '',
  images        jsonb not null default '[]'::jsonb,
  technologies  jsonb not null default '[]'::jsonb,
  features      jsonb not null default '[]'::jsonb,
  live_url      text default '',
  github_url    text default '',
  featured      boolean not null default false,
  sort_order    bigint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-update updated_at on row update
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- Row-Level Security: anyone can READ, only signed-in admins can WRITE.
alter table public.projects enable row level security;

drop policy if exists "Public can read projects"      on public.projects;
drop policy if exists "Authenticated can insert"      on public.projects;
drop policy if exists "Authenticated can update"      on public.projects;
drop policy if exists "Authenticated can delete"      on public.projects;

create policy "Public can read projects"
  on public.projects for select
  using (true);

create policy "Authenticated can insert"
  on public.projects for insert to authenticated
  with check (true);

create policy "Authenticated can update"
  on public.projects for update to authenticated
  using (true) with check (true);

create policy "Authenticated can delete"
  on public.projects for delete to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for project images (uploaded from the admin dashboard).
-- Public bucket so image URLs work for site visitors.
-- Only authenticated users can upload / replace / delete.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read project-images"        on storage.objects;
drop policy if exists "Authenticated upload project-images" on storage.objects;
drop policy if exists "Authenticated update project-images" on storage.objects;
drop policy if exists "Authenticated delete project-images" on storage.objects;

create policy "Public read project-images"
  on storage.objects for select
  using (bucket_id = 'project-images');

create policy "Authenticated upload project-images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'project-images');

create policy "Authenticated update project-images"
  on storage.objects for update to authenticated
  using (bucket_id = 'project-images')
  with check (bucket_id = 'project-images');

create policy "Authenticated delete project-images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'project-images');

-- ---------------------------------------------------------------------------
-- Inquiries table — stores every contact-form submission so the admin
-- has a permanent record even if email delivery temporarily fails.
-- Anyone (anon) can INSERT a new inquiry; only signed-in admin can READ /
-- UPDATE (mark as read) / DELETE.
-- ---------------------------------------------------------------------------

create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null,
  last_name   text not null,
  email       text not null,
  subject     text not null,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);

alter table public.inquiries enable row level security;

drop policy if exists "Anyone can submit an inquiry" on public.inquiries;
drop policy if exists "Admin can read inquiries"     on public.inquiries;
drop policy if exists "Admin can update inquiries"   on public.inquiries;
drop policy if exists "Admin can delete inquiries"   on public.inquiries;

create policy "Anyone can submit an inquiry"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

create policy "Admin can read inquiries"
  on public.inquiries for select
  to authenticated
  using (true);

create policy "Admin can update inquiries"
  on public.inquiries for update
  to authenticated
  using (true) with check (true);

create policy "Admin can delete inquiries"
  on public.inquiries for delete
  to authenticated
  using (true);
