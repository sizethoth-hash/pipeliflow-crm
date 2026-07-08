'use client'

import { Users } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Lead, LeadStatus } from '@/types/lead'

interface RecentLeadsProps {
  leads: Lead[]
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'Novo', className: 'bg-blue-500/15 text-blue-400' },
  contacted: { label: 'Contato', className: 'bg-green-500/15 text-green-400' },
  proposal: { label: 'Proposta', className: 'bg-amber-500/15 text-amber-400' },
  negotiation: { label: 'Negociação', className: 'bg-orange-500/15 text-orange-400' },
  won: { label: 'Ganho', className: 'bg-emerald-500/15 text-emerald-400' },
  lost: { label: 'Perdido', className: 'bg-red-500/15 text-red-400' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(iso))
}

export function RecentLeads({ leads }: RecentLeadsProps) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-200">Leads Recentes</h3>
        </div>
        <Link
          href="/leads"
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          aria-label="Ver todos os leads"
        >
          Ver todos
        </Link>
      </div>

      {leads.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-500">Nenhum lead cadastrado</p>
      ) : (
        <ul className="space-y-1" aria-label="Leads recentes">
          {leads.map((lead) => {
            const status = STATUS_CONFIG[lead.status]
            return (
              <li key={lead.id}>
                <Link
                  href={`/leads/${lead.id}`}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                    'hover:bg-slate-700/40'
                  )}
                  aria-label={`Ver detalhes de ${lead.name}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/30 text-xs font-bold text-indigo-300">
                    {getInitials(lead.name)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{lead.name}</p>
                    <p className="truncate text-xs text-slate-500">{lead.company ?? lead.email}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        status.className
                      )}
                    >
                      {status.label}
                    </span>
                    <span className="text-xs text-slate-600">{formatDate(lead.createdAt)}</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
