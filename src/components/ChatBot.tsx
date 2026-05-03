import { useState, useRef, useEffect } from "react";
import { IconRobot, IconSparkles } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Personal information database
const personalInfo: Record<string, string> = {
  fullName: "Venz Aba",
  name: "Venz Aba",
  firstName: "Venz",
  lastName: "Aba",
  age: "23",
  location: "Philippines",
  address: "Purok bayanihan, Bo. 2 St. Niño, Koronadal City, South Cotabato",
  email: "venzaba25@gmail.com",
  github: "https://github.com/venzaba25",
  linkedin: "https://linkedin.com/in/venz-aba",
  facebook: "https://facebook.com/venzaba",
  role: "Web Developer",
  profession: "Web Developer",
  experience: "1+ years",
  skills: "React, TypeScript, Tailwind CSS, Laravel, Mysql and other modern web technologies",
  education: "BSIT Graduate",
};

// Simple keyword-based response system
const getResponse = (question: string): string => {
  const lowerQuestion = question.toLowerCase();

  // Greetings
  if (lowerQuestion.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return "Hello! I'm Venz Aba's AI assistant. Feel free to ask me anything about Venz's background, skills, or contact information!";
  }

  // Full name
  if (lowerQuestion.includes("full name") || lowerQuestion.includes("complete name")) {
    return `My full name is ${personalInfo.fullName}.`;
  }

  // Name
  if (lowerQuestion.includes("your name") || lowerQuestion.includes("who are you") || lowerQuestion.match(/\bname\b/)) {
    return `I'm ${personalInfo.name}, a ${personalInfo.role}.`;
  }

  // Age
  if (lowerQuestion.includes("age") || lowerQuestion.includes("old")) {
    return `I'm ${personalInfo.age} years old.`;
  }

  // Location/Address
  if (lowerQuestion.includes("location") || lowerQuestion.includes("address") || lowerQuestion.includes("where") || lowerQuestion.includes("live")) {
    return `I'm based in ${personalInfo.location}.`;
  }

  // Email
  if (lowerQuestion.includes("email") || lowerQuestion.includes("contact") || lowerQuestion.includes("reach")) {
    return `You can reach me at ${personalInfo.email}. You can also use the contact form on this website!`;
  }

  // Social Media
  if (lowerQuestion.includes("github")) {
    return `You can find my GitHub profile at ${personalInfo.github}`;
  }
  if (lowerQuestion.includes("linkedin")) {
    return `Connect with me on LinkedIn: ${personalInfo.linkedin}`;
  }
  if (lowerQuestion.includes("facebook")) {
    return `Find me on Facebook: ${personalInfo.facebook}`;
  }
  if (lowerQuestion.includes("social media") || lowerQuestion.includes("social")) {
    return `You can find me on:\n- GitHub: ${personalInfo.github}\n- LinkedIn: ${personalInfo.linkedin}\n- Facebook: ${personalInfo.facebook}`;
  }

  // Role/Profession
  if (lowerQuestion.includes("do") || lowerQuestion.includes("role") || lowerQuestion.includes("job") || lowerQuestion.includes("profession")) {
    return `I'm a ${personalInfo.role} with ${personalInfo.experience} of experience.`;
  }

  // Skills
  if (lowerQuestion.includes("skill") || lowerQuestion.includes("technology") || lowerQuestion.includes("tech stack")) {
    return `My skills include ${personalInfo.skills}.`;
  }

  // Experience
  if (lowerQuestion.includes("experience") || lowerQuestion.includes("worked")) {
    return `I have ${personalInfo.experience} of professional experience in web development.`;
  }

  // Education
  if (lowerQuestion.includes("education") || lowerQuestion.includes("study") || lowerQuestion.includes("degree")) {
    return `I'm a ${personalInfo.education}.`;
  }

  // Projects
  if (lowerQuestion.includes("project")) {
    return "You can view my projects in the Projects section above! I've worked on various web applications using modern technologies.";
  }

  // Help
  if (lowerQuestion.includes("help") || lowerQuestion === "?") {
    return "You can ask me about:\n- My name, age, and location\n- Contact information (email, social media)\n- Skills and experience\n- Education and projects\n- How to reach me\n\nFeel free to ask anything!";
  }

  // Default response
  return "I'm not sure about that. You can ask me about my name, age, location, contact information, skills, experience, or education. Type 'help' to see what I can answer!";
};

