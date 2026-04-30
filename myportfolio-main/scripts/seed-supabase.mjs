import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectsFile = path.join(__dirname, "..", "src", "data", "projects.json");

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { projects } = JSON.parse(readFileSync(projectsFile, "utf8"));

const rows = projects.map((p, idx) => ({
  id: p.id,
  title: p.title ?? "",
  description: p.description ?? "",
  image: p.image ?? "",
  images: p.images ?? [],
  technologies: p.technologies ?? [],
  features: p.features ?? [],
  live_url: p.liveUrl ?? "",
  github_url: p.githubUrl ?? "",
  featured: !!p.featured,
  sort_order: idx,
}));

console.log(`Seeding ${rows.length} project(s) into Supabase…`);

const { error } = await supabase
  .from("projects")
  .upsert(rows, { onConflict: "id" });

if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}

console.log(`Done. Upserted ${rows.length} project(s).`);
