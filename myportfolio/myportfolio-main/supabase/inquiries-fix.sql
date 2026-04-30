-- ============================================================================
-- INQUIRIES TABLE — RUN THIS ONCE in Supabase SQL Editor.
--
-- Fixes the error:
--   "new row violates row-level security policy for table 'inquiries'"
--
-- Safe to re-run. Creates the table if missing and (re)installs the
-- RLS policies that allow:
--   - anyone (anon) to INSERT a new inquiry from the contact form
--   - signed-in admin users to READ / UPDATE / DELETE inquiries
--
-- How to use:
--   1. Open https://supabase.com/dashboard/project/<your-project> → SQL Editor
--   2. New query → paste this whole file → Run
--   3. You should see: "Success. No rows returned"
-- ============================================================================

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

-- Drop any old/partial versions of the policies first so we always end
-- up with a clean, working set.
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

-- Quick sanity check — should list 4 policies after running.
-- select policyname, cmd, roles from pg_policies where tablename = 'inquiries';
