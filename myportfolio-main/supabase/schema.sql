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
