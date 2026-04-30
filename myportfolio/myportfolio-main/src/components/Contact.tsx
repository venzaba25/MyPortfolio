import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  IconBrandGithub, 
  IconBrandLinkedin, 
  IconBrandFacebook, 
  IconBrandWhatsapp,
  IconBrandMessenger,
  IconMail, 
  IconUser, 
  IconMessage2, 
  IconTrendingUp,
  IconLoader2
} from "@tabler/icons-react";
import { ScrollReveal } from "./ui/ScrollReveal";
import { createInquiry } from "@/lib/inquiriesApi";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorDetail, setErrorDetail] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorDetail('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    const firstname = String(formData.get('firstname') ?? '').trim();
    const lastname = String(formData.get('lastname') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const subject = String(formData.get('subject') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    // Round-trip to the bridge server: it saves the inquiry to Supabase
    // (service role bypasses RLS) and sends the auto-reply via EmailJS / SMTP.
    let result;
    try {
      result = await createInquiry({
        firstName: firstname,
        lastName: lastname,
        email,
        subject,
        message,
      });
      console.log('Inquiry submitted:', result);
      setSubmitStatus('success');
      form.reset();
      setTimeout(() => setSubmitStatus('idle'), 6000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Inquiry submission failed:', err);
      setErrorDetail(msg);
      setSubmitStatus('error');
      setTimeout(() => { setSubmitStatus('idle'); setErrorDetail(''); }, 12000);
      setIsSubmitting(false);
      return;
    }

    // Owner notification fallback via Web3Forms (browser-only — Cloudflare
    // blocks server requests). Fire-and-forget; do not affect form status.
    if (result && !result.ownerEmailSent) {
      const fullName = `${firstname} ${lastname}`.trim();
      const fd = new FormData();
      fd.append('access_key', 'bfdbdd0f-caa0-4769-b73c-b98331c95571');
      fd.append('from_name', fullName || 'New inquiry');
      fd.append('subject', `New Inquiry from ${fullName || email}`);
      fd.append('firstname', firstname);
      fd.append('lastname', lastname);
      fd.append('email', email);
      fd.append('inquiry_subject', subject);
      fd.append('message', message);
      fd.append('replyto', email);
      fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(j => { if (!j?.success) console.error('Web3Forms owner notification failed:', j); })
        .catch(err => console.error('Web3Forms owner notification error:', err));
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen py-24 px-4 relative overflow-hidden" id="contact">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="mb-20 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80 font-semibold mb-4">
              Contact
            </p>
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Let's build your next{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">winning product.</span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Tell me what you're trying to build or fix. I'll reply within 24 hours
              with honest feedback, a rough timeline, and the simplest path forward.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Contact Info (Left) */}
          <div className="lg:col-span-5">
            <ScrollReveal direction="left" delay={0.2}>
              <div className="space-y-10">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-6">
                    Let's Build Something <br />
                    <span className="text-blue-500">Extraordinary.</span>
                  </h3>
                  <p className="text-neutral-400 leading-relaxed max-w-md">
                    Whether you're looking for a full-stack developer, a technical partner, 
                    or just want to say hi, my inbox is always open.
                  </p>
                </div>

                <div className="space-y-4">
                  <ContactMethod 
                    icon={<IconMail className="h-6 w-6" />}
                    label="Drop me an email"
                    value="venzaba25@gmail.com"
                    href="mailto:venzaba25@gmail.com"
                  />
                  <ContactMethod 
                    icon={<IconBrandWhatsapp className="h-6 w-6" />}
                    label="Chat on WhatsApp"
                    value="+63 951 246 7291"
                    href="https://wa.me/639512467291?text=Hi%20Venz%2C%20I%27d%20like%20to%20discuss%20a%20project."
                  />
                  <ContactMethod 
                    icon={<IconBrandMessenger className="h-6 w-6" />}
                    label="Message me on Messenger"
                    value="facebook.com/venzaba25"
                    href="https://facebook.com/venzaba25"
                  />

                  {/* Quick action buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href="https://wa.me/639512467291?text=Hi%20Venz%2C%20I%27d%20like%20to%20discuss%20a%20project."
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/20 hover:text-white transition-all"
                    >
                      <IconBrandWhatsapp className="h-4 w-4" /> WhatsApp Me
                    </a>
                    <a
                      href="https://facebook.com/venzaba25"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-semibold hover:bg-blue-500/20 hover:text-white transition-all"
                    >
                      <IconBrandMessenger className="h-4 w-4" /> Messenger
                    </a>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <SocialCircle 
                      icon={<IconBrandGithub />} 
                      href="https://github.com/venzaba25" 
                      color="hover:text-white"
                    />
                    <SocialCircle 
                      icon={<IconBrandLinkedin />} 
                      href="https://www.linkedin.com/in/venz-aba" 
                      color="hover:text-blue-400"
                    />
                    <SocialCircle 
                      icon={<IconBrandFacebook />} 
                      href="https://www.facebook.com/venzaba" 
                      color="hover:text-blue-600"
                    />
                  </div>
                </div>

                {/* Status Card */}
                <div className="p-6 rounded-3xl bg-zinc-900/40 border-2 border-cyan-500/30 backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-white font-medium text-sm">Active & Available</span>
                  </div>
                  <p className="text-neutral-500 text-sm">
                    Currently accepting freelance projects and collaboration opportunities for 2026.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Contact Form (Right) */}
          <div className="lg:col-span-7">
            <ScrollReveal direction="right" delay={0.3}>
              <div className="relative group">
                {/* Glow behind card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                
                <div className="relative rounded-[2rem] bg-zinc-900/60 backdrop-blur-xl border-2 border-cyan-500/30 p-10">
                  <h4 className="text-xl font-semibold text-white mb-8 flex items-center gap-2">
                    <IconMessage2 className="h-5 w-5 text-blue-500" />
                    Send a Message
                  </h4>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <LabelInputContainer>
                        <Label htmlFor="firstname">First name</Label>
                        <div className="relative">
                          <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                          <Input 
                            id="firstname" 
                            name="firstname" 
                            placeholder="Juan" 
                            type="text" 
                            className="bg-zinc-800/50 border-neutral-700/50 pl-10 focus:border-blue-500 focus:ring-blue-500/20" 
                            required 
                          />
                        </div>
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="lastname">Last name</Label>
                        <Input 
                          id="lastname" 
                          name="lastname" 
                          placeholder="Dela Cruz" 
                          type="text" 
                          className="bg-zinc-800/50 border-neutral-700/50 focus:border-blue-500 focus:ring-blue-500/20" 
                          required 
                        />
                      </LabelInputContainer>
                    </div>

                    <LabelInputContainer>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                        <Input
                          id="email"
                          name="email"
                          placeholder="juandelacruz@gmail.com"
                          type="email"
                          className="bg-zinc-800/50 border-neutral-700/50 pl-10 focus:border-blue-500 focus:ring-blue-500/20"
                          required
                        />
                      </div>
                    </LabelInputContainer>

                    <LabelInputContainer>
                      <Label htmlFor="subject">Subject</Label>
                      <div className="relative">
                        <IconTrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="Building a world-changing idea"
                          type="text"
                          className="bg-zinc-800/50 border-neutral-700/50 pl-10 focus:border-blue-500 focus:ring-blue-500/20"
                          required
                        />
                      </div>
                    </LabelInputContainer>

                    <LabelInputContainer>
                      <Label htmlFor="message">Message</Label>
                      <textarea
                        id="message"
                        name="message"
                        placeholder="Hey Venz, I'm looking for someone to help me build... "
                        rows={5}
                        required
                        className={cn(
                          "shadow-input flex w-full rounded-xl border-2 border-neutral-700/50 bg-zinc-800/50 px-4 py-3 text-sm text-white transition duration-300 placeholder:text-neutral-500 focus-visible:ring-[2px] focus-visible:ring-blue-500/20 focus-visible:border-blue-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none h-40"
                        )}
                      />
                    </LabelInputContainer>

                    {submitStatus === 'success' && (
                      <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-400 flex items-center gap-2">
                        <span className="text-lg">✓</span> Message sent successfully! I'll get back to you soon.
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                        <div className="flex items-start gap-2">
                          <span>✗</span>
                          <div>
                            <p>Failed to send message. Please try again or email me directly.</p>
                            {errorDetail && (
                              <p className="mt-1 text-xs text-red-300/80 break-all">{errorDetail}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      className="group/btn relative block h-14 w-full rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white shadow-lg shadow-blue-900/20 transition-all duration-300 disabled:opacity-50"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <IconLoader2 className="h-5 w-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Launch Message
                            <IconTrendingUp className="h-4 w-4" />
                          </>
                        )}
                      </span>
                      <BottomGradient />
                    </button>
                  </form>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}

const ContactMethod = ({ icon, label, value, href }: { icon: React.ReactNode, label: string, value: string, href: string }) => (
  <a 
    href={href} 
    className="flex items-center gap-4 group p-1 transition-colors"
  >
    <div className="h-12 w-12 rounded-2xl bg-zinc-900/50 border-2 border-cyan-500/30 flex items-center justify-center text-neutral-400 group-hover:text-blue-500 group-hover:border-blue-500/50 transition-all duration-300">
      {icon}
    </div>
    <div>
      <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-white font-medium group-hover:text-blue-400 transition-colors">{value}</p>
    </div>
  </a>
);

const SocialCircle = ({ icon, href, color }: { icon: React.ReactNode, href: string, color: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noreferrer"
    className={cn(
      "h-12 w-12 rounded-full bg-zinc-900 border-2 border-cyan-500/30 flex items-center justify-center text-neutral-500 transition-all duration-300 hover:scale-110",
      color
    )}
  >
    {React.cloneElement(icon as React.ReactElement<any>, { className: "h-5 w-5" })}
  </a>
);

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
