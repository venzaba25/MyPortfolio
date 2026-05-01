import { ScrollReveal } from "./ui/ScrollReveal";
import {
  IconMessageChatbot,
  IconMail,
  IconUsers,
  IconCalendarTime,
  IconReportAnalytics,
  IconShoppingCart,
} from "@tabler/icons-react";

const useCases = [
  {
    icon: IconMessageChatbot,
    title: "AI Chatbot for your website",
    desc: "A branded chatbot trained on your services, FAQ and pricing — answering customers 24/7 and qualifying leads automatically.",
  },
  {
    icon: IconUsers,
    title: "Lead capture & qualification",
    desc: "Automatically score, tag and route incoming inquiries to the right place — email, CRM, Sheets or Slack.",
  },
  {
    icon: IconMail,
    title: "Email & follow-up automation",
    desc: "Automated welcome flows, reminders and follow-ups so no lead ever gets forgotten.",
  },
  {
    icon: IconCalendarTime,
    title: "Booking & appointment bots",
    desc: "Customers book themselves into your calendar via chat — instant confirmations, smart reminders.",
  },
  {
    icon: IconReportAnalytics,
    title: "Reports & data automation",
    desc: "Recurring reports, scraping, syncing and dashboard updates — without anyone touching a spreadsheet.",
  },
  {
    icon: IconShoppingCart,
    title: "E-commerce & ops workflows",
    desc: "Order updates, inventory sync, abandoned-cart recovery and fulfillment automations that just run.",
  },
];

export default function AIAutomation() {
  return (
    <section id="ai" className="relative py-16 md:py-24 px-5 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-violet-600/10 rounded-full blur-[160px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs uppercase tracking-[0.3em] text-violet-300 font-semibold mb-4">
              AI &amp; Automation
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              Put your business on{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-400 to-pink-400">
                autopilot.
              </span>
            </h2>
            <p className="mt-5 text-base md:text-lg text-neutral-400 max-w-2xl mx-auto">
              I design AI chatbots and automation systems that replace tedious manual work,
              respond to customers around the clock, and turn more visitors into paying clients.
            </p>
          </div>
        </ScrollReveal>

        {/* Featured chatbot card */}
        <ScrollReveal direction="up" delay={0.05}>
          <div className="relative mb-10 p-5 md:p-10 rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-950/30 via-black/40 to-fuchsia-950/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl" />
            <div className="grid md:grid-cols-2 gap-8 items-center relative">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-400/30 text-xs font-semibold text-violet-200 mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-300 animate-pulse" />
                  Most-requested service
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Custom AI Chatbots that work like your best employee
                </h3>
                <p className="text-neutral-300 leading-relaxed mb-6">
                  Trained on your business, integrated with your tools, and live on your
                  website, Messenger or WhatsApp. They never sleep, never forget a lead,
                  and always reply on-brand.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="#contact"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-sm shadow-lg shadow-violet-900/30 hover:scale-[1.03] transition-transform"
                  >
                    Build my chatbot
                  </a>
                  <a
                    href="#projects"
                    className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                  >
                    See examples
                  </a>
                </div>
              </div>

              {/* Mock chat preview */}
              <div className="rounded-2xl bg-black/50 border border-white/10 p-5 backdrop-blur-md shadow-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10 mb-3">
                  <div className="h-2 w-2 rounded-full bg-red-400" />
                  <div className="h-2 w-2 rounded-full bg-yellow-400" />
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-neutral-500">venz-bot</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] px-3.5 py-2 rounded-2xl rounded-br-sm bg-blue-600/80 text-white">
                      Hi! Do you build AI chatbots for clinics?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[80%] px-3.5 py-2 rounded-2xl rounded-bl-sm bg-white/10 text-neutral-100">
                      Yes — I've built booking and FAQ bots for clinics. Want me to set up a free 15-min call with Venz?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[80%] px-3.5 py-2 rounded-2xl rounded-br-sm bg-blue-600/80 text-white">
                      Yes please, tomorrow 10am.
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[80%] px-3.5 py-2 rounded-2xl rounded-bl-sm bg-white/10 text-neutral-100">
                      Booked ✅ Confirmation sent to your email.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Use case grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map((u, i) => (
            <ScrollReveal key={u.title} direction="up" delay={0.04 * i}>
              <div className="group h-full p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-violet-400/40 transition-all">
                <div className="h-11 w-11 rounded-xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center mb-4">
                  <u.icon className="h-5 w-5 text-violet-300" />
                </div>
                <h4 className="text-white font-semibold mb-2">{u.title}</h4>
                <p className="text-sm text-neutral-400 leading-relaxed">{u.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
