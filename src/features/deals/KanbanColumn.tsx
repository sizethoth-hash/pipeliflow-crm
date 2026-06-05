'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'

import { DealCard } from '@/features/deals/DealCard'
import type { Deal, DealStage, PipelineColumn } from '@/types/deal'

interface KanbanColumnProps {
  column: PipelineColumn
  deals: Deal[]
  isOver: boolean
  onAddDeal: (stage: DealStage) => void
  onEditDeal: (deal: Deal) => void
  onViewDeal: (deal: Deal) => void
}

function formatCurrencyCompact(value: number) {
  if (value === 0) return '—'
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

export function KanbanColumn({
  column,
  deals,
  isOver,
  onAddDeal,
  onEditDeal,
  onViewDeal,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id })
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0)
  const dealIds = deals.map((d) => d.id)

  const isWon = column.id === 'won'
  const isLost = column.id === 'lost'

  return (
    <div className="flex w-[272px] shrink-0 flex-col">
      {/* Accent top bar */}
      <div
        className="h-[3px] w-full rounded-t-xl"
        style={{ backgroundColor: column.accentColor }}
        aria-hidden="true"
      />

      {/* Column container */}
      <div
        className={[
          'flex flex-1 flex-col rounded-b-xl border border-t-0 transition-colors duration-150',
          isOver ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-slate-800 bg-slate-900/80',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 pb-2.5 pt-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: isOver ? '#a5b4fc' : column.accentColor }}
              >
                {column.label}
              </span>
              <span
                className="inline-flex h-4 min-w-[16px] items-center justify-center rounded px-1 text-[10px] font-bold"
                style={{
                  backgroundColor: `${column.accentColor}22`,
                  color: column.accentColor,
                }}
              >
                {deals.length}
              </span>
            </div>
            <p
              className={`mt-0.5 text-[11px] font-semibold tabular-nums ${isLost ? 'text-slate-600' : isWon ? 'text-emerald-500' : 'text-slate-400'}`}
            >
              {formatCurrencyCompact(totalValue)}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-3 mb-2.5 h-px bg-slate-800" />

        {/* Drop area */}
        <div
          ref={setNodeRef}
          className={[
            'mx-1.5 mb-1.5 flex flex-1 flex-col gap-1.5 overflow-y-auto rounded-lg px-1 py-1 transition-colors duration-150',
            isOver ? 'ring-1 ring-inset ring-indigo-500/20' : '',
          ].join(' ')}
          style={{ maxHeight: 'calc(100vh - 260px)', minHeight: '48px' }}
        >
          <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                stageId={column.id}
                onEdit={onEditDeal}
                onView={onViewDeal}
              />
            ))}
          </SortableContext>

          {/* Empty state */}
          {deals.length === 0 && !isOver && (
            <div className="flex flex-1 flex-col items-center justify-center py-6">
              <div
                className="mb-2 h-8 w-8 rounded-lg opacity-20"
                style={{ backgroundColor: column.accentColor }}
              />
              <p className="text-[11px] text-slate-600">Nenhum negócio</p>
            </div>
          )}

          {/* Drop placeholder when dragging over empty */}
          {deals.length === 0 && isOver && (
            <div className="flex h-16 items-center justify-center rounded-lg border-2 border-dashed border-indigo-500/30">
              <p className="text-[11px] font-medium text-indigo-400">Soltar aqui</p>
            </div>
          )}
        </div>

        {/* Add deal button */}
        <button
          type="button"
          onClick={() => onAddDeal(column.id)}
          className="mx-1.5 mb-1.5 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-medium text-slate-600 transition-all hover:bg-slate-800 hover:text-slate-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
          aria-label={`Adicionar negócio em ${column.label}`}
        >
          <Plus className="h-3 w-3" />
          Adicionar negócio
        </button>
      </div>
    </div>
  )
}
