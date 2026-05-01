import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconMail,
} from "@tabler/icons-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 mt-12">
      <div className="max-w-7xl mx-auto px-5 py-10 md:py-14">
        <div className="grid gap-8 md:gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5 space-y-3">
            <p className="text-2xl font-bold text-white">
              Venz<span className="text-cyan-400">.</span>
            </p>
            <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
              Web, software and AI &amp; automation developer helping founders
              turn ideas into real, scalable digital products.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="https://github.com/venzaba25" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/30 transition-colors">
                <IconBrandGithub className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/in/venz-aba" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-blue-400 hover:border-blue-400/40 transition-colors">
                <IconBrandLinkedin className="h-4 w-4" />
              </a>
              <a href="https://www.facebook.com/venzaba" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-blue-500 hover:border-blue-500/40 transition-colors">
                <IconBrandFacebook className="h-4 w-4" />
              </a>
              <a href="https://wa.me/639512467291" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-emerald-400 hover:border-emerald-400/40 transition-colors">
                <IconBrandWhatsapp className="h-4 w-4" />
              </a>
              <a href="mailto:venzaba25@gmail.com" className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors">
                <IconMail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div className="md:col-span-3">
            <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-4">
              Navigate
            </p>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="text-neutral-300 hover:text-white transition-colors">About</a></li>
              <li><a href="#services" className="text-neutral-300 hover:text-white transition-colors">Services</a></li>
              <li><a href="#projects" className="text-neutral-300 hover:text-white transition-colors">Projects</a></li>
              <li><a href="#ai" className="text-neutral-300 hover:text-white transition-colors">AI &amp; Automation</a></li>
              <li><a href="#testimonials" className="text-neutral-300 hover:text-white transition-colors">Testimonials</a></li>
              <li><a href="#contact" className="text-neutral-300 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* CTA */}
          <div className="md:col-span-4">
            <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-4">
              Have a project?
            </p>
            <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
              I'm currently accepting a few new projects. Tell me about yours and I'll reply within 24 hours.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold hover:scale-[1.03] transition-transform shadow-lg shadow-blue-900/20"
            >
              Start a project →
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-neutral-500">
            © {currentYear} Venz Aba. All rights reserved.
          </p>
          <p className="text-xs text-neutral-500">
            Built with React, TypeScript, Tailwind &amp; a lot of coffee.
          </p>
        </div>
      </div>
    </footer>
  );
}
