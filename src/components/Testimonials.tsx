import { ScrollReveal } from "./ui/ScrollReveal";
import { IconStarFilled, IconQuote } from "@tabler/icons-react";

const testimonials = [
  {
    name: "Marco D.",
    role: "Founder",
    company: "Travel & Tours Agency",
    quote:
      "Venz built us a booking site that doubled our inquiries in the first month. Clean, fast, and exactly what we needed — without the agency price tag.",
    initials: "MD",
    color: "from-cyan-500 to-blue-500",
  },
  {
    name: "Liza R.",
    role: "Operations Lead",
    company: "Wellness Clinic",
    quote:
      "The AI chatbot handles 80% of our patient questions and even books appointments. It honestly feels like we hired another team member overnight.",
    initials: "LR",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    name: "Jake P.",
    role: "Co-founder",
    company: "Local SaaS Startup",
    quote:
      "Reliable, communicative, and shipped a full dashboard in weeks instead of months. Venz treats your project like it's his own — that's rare.",
    initials: "JP",
    color: "from-emerald-500 to-cyan-500",
  },
  {
    name: "Aira S.",
    role: "Marketing Manager",
    company: "E-commerce Brand",
    quote:
      "He automated our order updates and abandoned-cart flow. Sales recovery went up immediately and the team stopped doing manual exports.",
    initials: "AS",
    color: "from-pink-500 to-orange-400",
  },
  {
    name: "Daniel C.",
    role: "Owner",
    company: "Real Estate Firm",
    quote:
      "Our new website finally looks like the agency we are. Leads are noticeably more qualified and our agents love the dashboard.",
    initials: "DC",
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "Mika V.",
    role: "Founder",
    company: "Coaching Business",
    quote:
      "From idea to launch in under 3 weeks. Honest pricing, clear updates, and the end result felt premium. I'll be back for v2.",
    initials: "MV",
    color: "from-amber-400 to-pink-500",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-16 md:py-24 px-5 overflow-hidden">
      <div className="absolute top-1/3 left-0 w-[28rem] h-[28rem] bg-cyan-600/10 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-600/10 rounded-full blur-[140px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80 font-semibold mb-4">
              Testimonials
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              Trusted by founders who needed it{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-400">
                done right.
              </span>
            </h2>
            <p className="mt-5 text-base md:text-lg text-neutral-400 max-w-2xl mx-auto">
              Real outcomes from clients across web development, AI chatbots and business automation.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} direction="up" delay={0.05 * i}>
              <figure className="relative h-full p-5 md:p-7 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/40 transition-all">
                <IconQuote className="absolute top-5 right-5 h-7 w-7 text-white/10" />

                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <IconStarFilled key={idx} className="h-4 w-4" />
                  ))}
                </div>

                <blockquote className="text-neutral-200 leading-relaxed text-[15px] mb-6">
                  "{t.quote}"
                </blockquote>

                <figcaption className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-neutral-500">
                      {t.role} · {t.company}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
