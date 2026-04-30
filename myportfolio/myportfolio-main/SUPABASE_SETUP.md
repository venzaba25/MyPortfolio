# Supabase + Environment Setup Guide

This portfolio now stores **projects** in your Supabase database (table `public.projects`) instead of `src/data/projects.json`. The admin dashboard at `/admin` reads and writes through Supabase. The static JSON only acts as a fallback if Supabase is unreachable.

Follow these steps **once** to wire everything up.

---

## 1. Create the `projects` table + image storage in Supabase

1. Go to your Supabase project: <https://supabase.com/dashboard/project/gjzybjtmnwcidpvfwrbc>
2. Open **SQL Editor** → **New query**
3. Open the file `myportfolio-main/supabase/schema.sql` in this project
4. Copy the entire contents, paste into the SQL editor, and click **Run**
5. You should see `Success. No rows returned`

This creates:
- The `projects` table (with an `updated_at` trigger)
- A public Storage bucket called `project-images` for admin image uploads
- Row-Level-Security policies on both:
  - **Anyone** can read projects and view images
  - **Only signed-in users** (your admin login) can insert / update / delete projects, or upload / delete images

---

## 2. Create your admin user (if you haven't already)

1. In the Supabase dashboard, go to **Authentication → Users → Add user → Create new user**
2. Enter your email and a password
3. Tick **Auto Confirm User** so you can sign in immediately
4. This is the same email/password you'll use at `/admin` on your site

---

## 3. Seed your existing projects into Supabase

Back here in Replit, open the Shell and run:

```bash
cd myportfolio-main && npm run seed
```

You should see:
```
Seeding N project(s) into Supabase…
Done. Upserted N project(s).
```

This reads `src/data/projects.json` and pushes every project into your new Supabase table. You only need to run this once — from then on, any edits go straight to the database from the admin dashboard.

---

## 4. Environment variables

There are **3** environment values used by this project. Here's exactly where each one belongs.

| Name | What it is | Where it goes | Public? |
|------|------------|----------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `.env` (committed) **and** Vercel | Yes — baked into the JS bundle |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon / publishable key | `.env` (committed) **and** Vercel | Yes — safe in the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (full admin access) | Replit Secrets **only**, and Vercel if you ever run server scripts there | **NO — never expose this** |

### On Replit (already done for you)

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are in `myportfolio-main/.env`
- `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` are stored in **Replit Secrets** (Tools → Secrets). The seed script (`npm run seed`) reads these automatically.

### On Vercel

Open your project on Vercel → **Settings → Environment Variables** and add:

| Variable | Value | Environments |
|----------|-------|--------------|
| `VITE_SUPABASE_URL` | `https://gjzybjtmnwcidpvfwrbc.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_fAkfjBk3i_duU1bKwx18zQ_G7jDbCmJ` | Production, Preview, Development |

That's it for Vercel — since project data and images now live in Supabase, you do **not** need:
- ~~`GITHUB_TOKEN`~~ (no more committing `projects.json` from the live site)
- ~~`SUPABASE_SERVICE_ROLE_KEY`~~ on Vercel (only needed if you re-run the seed script)
- ~~`BLOB_READ_WRITE_TOKEN`~~ (image uploads now go to Supabase Storage instead of Vercel Blob)

After adding the variables on Vercel, **redeploy** so the new env values get baked into the build.

> Why the `VITE_` prefix? Vite only exposes env variables prefixed with `VITE_` to the browser. The service role key has no prefix on purpose — it must stay server-side.

---

## 5. Test the full flow

1. Visit `/` — the projects section should still show your projects (now coming from Supabase)
2. Visit `/admin` — sign in with the email/password you created in step 2
3. Edit a project title, click **Push Updates**
4. Refresh the public site — your edit appears immediately

If something doesn't work, check the browser console for errors. The most common issues are:
- **"Could not find the table 'public.projects'"** → step 1 wasn't run
- **"new row violates row-level security policy"** → you're not signed in on `/admin`, or step 1's policies didn't apply
- **Supabase fetch failed** → wrong URL or anon key in `.env`

---

## What changed in the code

- `src/lib/projectsApi.ts` — new module: read/write projects + upload images through `supabase-js`
- `src/components/Projects.tsx` — fetches from Supabase (falls back to static JSON if offline)
- `src/pages/AdminDashboard.tsx` — saves/deletes projects and uploads images through Supabase
- `scripts/seed-supabase.mjs` — one-shot seeder that pushes `projects.json` into Supabase
- `supabase/schema.sql` — projects table, RLS policies, **and** the `project-images` Storage bucket
- `package.json` — added `npm run seed`

The old `/api/projects` and `/api/upload` Vercel functions and the GitHub-commit / Vercel Blob logic are no longer used by the site. You can leave them in place or delete them later — your call.

## How image uploads work now

When you upload images from the admin dashboard:
1. The file is sent **directly** from your browser to Supabase Storage (bucket: `project-images`)
2. The folder name you choose becomes a subfolder inside the bucket (e.g. `project-images/travel-site/123-cover.png`)
3. You get back a **public URL** that's automatically saved to the project's `image` or `images` field

You can browse uploaded files anytime in the Supabase dashboard → **Storage → project-images**.
