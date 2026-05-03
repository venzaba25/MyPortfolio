"use client"

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, ArrowLeft, LogOut, Loader2, ShieldCheck,
  Bot, Mail, Database, Wifi, WifiOff, RefreshCw, CheckCircle2, XCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

export default function AdminSettings() {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [chatbotVisible, setChatbotVisible] = useState(true)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsError, setSettingsError] = useState('')
  const [dbConnected, setDbConnected] = useState<boolean | null>(null)
  const [dbChecking, setDbChecking] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' as 'success' | 'error' | '' })

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session ?? null)
      setAuthChecking(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) return
    fetch('/api/settings')
      .then(async r => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`)
        return r.json()
      })
      .then(d => {
        setChatbotVisible(d.chatbot_visible !== false)
        setSettingsError('')
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setSettingsError(`Could not load settings from API server. (${msg})`)
      })
    checkDb()
  }, [session])

  const checkDb = async () => {
    setDbChecking(true)
    try {
      const r = await fetch('/api/health')
      const d = await r.json()
      setDbConnected(!!d.supabase)
    } catch {
      setDbConnected(false)
    } finally {
      setDbChecking(false)
    }
  }

  const toggleChatbot = async (value: boolean) => {
    if (!session) return
    const prev = chatbotVisible
    setChatbotVisible(value)
    setSettingsLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ chatbot_visible: value }),
      })
      if (res.ok) {
        showMessage(`Support bot ${value ? 'enabled' : 'disabled'} on the public site.`)
      } else {
        const err = await res.json().catch(() => ({}))
        setChatbotVisible(prev)
        showMessage(err.error || 'Failed to update setting.', 'error')
      }
    } catch {
      setChatbotVisible(prev)
      showMessage('Network error — could not reach API server.', 'error')
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin')
  }

  if (authChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030014] text-neutral-300">
        <Loader2 className="h-6 w-6 animate-spin mr-3" />
        <span className="text-sm">Checking session…</span>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030014] text-neutral-300 p-6">
        <div className="text-center max-w-md">
          <ShieldCheck className="h-10 w-10 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Admin sign-in required</h2>
          <p className="text-sm text-neutral-500 mb-6">You need to be logged in to access settings.</p>
          <Link to="/admin" className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold transition-all">
            <ArrowLeft size={16} /> Go to admin login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#060d1f] text-white font-sans">
      {/* Top bar */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06] bg-[#0a0f1e]">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Settings size={16} className="text-slate-400" />
            Settings
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm border border-white/[0.06]"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Status message */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={`p-4 rounded-xl text-center font-medium border ${
                message.type === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-green-500/10 border-green-500/30 text-green-400'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <h1 className="text-2xl font-bold text-white">Site Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage portfolio site configuration and integrations.</p>
        </div>

        {settingsError && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm flex items-center gap-2">
            <XCircle size={16} />
            {settingsError}
          </div>
        )}

        {/* Bot Settings */}
        <section className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-2">
            <Bot size={16} className="text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Support Bot</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white mb-1">AI Chat Widget</p>
                <p className="text-xs text-slate-500">
                  Show or hide the floating AI assistant on the public portfolio site.
                  Changes take effect on next page load.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs font-semibold tabular-nums ${chatbotVisible ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {chatbotVisible ? 'Visible' : 'Hidden'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={chatbotVisible}
                  disabled={settingsLoading}
                  onClick={() => toggleChatbot(!chatbotVisible)}
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '52px',
                    height: '28px',
                    borderRadius: '14px',
                    background: chatbotVisible ? '#06b6d4' : '#3f3f46',
                    transition: 'background 0.25s',
                    cursor: settingsLoading ? 'not-allowed' : 'pointer',
                    border: 'none',
                    flexShrink: 0,
                    opacity: settingsLoading ? 0.6 : 1,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: chatbotVisible ? '25px' : '4px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'white',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                      transition: 'left 0.25s',
                    }}
                  />
                </button>
                {settingsLoading && <Loader2 size={14} className="animate-spin text-slate-500" />}
              </div>
            </div>
          </div>
        </section>

        {/* Email Settings */}
        <section className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-2">
            <Mail size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Email (SMTP)</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 px-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
              <div>
                <p className="text-sm font-medium text-white">Gmail Account</p>
                <p className="text-xs text-slate-500 mt-0.5">Used to send contact form notifications and auto-replies</p>
              </div>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={13} /> Configured
              </span>
            </div>
            <p className="text-xs text-slate-600 px-1">
              To change email credentials, update the <code className="bg-white/5 px-1.5 py-0.5 rounded text-slate-400">GMAIL_USER</code> and{' '}
              <code className="bg-white/5 px-1.5 py-0.5 rounded text-slate-400">GMAIL_APP_PASSWORD</code> secrets in your Replit environment.
            </p>
          </div>
        </section>

        {/* Database Status */}
        <section className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Database (Supabase)</h2>
            </div>
            <button
              onClick={checkDb}
              disabled={dbChecking}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors"
            >
              <RefreshCw size={12} className={dbChecking ? 'animate-spin' : ''} />
              Re-check
            </button>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between py-3 px-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
              <div>
                <p className="text-sm font-medium text-white">Supabase Connection</p>
                <p className="text-xs text-slate-500 mt-0.5">Projects, inquiries, and image storage</p>
              </div>
              {dbChecking ? (
                <Loader2 size={14} className="animate-spin text-slate-500" />
              ) : dbConnected === null ? (
                <span className="text-xs text-slate-500">Checking…</span>
              ) : dbConnected ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Wifi size={13} /> Connected
                </span>
              ) : (
                <span className="text-xs text-red-400 font-semibold flex items-center gap-1.5">
                  <WifiOff size={13} /> Offline
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 px-1">
              Connection uses <code className="bg-white/5 px-1.5 py-0.5 rounded text-slate-400">VITE_SUPABASE_URL</code> and{' '}
              <code className="bg-white/5 px-1.5 py-0.5 rounded text-slate-400">SUPABASE_SERVICE_ROLE_KEY</code>.
            </p>
          </div>
        </section>

        {/* Account */}
        <section className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-2">
            <ShieldCheck size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Admin Account</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between py-3 px-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
              <div>
                <p className="text-sm font-medium text-white">Signed in as</p>
                <p className="text-xs text-blue-400 mt-0.5">{session.user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20 transition-all"
              >
                <LogOut size={12} /> Sign Out
              </button>
            </div>
            <p className="text-xs text-slate-600 px-1">
              To change your password, use the Supabase Authentication dashboard.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
