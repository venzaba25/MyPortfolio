"use client"

import { type ReactNode } from 'react'

interface Column<T> {
  key: keyof T
  title: string
  render?: (value: any, item: T) => ReactNode
  className?: string
}

interface AdminTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  className?: string
}

export default function AdminTable<T>({ data, columns, loading, className = '' }: AdminTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-400 mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-slate-400">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-xl overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider ${
                    column.className || ''
                  }`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-slate-700/50 transition-colors">
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`px-6 py-4 text-sm text-white ${
                      column.className || ''
                    }`}
                  >
                    {column.render
                      ? column.render(item[column.key], item)
                      : String(item[column.key] || '')
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
