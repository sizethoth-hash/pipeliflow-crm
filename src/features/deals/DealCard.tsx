'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useDealsStore } from '@/store/useDealsStore'
import type { Deal } from '@/types/deal'

interface DealCardProps {
  deal: Deal
  onEdit: (deal: Deal) => void
  onView: (deal: Deal) => void
  stageId?: string
  isOverlay?: boolean
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

function getDueDateStatus(dueDate?: string): 'overdue' | 'urgent' | 'ok' | null {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
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

  // Deterministic color from name
  const colors = [
    'bg-indigo-600',
    'bg-violet-600',
    'bg-sky-600',
    'bg-teal-600',
    'bg-emerald-600',
    'bg-rose-600',
  ]
  const idx = name.charCodeAt(0) % colors.length

  return (
    <span
      className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full ${colors[idx]} text-[9px] font-bold tracking-wide text-white ring-1 ring-black/20`}
      title={name}
    >
      {initials}
    </span>
  )
}

export function DealCard({ deal, onEdit, onView, stageId, isOverlay = false }: DealCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const deleteDeal = useDealsStore((s) => s.deleteDeal)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { deal, stageId },
    disabled: isOverlay,
  })

  const dueDateStatus = getDueDateStatus(deal.dueDate)

  const isWon = stageId === 'won'
  const isLost = stageId === 'lost'

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={[
          'group relative select-none rounded-lg border transition-all duration-150',
          // Base
          'bg-slate-800/90 backdrop-blur-sm',
          // Border variants
          isWon
            ? 'border-l-2 border-l-emerald-500 border-r-slate-700/50 border-t-slate-700/50 border-b-slate-700/50'
            : isLost
              ? 'border-l-2 border-l-red-500/60 border-r-slate-700/30 border-t-slate-700/30 border-b-slate-700/30'
              : 'border-slate-700/50',
          // Hover
          !isDragging && !isOverlay
            ? 'hover:border-indigo-500/30 hover:bg-slate-800 hover:shadow-lg hover:shadow-black/25 cursor-grab active:cursor-grabbing'
            : '',
          // Drag states
          isDragging ? 'opacity-40 scale-[0.97] shadow-none' : 'opacity-100',
          isLost ? 'opacity-70' : '',
          isOverlay
            ? 'rotate-[1.5deg] shadow-2xl shadow-black/40 ring-1 ring-indigo-500/40 cursor-grabbing'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        {...(isOverlay ? {} : { ...attributes, ...listeners })}
      >
        <div className="p-3">
          {/* Title row */}
          <div className="mb-1.5 flex items-start gap-2">
            <button
              type="button"
              className="flex-1 text-left text-[13px] font-semibold leading-snug text-slate-100 transition-colors hover:text-indigo-300 focus:outline-none"
              onClick={() => onView(deal)}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {deal.title}
            </button>

            {!isOverlay && (
              <div onPointerDown={(e) => e.stopPropagation()} className="shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-slate-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-slate-700 hover:text-slate-300"
                      aria-label="Ações do negócio"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-36 border-slate-700 bg-slate-800 text-slate-200"
                  >
                    <DropdownMenuItem
                      className="cursor-pointer text-xs focus:bg-slate-700"
                      onClick={() => onEdit(deal)}
                    >
                      <Pencil className="mr-2 h-3 w-3" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-xs text-red-400 focus:bg-slate-700 focus:text-red-400"
                      onClick={() => setConfirmOpen(true)}
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Lead company */}
          <p className="mb-3 text-[11px] leading-none text-slate-500">{deal.leadName}</p>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-[13px] font-bold tabular-nums ${isLost ? 'text-slate-500 line-through' : 'text-emerald-400'}`}
            >
              {formatCurrency(deal.value)}
            </span>

            <div className="flex items-center gap-1.5">
              {deal.dueDate && (
                <span
                  className={[
                    'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold',
                    dueDateStatus === 'overdue'
                      ? 'bg-red-500/15 text-red-400'
                      : dueDateStatus === 'urgent'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-slate-700/80 text-slate-400',
                  ].join(' ')}
                >
                  <Calendar className="h-2.5 w-2.5" />
                  {formatDate(deal.dueDate)}
                </span>
              )}
              <OwnerAvatar name={deal.ownerName} />
            </div>
          </div>
        </div>

        {/* Subtle gradient shine on hover */}
        <div
          className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.03) 0%, transparent 60%)',
          }}
        />
      </div>

      {!isOverlay && (
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => deleteDeal(deal.id)}
          title="Excluir negócio"
          description={`Tem certeza que deseja excluir "${deal.title}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
        />
      )}
    </>
  )
}
