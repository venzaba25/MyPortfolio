# 🚀 Modern AI-Powered Portfolio

Welcome to the **Venzaba25 Portfolio**, a high-performance, aesthetically-driven personal website built with React, Vite, and Tailwind CSS. This project is meticulously designed to be maintained and extended by both human developers and AI coding assistants.

## 🧠 AI Handover: System Architecture & Critical Logic

This section is dedicated to future AI assistants working on this repo. Please adhere to these established patterns:

### 1. The "Google Neon" 3-Orb System
- **Implementation**: Located in `src/index.css` under `.glowing-orb-border` and `.moving-orb`.
- **Mechanism**: Utilizes `offset-path: border-box` to ensure orbs follow the exact contour of any container (circles for the profile, pill-shapes for the badge).
- **Phasing**: The three orbs (Blue, Red, Yellow) maintain a perfect triangular formation via a 24-second loop with 8-second staggered `animation-delay` offsets (`0s`, `-8s`, `-16s`).
- **Visibility**: The parent container MUST NOT have `overflow: hidden` to allow the 16px orbs to bulge naturally over the border line.

### 2. Admin Dashboard & Image Uploads
- **Architecture**: The Admin UI (`src/pages/AdminDashboard.tsx`) communicates with a local Express server (`server/admin-api.js`).
- **CRITICAL**: When uploading images via `multer`, the `folder` field **MUST BE APPENDED to FormData BEFORE the image field**. Failing to do this will cause images to default to the `uploads/` root instead of the sub-directory.
- **Example**:
  ```javascript
  formData.append('folder', 'projects'); // Always First
  formData.append('image', file); // Always Second
  ```

### 3. Project Visuals
- **Ratio**: All project screenshots are rendered in a 16:9 aspect ratio container.
- **Alignment**: To ensure headers are not cut off in full-page screenshots, always use the combination of `object-cover` and `object-top`.

---

## 🛠 Tech Stack
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS + Framer Motion
- **Icons**: Lucide React + Tabler Icons
- **Backend (Admin)**: Node.js + Express + Multer
- **Animations**: CSS `offset-path`, GSAP, and ScrollReveal

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Running the Frontend
```bash
npm run dev
```

### 3. Running the Admin API (Required for Uploads)
```bash
npm run admin-api
```

---

## 📁 Project Structure
- `src/components/`: Modular UI components (Hero, Projects, Navbar).
- `src/pages/AdminDashboard.tsx`: Full suite for managing portfolio data.
- `server/admin-api.js`: Handles image processing and JSON database updates.
- `public/uploads/`: Target directory for all dynamic media.
- `src/index.css`: Global design tokens and complex CSS animations.

## 🤝 Contribution Guidelines (For AI assistants)
1. **Never use placeholders**: When generating UI, use vibrant, harmonized colors (HSL) and subtle glassmorphism.
2. **Document logic**: If you add new CSS animations, explain the math behind the phasing.
3. **Verify Field Order**: Always double-check `multer` upload field ordering in new handlers.

---
*Created with care by Antigravity AI for Venzaba25.*
