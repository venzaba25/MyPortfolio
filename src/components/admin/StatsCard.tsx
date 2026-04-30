"use client"

import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon: LucideIcon
  description?: string
}

export default function StatsCard({ title, value, change, icon: Icon, description }: StatsCardProps) {
  const changeColors = {
    increase: 'text-green-400',
    decrease: 'text-red-400',
    neutral: 'text-slate-400'
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${changeColors[change.type]}`}>
              {change.value}
            </p>
          )}
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-blue-600/10 rounded-lg">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
      </div>
    </div>
  )
}
