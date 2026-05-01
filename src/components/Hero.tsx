import { cn } from "@/lib/utils";
import profileImage from "@/assets/images/profile.jpg";
import { Badge } from "./ui/badge";
import { ScrollReveal } from "./ui/ScrollReveal";
import TypingText from "./ui/TypingText";
import ContactModal from "./ui/ContactModal";
import { useState } from "react";
import Counter from "./ui/Counter";
import { IconBolt, IconShieldCheck, IconClock } from "@tabler/icons-react";


interface HeroProps {
  className?: string;
  name?: string;
  description?: string;
}

export default function Hero({ 
  className,
  name = "Venz",
}: HeroProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <div
      id="home"
      className={cn(
        "relative flex min-h-screen w-full items-center justify-center bg-transparent m-0 p-0 py-16 lg:py-28",
        className
      )}
    >
      {/* Electric mesh glow */}
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_10%_10%,rgba(87,78,225,0.1),transparent_30%), radial-gradient(circle_at_90%_20%,rgba(255,76,246,0.1),transparent_30%), radial-gradient(circle_at_40%_80%,rgba(35,229,181,0.12),transparent_40%)]" />

      <div className="relative z-20 flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl mx-auto px-5 lg:px-8 gap-6 lg:gap-16 pt-8 lg:pt-0">
        
        {/* Profile Image */}
        <ScrollReveal direction="right" delay={0.2} className="order-2 lg:order-2 lg:flex-1 flex justify-center lg:justify-end lg:items-end pb-2 lg:pb-16">
            <div className="w-52 h-52 sm:w-72 sm:h-72 lg:w-96 lg:h-96 rounded-full p-[5px] lg:p-[10px] glowing-orb-border profile-orb">
              <div className="moving-orb orb-1 orb-blue" />
              <div className="moving-orb orb-2 orb-red" />
              <div className="moving-orb orb-3 orb-yellow" />
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-black">
                <img 
                  src={profileImage} 
                  alt={`${name} - Profile`}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </ScrollReveal>

        {/* Text Content */}
        <div className="order-1 lg:order-1 w-full lg:flex-1 text-center lg:text-left space-y-5">
          {/* Availability pill */}
          <ScrollReveal direction="left" delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs uppercase tracking-widest text-neutral-300 font-medium">
                Available for new projects · 2026
              </span>
            </div>
          </ScrollReveal>

          {/* Headline */}
          <ScrollReveal direction="left" delay={0.05}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight">
              <span className="block text-white">I turn your ideas into</span>
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent pb-1">
                real, scalable products.
              </span>
            </h1>
          </ScrollReveal>

          {/* Role typing badge */}
          <ScrollReveal direction="left" delay={0.1}>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <span className="text-neutral-400 text-base sm:text-lg">I'm {name} —</span>
              <span className="relative inline-block p-[3px] rounded-full glowing-orb-border badge-orb">
                <div className="moving-orb orb-1 orb-blue" />
                <div className="moving-orb orb-2 orb-red" />
                <div className="moving-orb orb-3 orb-yellow" />
                <Badge variant="outline" className="text-sm sm:text-base px-4 py-2 font-semibold border-0 bg-black rounded-full text-white">
                  <TypingText 
                    text={["Web Developer", "Software Developer", "AI & Automation Developer"]} 
                    typingSpeed={90} 
                    deletingSpeed={50}
                    pauseDuration={1600} 
                    loop={true} 
                    showCursor={true}
                    cursorCharacter="_"
                    cursorClassName="text-cyan-400 font-bold"
                  />
                </Badge>
              </span>
            </div>
          </ScrollReveal>
          
          {/* Subheadline */}
          <ScrollReveal direction="left" delay={0.15}>
            <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              I help businesses ship fast, modern websites, web &amp; mobile apps, AI chatbots,
              and automation systems that save time, reduce cost, and convert visitors into customers.
            </p>
          </ScrollReveal>

          {/* Trust strip */}
          <ScrollReveal direction="left" delay={0.2}>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs sm:text-sm text-neutral-400">
              <span className="inline-flex items-center gap-1.5"><IconBolt className="h-4 w-4 text-cyan-400" /> Fast delivery</span>
              <span className="inline-flex items-center gap-1.5"><IconShieldCheck className="h-4 w-4 text-emerald-400" /> Production-ready</span>
              <span className="inline-flex items-center gap-1.5"><IconClock className="h-4 w-4 text-violet-400" /> Async-friendly</span>
            </div>
          </ScrollReveal>
          
          {/* CTAs */}
          <ScrollReveal direction="left" delay={0.25}>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-1">
              <button 
                onClick={() => setIsContactModalOpen(true)}
                className="px-7 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.7)] transform hover:scale-[1.03] active:scale-95 transition-all duration-300 text-center border-none"
              >
                Hire Me
              </button>
              <a href="#projects" className="px-7 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/15 backdrop-blur-sm hover:border-white/30 transition-all duration-200 text-center">
                View My Work
              </a>
              <a href="#contact" className="py-3 text-neutral-400 text-sm font-medium hover:text-white transition-all duration-200 text-center underline-offset-4 hover:underline">
                Or just say hi →
              </a>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal direction="left" delay={0.3}>
            <div className="flex justify-center lg:justify-start space-x-6 sm:space-x-8 pt-3 border-t border-white/5 mt-2">
              <div className="text-center group pt-4">
                <p className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  <Counter value={2} suffix="+" />
                </p>
                <p className="text-xs uppercase tracking-widest text-neutral-500 mt-1">Years Experience</p>
              </div>
              <div className="text-center group pt-4">
                <p className="text-3xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                  <Counter value={10} suffix="+" />
                </p>
                <p className="text-xs uppercase tracking-widest text-neutral-500 mt-1">Projects Shipped</p>
              </div>
              <div className="text-center group pt-4">
                <p className="text-3xl font-bold text-white group-hover:text-violet-400 transition-colors">
                  <Counter value={10} suffix="+" />
                </p>
                <p className="text-xs uppercase tracking-widest text-neutral-500 mt-1">Happy Clients</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        number="+639512467291"
      />
    </div>
  );
}
