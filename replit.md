# Venz Aba Portfolio

Personal portfolio website for Venz Aba, built with React + TypeScript + Vite.

## Project Structure
- App lives in the `myportfolio-main/` subdirectory
- `src/` — React app source (pages, components, data, lib)
- `server/admin-api.js` — optional Express bridge server (port 5174) for admin dashboard, contact form, project edits, image uploads
- `api/` — serverless function variants (Vercel)
- `public/` — static assets

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
