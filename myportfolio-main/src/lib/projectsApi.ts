import { supabase } from "./supabase";

export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  images?: string[];
  technologies: string[];
  features: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

interface ProjectRow {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  images: string[] | null;
  technologies: string[] | null;
  features: string[] | null;
  live_url: string | null;
  github_url: string | null;
  featured: boolean | null;
  sort_order: number | null;
}

const fromRow = (r: ProjectRow): Project => ({
  id: r.id,
  title: r.title ?? "",
  description: r.description ?? "",
  image: r.image ?? "",
  images: r.images ?? [],
  technologies: r.technologies ?? [],
  features: r.features ?? [],
  liveUrl: r.live_url ?? "",
  githubUrl: r.github_url ?? "",
  featured: !!r.featured,
});

const toRow = (p: Project, sortOrder: number) => ({
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
  sort_order: sortOrder,
});

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: false });
  if (error) throw error;
  return (data as ProjectRow[]).map(fromRow);
}

export async function upsertProject(project: Project, sortOrder: number) {
  const { error } = await supabase
    .from("projects")
    .upsert(toRow(project, sortOrder), { onConflict: "id" });
  if (error) throw error;
}

export async function replaceAllProjects(projects: Project[]) {
  const rows = projects.map((p, i) => toRow(p, i));
  const ids = projects.map((p) => p.id);

  // Upsert all current projects
  const { error: upErr } = await supabase
    .from("projects")
    .upsert(rows, { onConflict: "id" });
  if (upErr) throw upErr;

  // Delete any rows not in the new list
  if (ids.length > 0) {
    const { error: delErr } = await supabase
      .from("projects")
      .delete()
      .not("id", "in", `(${ids.join(",")})`);
    if (delErr) throw delErr;
  } else {
    const { error: delErr } = await supabase.from("projects").delete().neq("id", -1);
    if (delErr) throw delErr;
  }
}

export async function deleteProject(id: number) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Image storage (Supabase Storage bucket: "project-images")
// ---------------------------------------------------------------------------

const BUCKET = "project-images";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/\.[^.]+$/, "") // strip extension; we re-add it
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";

export async function uploadProjectImage(file: File, folder: string): Promise<string> {
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9/_-]+/g, "-") || "uploads";
  const ext = (file.name.match(/\.[^.]+$/)?.[0] ?? "").toLowerCase();
  const path = `${cleanFolder}/${Date.now()}-${slugify(file.name)}${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function listProjectImageFolders(): Promise<string[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list("", { limit: 1000 });
  if (error) throw error;
  // Folders show up as entries with no metadata (id is null for prefixes)
  return (data ?? [])
    .filter((entry) => entry.id === null || entry.metadata === null)
    .map((entry) => entry.name)
    .sort();
}
