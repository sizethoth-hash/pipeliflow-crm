'use client'

import { CalendarClock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Deal } from '@/types/deal'

interface UpcomingDealsProps {
  deals: Deal[]
}

function getDaysRemaining(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function DueBadge({ days }: { days: number }) {
  if (days < 0) {
    return (
      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400">
        {Math.abs(days)}d atraso
      </span>
    )
  }
  if (days === 0) {
    return (
      <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-medium text-orange-400">
        Hoje
      </span>
    )
  }
  if (days <= 3) {
    return (
      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
        {days}d
      </span>
    )
  }
  if (days <= 7) {
    return (
      <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-400">
        {days}d
      </span>
    )
  }
  return (
    <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-xs font-medium text-slate-400">
      {days}d
    </span>
  )
}

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

export function UpcomingDeals({ deals }: UpcomingDealsProps) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-indigo-400" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-200">Negócios com Prazo Próximo</h3>
      </div>

      {deals.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-500">Nenhum negócio com prazo definido</p>
      ) : (
        <ul className="space-y-1" aria-label="Negócios com prazo próximo">
          {deals.map((deal) => {
            const days = getDaysRemaining(deal.dueDate!)
            return (
              <li
                key={deal.id}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors',
                  'hover:bg-slate-700/40'
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">{deal.title}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {deal.leadName} · {deal.ownerName}
                  </p>
                </div>
                <div className="ml-3 flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-slate-300">
                    {BRL.format(deal.value)}
                  </span>
                  <DueBadge days={days} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
