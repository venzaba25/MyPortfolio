"use client"

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  BarChart3,
  Settings,
  Inbox,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile: boolean
  onCloseMobile: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Projects', href: '/admin', icon: FolderOpen },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Inquiries', href: '/admin/inquiries', icon: Inbox },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function Sidebar({ isOpen, onToggle, isMobile, onCloseMobile }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  const handleNavClick = () => {
    if (isMobile) {
      onCloseMobile()
    }
  }

  const sidebarContent = (
    <div className={`flex flex-col h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo/Brand */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Admin</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center justify-center w-8 h-8 bg-slate-700 rounded-full">
            <span className="text-sm font-medium text-white">A</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-slate-400 truncate">admin@example.com</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button className="flex items-center gap-2 w-full mt-3 px-3 py-2 text-sm text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  )

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onCloseMobile}
          />
        )}
        <div
          className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 lg:hidden ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </>
    )
  }

  // Desktop sidebar
  return (
    <div className={`hidden lg:block transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {sidebarContent}
    </div>
  )
}
