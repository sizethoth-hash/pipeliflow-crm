'use client'

import { Calendar, DollarSign, Pencil, Tag, User, X } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import type { Deal } from '@/types/deal'
import { PIPELINE_COLUMNS } from '@/types/deal'

interface DealDetailDrawerProps {
  deal: Deal | null
  open: boolean
  onClose: () => void
  onEdit: (deal: Deal) => void
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function getDueDateStatus(dueDate?: string): 'overdue' | 'urgent' | 'ok' | null {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${dueDate}T00:00:00`)
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 3) return 'urgent'
  return 'ok'
}

function OwnerAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
  const colors = ['bg-indigo-600', 'bg-violet-600', 'bg-sky-600', 'bg-teal-600', 'bg-emerald-600']
  const idx = name.charCodeAt(0) % colors.length
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors[idx]} text-[12px] font-bold text-white ring-2 ring-slate-900`}
    >
      {initials}
    </span>
  )
}

export function DealDetailDrawer({ deal, open, onClose, onEdit }: DealDetailDrawerProps) {
  const column = deal ? PIPELINE_COLUMNS.find((c) => c.id === deal.stage) : null
  const dueDateStatus = deal ? getDueDateStatus(deal.dueDate) : null
  const isWon = deal?.stage === 'won'
  const isLost = deal?.stage === 'lost'

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Detalhes do negócio"
        className={[
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-[360px] flex-col border-l border-slate-800 bg-slate-950 shadow-2xl transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {deal && (
          <>
            {/* Accent line */}
            <div
              className="h-[3px] w-full shrink-0"
              style={{ backgroundColor: column?.accentColor ?? '#6366f1' }}
            />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{
                      backgroundColor: `${column?.accentColor ?? '#6366f1'}22`,
                      color: column?.accentColor ?? '#6366f1',
                    }}
                  >
                    {column?.label ?? deal.stage}
                  </span>
                </div>
                <h2 className="line-clamp-2 text-[15px] font-bold leading-snug text-slate-100">
                  {deal.title}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">{deal.leadName}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-md p-1.5 text-slate-600 transition-colors hover:bg-slate-800 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Value block */}
              <div className="border-b border-slate-800/60 px-5 py-5">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  Valor do negócio
                </p>
                <p
                  className={`text-3xl font-bold tabular-nums tracking-tight ${
                    isLost
                      ? 'text-slate-600 line-through'
                      : isWon
                        ? 'text-emerald-400'
                        : 'text-emerald-400'
                  }`}
                >
                  {formatCurrency(deal.value)}
                </p>
              </div>

              {/* Details */}
              <div className="divide-y divide-slate-800/60 px-5">
                {/* Responsável */}
                <div className="flex items-center gap-3 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                        Responsável
                      </p>
                      <p className="mt-0.5 text-[13px] font-medium text-slate-300">
                        {deal.ownerName}
                      </p>
                    </div>
                    <OwnerAvatar name={deal.ownerName} />
                  </div>
                </div>

                {/* Prazo */}
                {deal.dueDate && (
                  <div className="flex items-center gap-3 py-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                        Prazo
                      </p>
                      <p
                        className={`mt-0.5 text-[13px] font-semibold ${
                          dueDateStatus === 'overdue'
                            ? 'text-red-400'
                            : dueDateStatus === 'urgent'
                              ? 'text-amber-400'
                              : 'text-slate-300'
                        }`}
                      >
                        {formatDate(deal.dueDate)}
                        {dueDateStatus === 'overdue' && (
                          <span className="ml-2 text-[10px] font-bold uppercase text-red-400/70">
                            Atrasado
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Lead */}
                <div className="flex items-center gap-3 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                    <Tag className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      Lead vinculado
                    </p>
                    <p className="mt-0.5 text-[13px] font-medium text-slate-300">{deal.leadName}</p>
                  </div>
                </div>

                {/* Datas */}
                <div className="flex items-center gap-3 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                    <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      Criado em
                    </p>
                    <p className="mt-0.5 text-[13px] font-medium text-slate-300">
                      {formatDate(deal.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800/80 p-4">
              <Button
                className="w-full bg-indigo-600 text-white hover:bg-indigo-500"
                onClick={() => {
                  onClose()
                  onEdit(deal)
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar negócio
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
