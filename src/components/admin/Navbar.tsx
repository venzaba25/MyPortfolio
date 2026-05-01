"use client"

import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, User, ExternalLink } from 'lucide-react'

interface NavbarProps {
  onMobileMenuToggle: () => void
  title: string
  userEmail?: string
  onLogout?: () => void
  unreadCount?: number
}

export default function Navbar({ onMobileMenuToggle, title, userEmail, onLogout, unreadCount = 0 }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isBellOpen, setIsBellOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'AD'
  const displayName = userEmail ? userEmail.split('@')[0] : 'Admin'

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center bg-[#0a0f1e]/80 backdrop-blur-md border-b border-white/[0.06] px-4 lg:px-6 gap-4">

      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-base font-semibold text-white">{title}</h1>
        <p className="text-[11px] text-slate-500 hidden sm:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5">

        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setIsBellOpen(!isBellOpen)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white border border-[#0a0f1e] leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isBellOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#111827] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/60 py-2 z-50 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/[0.06]">
                <p className="text-sm font-semibold text-white">Notifications</p>
              </div>
              {unreadCount > 0 ? (
                <Link
                  to="/admin/inquiries"
                  onClick={() => setIsBellOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <span className="mt-0.5 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">
                      {unreadCount} unread {unreadCount === 1 ? 'inquiry' : 'inquiries'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">View your inbox</p>
                  </div>
                </Link>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-slate-500">
                  All caught up!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-[11px] font-bold text-white">{initials}</span>
            </div>
            <span className="text-sm font-medium text-white hidden sm:block max-w-[100px] truncate">
              {displayName}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#111827] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/60 py-1.5 z-50 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-white/[0.06] mb-1">
                <p className="text-xs font-semibold text-white truncate">{userEmail ?? 'Admin'}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Administrator</p>
              </div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <ExternalLink className="w-4 h-4 text-slate-500" />
                View portfolio
              </a>
              <button
                onClick={() => { setIsProfileOpen(false); onLogout?.() }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mt-1 border-t border-white/[0.06]"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
