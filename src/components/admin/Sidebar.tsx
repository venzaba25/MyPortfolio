"use client"

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderOpen,
  Inbox,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Zap,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile: boolean
  onCloseMobile: () => void
  userEmail?: string
  onLogout?: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Projects', href: '/admin', icon: FolderOpen, exact: true },
  { name: 'Inquiries', href: '/admin/inquiries', icon: Inbox, exact: false },
  { name: 'Settings', href: '/admin/settings', icon: Settings, exact: false },
]

function NavItem({ item, isCollapsed, isActive, onClick }: {
  item: typeof navigation[0]
  isCollapsed: boolean
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Link
      to={item.href}
      onClick={onClick}
      title={isCollapsed ? item.name : undefined}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {isActive && (
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 opacity-100" />
      )}
      <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
      {!isCollapsed && (
        <span className="relative z-10 truncate">{item.name}</span>
      )}
      {isCollapsed && (
        <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl border border-slate-700 z-50">
          {item.name}
        </span>
      )}
    </Link>
  )
}

export default function Sidebar({ isOpen, onToggle, isMobile, onCloseMobile, userEmail, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  const handleNavClick = () => {
    if (isMobile) onCloseMobile()
  }

  const initials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : 'AD'

  const sidebarContent = (
    <div className={`flex flex-col h-full bg-[#0a0f1e] border-r border-white/[0.06] transition-all duration-300 ${
      isCollapsed ? 'w-[70px]' : 'w-64'
    }`}>

      {/* Brand */}
      <div className={`flex items-center h-16 border-b border-white/[0.06] px-4 gap-3 flex-shrink-0 ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed && (
          <>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-600/40 flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white tracking-wide">Venz Admin</p>
              <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Control Panel</p>
            </div>
          </>
        )}
        {isCollapsed && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-600/40">
            <Zap className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3 mt-1">
            Main Menu
          </p>
        )}
        {navigation.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.href
            : location.pathname.startsWith(item.href)
          return (
            <NavItem
              key={item.name}
              item={item}
              isCollapsed={isCollapsed}
              isActive={isActive}
              onClick={handleNavClick}
            />
          )
        })}

        {!isCollapsed && (
          <div className="pt-4 mt-4 border-t border-white/[0.04]">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">
              Quick Links
            </p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
            >
              <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-white" />
              <span>View Site</span>
            </a>
          </div>
        )}
      </nav>

      {/* Collapse toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User footer */}
      <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600/40 to-indigo-600/40 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-blue-300">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userEmail ? userEmail.split('@')[0] : 'Admin'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {userEmail ?? 'Administrator'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={onCloseMobile}
          />
        )}
        <div
          className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </>
    )
  }

  return (
    <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${
      isCollapsed ? 'w-[70px]' : 'w-64'
    }`}>
      {sidebarContent}
    </div>
  )
}
