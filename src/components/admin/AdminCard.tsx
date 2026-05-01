"use client"

import { type ReactNode } from 'react'

interface AdminCardProps {
  children: ReactNode
  title?: string
  description?: string
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
  action?: ReactNode
}

export default function AdminCard({
  children,
  title,
  description,
  className = '',
  padding = 'md',
  hover = false,
  action,
}: AdminCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div
      className={`bg-[#0d1424] border border-white/[0.07] rounded-2xl ${
        hover ? 'hover:border-white/[0.13] hover:shadow-lg hover:shadow-black/30 transition-all duration-200' : ''
      } ${className}`}
    >
      {(title || description || action) && (
        <div className={`${paddingClasses[padding]} pb-4 flex items-start justify-between gap-4 border-b border-white/[0.05]`}>
          <div className="min-w-0">
            {title && (
              <h3 className="text-base font-semibold text-white">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">{action}</div>
          )}
        </div>
      )}
      <div className={`${paddingClasses[padding]} ${title || description || action ? 'pt-5' : ''}`}>
        {children}
      </div>
    </div>
  )
}
