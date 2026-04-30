import { ScrollReveal } from "./ui/ScrollReveal";
import {
  IconWorldWww,
  IconAppWindow,
  IconDeviceMobile,
  IconRobot,
  IconSettingsAutomation,
  IconArrowUpRight,
} from "@tabler/icons-react";

const services = [
  {
    icon: IconWorldWww,
    title: "Website Development",
    pitch: "Sites that load fast, look premium and turn visitors into customers.",
    benefits: [
      "Conversion-focused design",
      "SEO-friendly structure",
      "Mobile-first & lightning fast",
    ],
    accent: "from-cyan-400 to-blue-500",
  },
  {
    icon: IconAppWindow,
    title: "Web App Development",
    pitch: "Custom dashboards, portals and SaaS-style tools tailored to how you actually work.",
    benefits: [
      "Authentication & roles",
      "Realtime data & dashboards",
      "Built to scale with you",
    ],
    accent: "from-blue-500 to-indigo-500",
  },
  {
    icon: IconDeviceMobile,
    title: "Mobile App Development",
    pitch: "Cross-platform mobile apps your users will actually open every day.",
    benefits: [
      "iOS & Android from one codebase",
      "Push notifications & offline-ready",
      "Polished native-feel UX",
    ],
    accent: "from-indigo-500 to-violet-500",
  },
  {
    icon: IconRobot,
    title: "AI Chatbot Development",
    pitch: "24/7 AI assistants that qualify leads, answer FAQs and handle support — on your data.",
    benefits: [
      "Trained on your business",
      "Web, Messenger & WhatsApp",
      "Captures leads while you sleep",
    ],
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: IconSettingsAutomation,
    title: "Business Automation",
    pitch: "Replace repetitive manual work with reliable automations that save real hours.",
    benefits: [
      "Forms, emails & CRM workflows",
      "API & spreadsheet integrations",
      "Faster ops, lower cost",
    ],
    accent: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: IconArrowUpRight,
    title: "Not sure which fits?",
    pitch: "Tell me what you're trying to build or fix — I'll recommend the simplest path forward.",
    benefits: [
      "Free 15-min discovery call",
      "Honest scope & pricing",
      "No commitment required",
    ],
    accent: "from-emerald-400 to-cyan-400",
    cta: true,
  },
];

export default function Services() {
  return (
    <section id="services" className="relative py-24 px-4 overflow-hidden">
      <div className="absolute top-1/4 right-0 w-[28rem] h-[28rem] bg-blue-600/10 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] bg-violet-600/10 rounded-full blur-[140px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80 font-semibold mb-4">
              Services
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              What I build for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400">
                growing businesses
              </span>
            </h2>
            <p className="mt-5 text-base md:text-lg text-neutral-400 max-w-2xl mx-auto">
              One developer. Modern stack. Senior thinking. Each engagement is scoped
              like a product launch — clear deliverables, real outcomes.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <ScrollReveal key={s.title} direction="up" delay={0.05 * i}>
              <div className="group relative h-full p-7 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/25 backdrop-blur-sm transition-all duration-300 overflow-hidden">
                {/* Accent glow */}
                <div className={`absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br ${s.accent} opacity-[0.07] rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />

                <div className={`relative h-12 w-12 rounded-2xl bg-gradient-to-br ${s.accent} bg-opacity-10 flex items-center justify-center mb-5 shadow-lg`}>
                  <s.icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed mb-5">
                  {s.pitch}
                </p>

                <ul className="space-y-2 mb-6">
                  {s.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-neutral-300">
                      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r ${s.accent} shrink-0`} />
                      {b}
                    </li>
                  ))}
                </ul>

                {s.cta ? (
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2 rounded-full transition-all"
                  >
                    Book a discovery call <IconArrowUpRight className="h-4 w-4" />
                  </a>
                ) : (
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-300 hover:text-white transition-colors"
                  >
                    Start a project <IconArrowUpRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
