"use client"

import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon: LucideIcon
  description?: string
  accent?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose'
}

const accentMap = {
  blue:    { bg: 'bg-blue-500/10',   icon: 'text-blue-400',   ring: 'from-blue-600 to-blue-500',    glow: 'shadow-blue-500/20'  },
  indigo:  { bg: 'bg-indigo-500/10', icon: 'text-indigo-400', ring: 'from-indigo-600 to-indigo-500', glow: 'shadow-indigo-500/20' },
  emerald: { bg: 'bg-emerald-500/10',icon: 'text-emerald-400',ring: 'from-emerald-600 to-emerald-500',glow: 'shadow-emerald-500/20' },
  amber:   { bg: 'bg-amber-500/10',  icon: 'text-amber-400',  ring: 'from-amber-600 to-amber-500',   glow: 'shadow-amber-500/20'  },
  rose:    { bg: 'bg-rose-500/10',   icon: 'text-rose-400',   ring: 'from-rose-600 to-rose-500',     glow: 'shadow-rose-500/20'   },
}

const changeStyle = {
  increase: { color: 'text-emerald-400 bg-emerald-500/10', icon: TrendingUp },
  decrease: { color: 'text-red-400 bg-red-500/10',         icon: TrendingDown },
  neutral:  { color: 'text-slate-400 bg-white/5',          icon: Minus },
}

export default function StatsCard({ title, value, change, icon: Icon, description, accent = 'blue' }: StatsCardProps) {
  const a = accentMap[accent]
  const c = change ? changeStyle[change.type] : null
  const ChangeIcon = c?.icon

  return (
    <div className="group relative bg-[#0d1424] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.14] hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight leading-none mb-3">{value}</p>

          {change && c && ChangeIcon && (
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${c.color}`}>
              <ChangeIcon className="w-3 h-3" />
              {change.value}
            </span>
          )}
          {description && (
            <p className="text-xs text-slate-500 mt-2">{description}</p>
          )}
        </div>

        <div className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl ${a.bg} border border-white/[0.06] shadow-lg ${a.glow}`}>
          <Icon className={`w-5 h-5 ${a.icon}`} />
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r ${a.ring} group-hover:w-full transition-all duration-500`} />
    </div>
  )
}
