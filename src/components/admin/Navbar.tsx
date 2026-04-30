"use client"

import { useState } from 'react'
import { Menu, Search, Bell, User, ChevronDown, Sun, Moon } from 'lucide-react'

interface NavbarProps {
  onMobileMenuToggle: () => void
  title: string
}

export default function Navbar({ onMobileMenuToggle, title }: NavbarProps) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-white">{title}</h1>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="hidden md:block flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, users, or settings..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full">
                <User className="w-3 h-3 text-white" />
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-50">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                >
                  Profile
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                >
                  Settings
                </a>
                <hr className="my-1 border-slate-700" />
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                >
                  Sign Out
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile title */}
      <div className="md:hidden px-4 pb-3">
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>
    </header>
  )
}
