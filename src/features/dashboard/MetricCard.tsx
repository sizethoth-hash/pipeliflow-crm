'use client'

import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string
  icon: LucideIcon
  iconColor?: string
  trend?: number
  trendLabel?: string
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-indigo-400',
  trend,
  trendLabel,
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend >= 0

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <span className={cn('rounded-lg bg-slate-700/60 p-2', iconColor)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-100">{value}</p>

      {trend !== undefined && (
        <div className="mt-2 flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
          )}
          <span
            className={cn('text-xs font-medium', isPositive ? 'text-emerald-400' : 'text-red-400')}
          >
            {isPositive ? '+' : ''}
            {trend.toFixed(1)}%
          </span>
          {trendLabel && <span className="text-xs text-slate-500">{trendLabel}</span>}
        </div>
      )}
    </div>
  )
}
