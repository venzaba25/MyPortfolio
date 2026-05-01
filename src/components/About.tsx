import { ScrollReveal } from "./ui/ScrollReveal";
import {
  IconCode,
  IconRocket,
  IconBrain,
  IconUsersGroup,
} from "@tabler/icons-react";

const pillars = [
  {
    icon: IconRocket,
    title: "Outcome-driven",
    desc: "I focus on what moves the needle for your business — not just shipping code.",
  },
  {
    icon: IconCode,
    title: "Modern stack",
    desc: "PHP, React, TypeScript, Node, and modern frameworks — production-ready, not toy demos.",
  },
  {
    icon: IconBrain,
    title: "AI-native workflow",
    desc: "I leverage AI tools and automation to ship faster and smarter without sacrificing quality.",
  },
  {
    icon: IconUsersGroup,
    title: "Founder-friendly",
    desc: "Clear communication, fair scope, and async-friendly — you stay in control.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative pt-6 pb-10 md:py-24 px-5 overflow-hidden"
    >
      <div className="absolute top-1/3 -left-20 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <ScrollReveal direction="left" className="lg:col-span-5">
            <div className="text-center lg:text-left">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80 font-semibold mb-4">
                About
              </p>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 md:mb-6">
                A flexible developer who actually ships{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-400">
                  business results.
                </span>
              </h2>
              <p className="text-neutral-400 text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                I'm Venz — a freelance web, software and AI developer helping founders
                and small teams turn ideas into polished, scalable digital products.
                I treat every project like a product, not a deliverable: clear scope,
                clean code, fast iteration, and measurable impact for your business.
              </p>
            </div>
          </ScrollReveal>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
            {pillars.map((p, i) => (
              <ScrollReveal key={p.title} direction="up" delay={0.05 * i}>
                <div className="group h-full p-5 md:p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <p.icon className="h-5 w-5 text-cyan-300" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{p.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
