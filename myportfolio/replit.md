# Venz Aba Portfolio

Personal portfolio website for Venz Aba, built with React + TypeScript + Vite.

## Project Structure
- App lives in the `myportfolio-main/` subdirectory
- `src/pages/Home.tsx` — single-page composition of all sections
- `src/components/` — `Hero`, `About`, `Services`, `Projects`, `AIAutomation`, `Testimonials`, `Contact`, `Footer`, `Navbar`, `ChatBot`
- `src/components/ui/` — primitives (badge, button, ContactModal, ScrollReveal, TypingText, ConstellationBackground, SplashCursor, etc.)
- `src/data/projects.json` — project gallery data
- `server/admin-api.js` — optional Express bridge server (port 5174) for admin dashboard, contact form, project edits, image uploads
- `api/` — serverless function variants (Vercel)
- `public/` — static assets

## Contact / Inquiries flow
- Public contact form (`src/components/Contact.tsx`) submits via a **single POST to `/api/contact`** on the bridge server (proxied by Vite). The bridge server:
  1. **Inserts the inquiry into `public.inquiries` using the Supabase service role key** — bypasses RLS entirely so no client-side database policy is needed. This is the source of truth for the admin inbox.
  2. Sends owner notification via Gmail SMTP if `GMAIL_USER` + `GMAIL_APP_PASSWORD` are set; otherwise the browser falls back to Web3Forms (Cloudflare blocks server-side Web3Forms calls, so this fallback runs from the client).
  3. Sends professional visitor auto-reply via Gmail SMTP, falling back to EmailJS HTTP API server-side.
- Admin views all inquiries at `/admin/inquiries` (`src/pages/AdminInquiries.tsx`) — search, filter (all/unread/read), mark read, reply via mailto, delete. Linked from the projects dashboard header (Inbox button). The unread badge (`AdminInquiriesBadge.tsx`) polls `/api/inquiries/unread-count` every 30 s.
- All admin reads/updates/deletes go through the bridge server (auth-gated by verifying the user's Supabase JWT). DB helpers live in `src/lib/inquiriesApi.ts`.
- Schema reference in `supabase/schema.sql` and `supabase/inquiries-fix.sql` (only needed if you ever want to access inquiries directly with the anon key in production — the service-role bridge avoids this requirement).

## Site Sections (Home page)
1. Hero — "I turn your ideas into real, scalable products" + multi-role typing badge + CTAs (Hire Me / View Work / Say hi) + stats
2. About — pillar cards (Outcome-driven, Modern stack, AI-native, Founder-friendly)
3. Services — 5 product-style service cards + discovery-call card
4. Projects — selected work pulled from `projects.json` (with API fallback)
5. AI &amp; Automation — featured chatbot card with mock chat + 6 use-case cards
6. Testimonials — 6 trust-style testimonials (placeholder content)
7. Contact — form + WhatsApp / Messenger / email quick-actions

## Tech Stack
- React 19 + TypeScript
- Vite 7 (dev server)
- Tailwind CSS
- React Router
- Framer Motion / GSAP
- Supabase (admin authentication on `/admin`)
- Express + Nodemailer + Multer (admin bridge server, optional)

## Admin Login (`/admin`)
- The `/admin` route is gated by Supabase email/password authentication.
- Supabase client lives in `src/lib/supabase.ts` and reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from `myportfolio-main/.env`.
- Sessions persist in `localStorage` and auto-refresh.
- To create or manage admin users, use the Supabase dashboard (Authentication → Users) for the connected project.

## Replit Setup
- Workflow `Start application` runs `cd myportfolio-main && npm run dev`, which uses `concurrently` to start two processes in parallel:
  1. `node server/admin-api.js` — Express bridge server on port 5174 (handles `/api/contact`, `/api/inquiries`, project edits, image uploads).
  2. `vite` — frontend dev server on port 5000.
- Vite proxies any `/api/*` request to `http://localhost:5174` (configured in `myportfolio-main/vite.config.ts`).
- Vite is configured with `host: 0.0.0.0`, `port: 5000`, `allowedHosts: true` so the Replit preview proxy works.
- Deployment is configured as `static` target: builds via `npm run build` in `myportfolio-main/` and serves `myportfolio-main/dist`. **Caveat:** static deployment does not run the bridge server, so `/api/*` endpoints will not exist in production. To deploy the contact form / admin inbox publicly, switch deployment target to autoscale (Node) or run the SQL in `supabase/inquiries-fix.sql` and revert the form to direct anon-key Supabase calls.

## Environment Variables
- `myportfolio-main/.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, optional `GMAIL_USER`, `GMAIL_APP_PASSWORD`.
- `.replit` userenv.shared: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (used server-side only — never exposed to the browser).
