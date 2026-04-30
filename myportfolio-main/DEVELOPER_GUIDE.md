# Portfolio Developer Guide (AI & Human)

This document provides a technical overview of the portfolio architecture and instructions for extending its capabilities.

## 🏗 Architecture Overview

The project is built on **React 19** and **Vite**, using **Tailwind CSS** for styling and **GSAP/Framer Motion** for animations.

### Data Flow
- **Source of Truth:** `src/data/projects.json`.
- **Local Persistence:** Data is modified via a local Express server (`server/admin-api.js`) which has direct filesystem access to `projects.json`.
- **Frontend Consumption:** The application reads from the JSON file to render the project grid.

## 🛠 Admin Dashboard System

We've implemented a custom Admin Dashboard to make the portfolio easy to update without touching code.

### 1. The Backend Bridge (`server/admin-api.js`)
Since browser-side JavaScript cannot write to the local filesystem, this Node.js bridge serves as the "writer":
- **Internal Port:** `5174`
- **Endpoints:**
  - `GET /api/projects`: Returns the raw JSON data.
  - `POST /api/projects`: overwrites `projects.json` with new content.

### 2. The Dashboard (`src/pages/AdminDashboard.tsx`)
A secure interface (default password: `admin123`) that allows:
- Adding new projects.
- Deleting existing projects.
- Updating titles, descriptions, and metadata.
- Toggling "Featured" status.

## 🚀 How to Run for Development

To enable the Admin Dashboard functionality, you must run TWO commands:

1. **Start the Frontend:**
   ```bash
   npm run dev
   ```
2. **Start the Admin Bridge:**
   ```bash
   npm run admin-api
   ```

## 🧩 Components Guide

- **`Hero.tsx`**: Features a custom `TypingText` component for the user's name with neon-style animated borders.
- **`Projects.tsx`**: Renders the project grid. Note: It currently imports the JSON file directly. To see live updates without a page refresh, consider refactoring it to fetch from the `admin-api`.
- **`ContactModal.tsx`**: Handles the "Get in Touch" popup with deep links for WhatsApp, Viber, and Messenger.

## 💡 Tips for Future AI Coders

- **Styles:** The project uses a global `index.css` for complex animations (like the glowing orb border). Use Tailwind utility classes for layout changes first.
- **Global Context:** The `ConstellationBackground` is a fixed, global component. All section backgrounds should remain transparent or semi-transparent to ensure it remains visible.
- **JSON Structure:** When adding new fields to `projects.json`, make sure to update the `Project` interface in `src/components/Projects.tsx` to maintain type safety.

---
*Created by Antigravity for Venz Aba - 2026*