export default function ChatBot() {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi! I'm Venz Aba's virtual assistant. Ask me anything about Venz's background, skills, or how to contact him!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => setVisible(d.chatbot_visible !== false))
      .catch(() => setVisible(true));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Show hint logic
  useEffect(() => {
    let idleTimeout: ReturnType<typeof setTimeout>;
    let hintTimeout: ReturnType<typeof setTimeout>;

    const resetIdleTimer = () => {
      clearTimeout(idleTimeout);
      if (!isOpen) {
        idleTimeout = setTimeout(() => {
          setShowHint(true);
          hintTimeout = setTimeout(() => setShowHint(false), 8000);
        }, 10000);
      }
    };

    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("scroll", resetIdleTimer);
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimeout);
      clearTimeout(hintTimeout);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("scroll", resetIdleTimer);
    };
  }, [isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getResponse(inputValue),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 800);
  };

  if (visible === false) return null;

  return (
    <>
      {/* Hint Tooltip */}
      <AnimatePresence>
        {showHint && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-24 right-8 z-50 px-5 py-3 rounded-2xl bg-zinc-900/80 backdrop-blur-md border border-cyan-500/20 shadow-2xl"
          >
            <p className="text-sm font-medium text-cyan-100 flex items-center gap-2">
              <IconSparkles className="h-4 w-4 text-cyan-400" />
              Need help? Ask me!
            </p>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-zinc-900 rotate-45 border-r border-b border-cyan-500/20 lg:block hidden"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
        <motion.button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowHint(false);
          }}
          className={cn(
            "relative group flex h-14 sm:h-16 w-14 sm:w-16 items-center justify-center rounded-[1.5rem] overflow-hidden transition-all duration-300 shadow-2xl shadow-cyan-500/20",
            isOpen ? "opacity-0 pointer-events-none scale-75" : "bg-gradient-to-tr from-cyan-600 to-blue-600 opacity-100"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Pulsing ring */}
          {!isOpen && (
            <div className="absolute inset-0 border-2 sm:border-4 border-cyan-400 rounded-[1.5rem] animate-[ping_2s_infinite_linear] opacity-20 pointer-events-none" />
          )}
          <IconRobot size={32} stroke={2} className="text-white sm:w-10 sm:h-10" />
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[360px] md:w-[380px]"
          >
            <div className="flex flex-col rounded-[2rem] bg-zinc-900/95 backdrop-blur-2xl border-2 border-cyan-500/30 shadow-2xl overflow-hidden max-h-[80vh] sm:max-h-[85vh]">
              {/* Header */}
              <div className="px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-white/10 bg-gradient-to-b from-white/10 to-transparent">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center overflow-hidden border-2 border-white/20">
                      <IconRobot size={24} className="text-white sm:w-7 sm:h-7" />
                    </div>
                    <div className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 h-3 sm:h-4 w-3 sm:w-4 rounded-full bg-green-500 border-2 border-zinc-900 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">Venz AI</h3>
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                      <span className="text-[9px] sm:text-[10px] text-cyan-100 uppercase tracking-widest font-bold opacity-80">
                        Operational
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-8 sm:h-9 w-8 sm:w-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/10 relative z-30 group"
                >
                  <span className="relative z-40 flex items-center justify-center pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </span>
                </button>
              </div>

              {/* Message List */}
              <div className="h-[300px] sm:h-[350px] overflow-y-auto px-5 sm:px-8 py-5 sm:py-6 space-y-4 sm:space-y-6 scrollbar-hide">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: message.isUser ? 10 : -10, y: 10 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      className={cn(
                        "flex w-full",
                        message.isUser ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%]",
                        message.isUser ? "flex-row-reverse" : "flex-row"
                      )}>
                        <div className={cn(
                          "h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl flex-shrink-0 flex items-center justify-center border-2 bg-zinc-950/40 backdrop-blur-sm shadow-inner uppercase font-bold text-[9px] sm:text-[11px]",
                          message.isUser ? "border-white/10 text-white" : "border-cyan-500/30 text-cyan-400"
                        )}>
                          <span className="relative z-10">{message.isUser ? "ME" : "AI"}</span>
                        </div>
                        <div className={cn(
                          "rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm leading-relaxed",
                          message.isUser 
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-xl border border-white/10" 
                            : "bg-zinc-800/40 text-cyan-100 border border-white/10 rounded-tl-none font-light backdrop-blur-md"
                        )}>
                          {message.text}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-5 sm:p-8 border-t border-white/10 bg-zinc-950/20 backdrop-blur-md">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask assistant..."
                    className="w-full bg-zinc-900/40 border-2 border-white/10 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300 pr-14 sm:pr-16"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="absolute right-2 sm:right-2.5 h-9 sm:h-11 w-9 sm:w-11 flex items-center justify-center rounded-lg sm:rounded-xl bg-cyan-600 text-white transition-all duration-300 hover:bg-cyan-500 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale z-30 shadow-lg shadow-cyan-900/40"
                  >
                    <span className="relative z-40 flex items-center justify-center pointer-events-none">
                      <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="sm:w-6 sm:h-6"
                      >
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </span>
                  </button>
                </div>
                <div className="mt-3 sm:mt-4 text-center">
                  <p className="text-[8px] sm:text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-bold">
                    Venz Intelligence Core v2.0
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
