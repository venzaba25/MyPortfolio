import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import staticProjectsData from "@/data/projects.json";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ImageGalleryModal from "./ImageGalleryModal";
import { ScrollReveal } from "./ui/ScrollReveal";
import { fetchProjects, type Project } from "@/lib/projectsApi";

interface ProjectsProps {
  className?: string;
}

export default function Projects({ className }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>(staticProjectsData.projects as Project[]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [selectedProject, setSelectedProject] = useState<{ images: string[]; title: string; currentIndex: number } | null>(null);

  useEffect(() => {
    fetchProjects()
      .then((rows) => {
        if (rows.length > 0) setProjects(rows);
      })
      .catch((err) => {
        console.warn("[Projects] Supabase fetch failed, using static data:", err.message);
      });
  }, []);

  const visibleProjects = projects.slice(0, visibleCount);
  const hasMoreProjects = visibleCount < projects.length;

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 3, projects.length));
  };

  const openImageModal = (project: Project) => {
    const allImages = [project.image, ...(project.images || [])].filter(Boolean);
    setSelectedProject({
      images: allImages,
      title: project.title,
      currentIndex: 0
    });
  };

  const closeImageModal = () => {
    setSelectedProject(null);
  };

  return (
    <section id="projects" className={cn("relative py-16 md:py-24 overflow-hidden", className)}>
      <div className="relative max-w-7xl mx-auto w-full px-5 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center mb-10 md:mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80 font-semibold mb-4">
              Selected Work
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
              Projects that{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400">
                ship and convert
              </span>
            </h2>
            <p className="mt-5 text-base md:text-lg text-neutral-400 max-w-2xl mx-auto">
              Real client work — booking sites, dashboards, mobile apps and full-stack systems built to solve real business problems.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.45, ease: "easeOut" }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="relative overflow-hidden rounded-3xl border-2 border-cyan-500/30 bg-slate-900/25 backdrop-blur-lg p-5 shadow-2xl shadow-black/40"
            >
              <div
                className="relative aspect-video rounded-2xl overflow-hidden mb-4 cursor-pointer bg-neutral-900/40 flex items-center justify-center border border-white/5"
                onClick={() => project.image && openImageModal(project)}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover object-top transition duration-500 transform hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
              <p className="text-neutral-300 text-sm leading-relaxed mb-4">{project.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs px-2 py-1 rounded-full border-cyan-300/40 text-cyan-100">{tech}</Badge>
                ))}
              </div>

              <div className="space-y-1 mb-4">
                {(project.features || []).slice(0, 4).map((feature) => (
                  <p key={feature} className="text-xs text-gray-300/90">• {feature}</p>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    Live
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-cyan-500 text-cyan-200 text-xs rounded-full hover:bg-cyan-500/20 hover:text-white transition-all duration-200"
                  >
                    Code
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </div>

        {hasMoreProjects && (
          <div className="flex justify-center mt-10">
            <button
              onClick={loadMore}
              className="inline-flex items-center gap-2 px-8 py-3 border border-cyan-400/35 text-cyan-200 bg-black/30 rounded-full hover:bg-cyan-500/20 hover:text-white transition-all duration-200"
            >
              Load More
            </button>
          </div>
        )}

        <div className="text-center mt-8 text-xs text-cyan-100/70">
          Showing {visibleCount} of {projects.length} projects
        </div>
      </div>

      <ImageGalleryModal
        isOpen={selectedProject !== null}
        images={selectedProject?.images || []}
        title={selectedProject?.title || ""}
        currentIndex={selectedProject?.currentIndex || 0}
        onClose={closeImageModal}
      />
    </section>
  );
}
