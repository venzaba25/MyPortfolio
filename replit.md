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
- Express + Nodemailer + Multer (admin bridge server, optional)

## Replit Setup
- Workflow `Start application` runs `cd myportfolio-main && npm run dev`
- Vite is configured in `myportfolio-main/vite.config.ts` with `host: 0.0.0.0`, `port: 5000`, `allowedHosts: true` so the Replit preview proxy works
- Deployment configured as `static` target: builds via `npm run build` in `myportfolio-main/` and serves `myportfolio-main/dist`

## Optional / Not Auto-Started
- The admin API (`npm run admin-api`) needs Gmail SMTP credentials in `.env` (`GMAIL_USER`, `GMAIL_APP_PASSWORD`). Start it manually if needed.
