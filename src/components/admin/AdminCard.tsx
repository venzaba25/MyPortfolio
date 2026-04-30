"use client"

import { ReactNode } from 'react'

interface AdminCardProps {
  children: ReactNode
  title?: string
  description?: string
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export default function AdminCard({ 
  children, 
  title, 
  description, 
  className = '', 
  padding = 'md',
  hover = true 
}: AdminCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div
      className={`bg-slate-800 border border-slate-700 rounded-xl ${
        hover ? 'hover:border-slate-600 hover:shadow-lg transition-all duration-200' : ''
      } ${className}`}
    >
      {(title || description) && (
        <div className={`${paddingClasses[padding]} pb-0`}>
          {title && (
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-slate-400">{description}</p>
          )}
        </div>
      )}
      <div className={`${paddingClasses[padding]} ${title || description ? 'pt-4' : ''}`}>
        {children}
      </div>
    </div>
  )
}
