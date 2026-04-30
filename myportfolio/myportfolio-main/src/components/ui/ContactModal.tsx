"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, MessageCircle } from "lucide-react"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  number: string
}

const ContactModal = ({ isOpen, onClose, number }: ContactModalProps) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])
  const contacts = [
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "bg-[#25D366]",
      link: `https://wa.me/639512467291`, // Hardcoded to ensure correct format
      description: "Chat with me on WhatsApp"
    },
    {
      name: "Messenger",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "bg-[#0084FF]",
      link: "https://m.me/venzaba25",
      description: "Chat with me on Messenger"
    },
    {
      name: "Viber",
      icon: <Send className="w-6 h-6" />,
      color: "bg-[#7c5295]", // Viber purple
      link: `viber://chat?number=639512467291`, // Removed %2B as it's often more compatible
      description: "Message me on Viber"
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-neutral-900 border border-neutral-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl pointer-events-auto relative overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Get in Touch</h2>
                <p className="text-neutral-400">Choose your preferred way to connect</p>
              </div>

              <div className="space-y-4">
                {contacts.map((contact) => (
                  <a
                    key={contact.name}
                    href={contact.link}
                    className="flex items-center p-4 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-500 hover:bg-neutral-800 transition-all group no-underline"
                  >
                    <div className={`${contact.color} p-3 rounded-xl text-white shadow-lg shadow-black/20 mr-4 group-hover:scale-110 transition-transform`}>
                      {contact.icon}
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-white">{contact.name}</h4>
                      <p className="text-[10px] sm:text-xs text-neutral-400">{contact.description}</p>
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
                  {number}
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ContactModal
