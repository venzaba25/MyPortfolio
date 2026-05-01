# Venz Aba Portfolio

Personal portfolio website for Venz Aba, built with React + TypeScript + Vite.

## Project Structure
- `src/pages/Home.tsx` — single-page composition of all sections
- `src/components/` — `Hero`, `About`, `Services`, `Projects`, `AIAutomation`, `Testimonials`, `Contact`, `Footer`, `Navbar`, `ChatBot`
- `src/components/ui/` — primitives (badge, button, ContactModal, ScrollReveal, TypingText, ConstellationBackground, SplashCursor, etc.)
- `src/data/projects.json` — project gallery data
- `server/admin-api.js` — Express bridge server (port 5174) for admin dashboard, contact form, project edits, image uploads
- `public/` — static assets

## Site Sections (Home page)
1. Hero — "I turn your ideas into real, scalable products" + multi-role typing badge + CTAs (Hire Me / View Work / Say hi) + stats
2. About — pillar cards (Outcome-driven, Modern stack, AI-native, Founder-friendly)
3. Services — 5 product-style service cards + discovery-call card
4. Projects — selected work pulled from `projects.json` (with Supabase API fallback)
5. AI & Automation — featured chatbot card with mock chat + 6 use-case cards
6. Testimonials — 6 trust-style testimonials (placeholder content)
7. Contact — form + WhatsApp / Messenger / email quick-actions

## Tech Stack
- React 19 + TypeScript
- Vite 7 (dev server on port 5000)
- Tailwind CSS
- React Router
- Framer Motion / GSAP
- Supabase (admin authentication on `/admin`, project DB, image storage)
- Express + Nodemailer + Multer (admin bridge server on port 5174)

## Admin Login (`/admin`)
- The `/admin` route is gated by Supabase email/password authentication.
- Supabase client lives in `src/lib/supabase.ts` and reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Sessions persist in `localStorage` and auto-refresh.
- To create or manage admin users, use the Supabase dashboard (Authentication → Users).

## Replit Setup
- Workflow `Start application` runs `npm run dev`
- `npm run dev` uses `concurrently` to start both the Express API (port 5174) and Vite frontend (port 5000)
- Vite proxies `/api/*` requests to `http://localhost:5174`
- Vite configured with `host: 0.0.0.0`, `port: 5000`, `allowedHosts: true` for Replit preview proxy
- `@tabler/icons-react` is aliased directly to its ESM build in `vite.config.ts` for Vite 7 compatibility

## Environment Variables
- `VITE_SUPABASE_URL` — Supabase project URL (set as env var)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key (set as secret)
- `SUPABASE_URL` — Supabase URL for server-side use
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key for server (set as env var)
- `GMAIL_USER` — (optional) Gmail address for email notifications via contact form
- `GMAIL_APP_PASSWORD` — (optional) Gmail app password for SMTP
