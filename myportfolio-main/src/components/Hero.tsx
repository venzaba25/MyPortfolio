import { cn } from "@/lib/utils";
import profileImage from "@/assets/images/profile.jpg";
import { Badge } from "./ui/badge";
import { ScrollReveal } from "./ui/ScrollReveal";
import TypingText from "./ui/TypingText";
import ContactModal from "./ui/ContactModal";
import { useState } from "react";
import Counter from "./ui/Counter";


interface HeroProps {
  className?: string;
  name?: string;
  description?: string;
}

export default function Hero({ 
  className,
  name = "Venz Aba",
  description = "Passionate about creating beautiful, functional, and user-centered digital experiences."
}: HeroProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <div
      id="about"
      className={cn(
        "relative flex min-h-screen h-auto lg:h-screen w-full items-center justify-center bg-transparent m-0 p-0 py-20 lg:py-0",
        className
      )}
    >
      {/* Electric mesh glow */}
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_10%_10%,rgba(87,78,225,0.1),transparent_30%), radial-gradient(circle_at_90%_20%,rgba(255,76,246,0.1),transparent_30%), radial-gradient(circle_at_40%_80%,rgba(35,229,181,0.12),transparent_40%)]" />

      {/* Background gradients removed to show constellation background */}
      <div className="relative z-20 flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl mx-auto px-4 lg:px-8 gap-8 lg:gap-16 pt-24 lg:pt-0">
        
        {/* Profile Image - First on Mobile, Second on Desktop */}
        <ScrollReveal direction="right" delay={0.2} className="flex-1 flex justify-center lg:justify-end items-end pb-8 lg:pb-16 lg:order-2">
            <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full p-[5px] lg:p-[10px] glowing-orb-border profile-orb">
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

        {/* Text Content - Second on Mobile, First on Desktop */}
        <div className="flex-1 text-center lg:text-left space-y-6 lg:order-1">
          {/* Greeting with name and role */}
          <ScrollReveal direction="left" delay={0}>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="block text-neutral-700 dark:text-neutral-300 mb-2">Hello I'm</span>
                <span className="block bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text text-transparent mb-4 pb-2">
                  <TypingText 
                    text={name} 
                    typingSpeed={150} 
                    deletingSpeed={80}
                    pauseDuration={1500} 
                    loop={true} 
                    showCursor={true}
                    cursorCharacter="_"
                    cursorClassName="text-cyan-400 font-bold"
                  />
                </span>
                <span className="flex items-center justify-center lg:justify-start text-neutral-700 dark:text-neutral-300 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl gap-4">
                  <span className="relative inline-block p-[3px] rounded-full glowing-orb-border badge-orb">
                    <div className="moving-orb orb-1 orb-blue" />
                    <div className="moving-orb orb-2 orb-red" />
                    <div className="moving-orb orb-3 orb-yellow" />
                    <Badge variant="outline" className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl px-6 py-3 font-semibold border-0 bg-white dark:bg-black rounded-full">
                      Web Developer
                    </Badge>
                  </span>
                </span>
              </h1>
            </div>
          </ScrollReveal>
          
          {/* Description */}
          <ScrollReveal direction="left" delay={0.1}>
            <div className="space-y-3">
              <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>
          </ScrollReveal>
          
          {/* Call-to-action buttons */}
          <ScrollReveal direction="left" delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="#projects" className="px-8 py-3 bg-white text-neutral-700 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-neutral-200 text-center">
                View My Work
              </a>
              <button 
                onClick={() => setIsContactModalOpen(true)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transform hover:scale-105 active:scale-95 transition-all duration-300 text-center border-none"
              >
                Get In Touch
              </button>
            </div>
          </ScrollReveal>
          
          {/* Social links or stats */}

          <ScrollReveal direction="left" delay={0.3}>
            <div className="flex justify-center lg:justify-start space-x-8 pt-2">
              <div className="text-center group">
                <p className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  <Counter value={2} suffix="+" />
                </p>
                <p className="text-xs uppercase tracking-widest text-neutral-500 mt-1">Years Experience</p>
              </div>
              <div className="text-center group">
                <p className="text-3xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                  <Counter value={10} suffix="+" />
                </p>
                <p className="text-xs uppercase tracking-widest text-neutral-500 mt-1">Projects Completed</p>
              </div>
              <div className="text-center group">
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