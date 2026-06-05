'use client'

import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { TrendingUp } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { DealCard } from '@/features/deals/DealCard'
import { DealDetailDrawer } from '@/features/deals/DealDetailDrawer'
import { DealFormModal } from '@/features/deals/DealFormModal'
import { KanbanColumn } from '@/features/deals/KanbanColumn'
import { useDealsStore } from '@/store/useDealsStore'
import type { Deal, DealStage } from '@/types/deal'
import { PIPELINE_COLUMNS } from '@/types/deal'

export default function PipelinePage() {
  const { deals, moveDeal } = useDealsStore()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<DealStage | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [defaultStage, setDefaultStage] = useState<DealStage>('new_lead')

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [viewingDeal, setViewingDeal] = useState<Deal | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const activeDeal = activeId ? (deals.find((d) => d.id === activeId) ?? null) : null
  const activeDealStage = activeDeal?.stage

  // Summary metrics
  const openDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
  const totalPipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0)
  const wonDeals = deals.filter((d) => d.stage === 'won')

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragOver(event: DragOverEvent) {
    const newOverId = event.over?.id as DealStage | undefined
    setOverId(newOverId ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)

    if (!over) return

    const dealId = String(active.id)
    const targetStage = String(over.id) as DealStage

    const validStages = PIPELINE_COLUMNS.map((c) => c.id)
    if (!validStages.includes(targetStage)) return

    const deal = deals.find((d) => d.id === dealId)
    if (deal && deal.stage !== targetStage) {
      moveDeal(dealId, targetStage)
    }
  }

  function openNewDeal(stage: DealStage) {
    setEditingDeal(null)
    setDefaultStage(stage)
    setFormOpen(true)
  }

  function openEditDeal(deal: Deal) {
    setEditingDeal(deal)
    setDefaultStage(deal.stage)
    setFormOpen(true)
  }

  function openViewDeal(deal: Deal) {
    setViewingDeal(deal)
    setDrawerOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingDeal(null)
  }

  const formatK = (v: number) =>
    v >= 1_000_000
      ? `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')}M`
      : v >= 1_000
        ? `R$ ${(v / 1_000).toFixed(0)}k`
        : new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0,
          }).format(v)

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Page header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800/80 px-6 py-3.5 lg:px-8">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-[17px] font-bold tracking-tight text-slate-100">Pipeline</h2>
            <p className="text-[11px] text-slate-500">
              {deals.length} negócio{deals.length !== 1 ? 's' : ''} no funil
            </p>
          </div>

          {/* Quick stats */}
          <div className="hidden items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1 lg:flex">
            <div className="px-3 py-1.5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                Pipeline aberto
              </p>
              <p className="text-[13px] font-bold text-emerald-400 tabular-nums">
                {formatK(totalPipelineValue)}
              </p>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="px-3 py-1.5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                Em andamento
              </p>
              <p className="text-[13px] font-bold text-slate-200 tabular-nums">
                {openDeals.length}
              </p>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="px-3 py-1.5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                Ganhos
              </p>
              <p className="text-[13px] font-bold text-emerald-500 tabular-nums">
                {wonDeals.length}
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => openNewDeal('new_lead')}
          size="sm"
          className="gap-1.5 bg-indigo-600 text-white hover:bg-indigo-500"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Novo Negócio
        </Button>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full gap-3 px-6 py-5 lg:px-8">
            {PIPELINE_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                deals={deals.filter((d) => d.stage === column.id)}
                isOver={overId === column.id}
                onAddDeal={openNewDeal}
                onEditDeal={openEditDeal}
                onViewDeal={openViewDeal}
              />
            ))}
          </div>

          <DragOverlay
            dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}
          >
            {activeDeal && (
              <DealCard
                deal={activeDeal}
                stageId={activeDealStage}
                onEdit={() => {}}
                onView={() => {}}
                isOverlay
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals & Drawer */}
      <DealFormModal
        open={formOpen}
        onClose={closeForm}
        deal={editingDeal}
        defaultStage={defaultStage}
      />

      <DealDetailDrawer
        deal={viewingDeal}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEdit={openEditDeal}
      />
    </div>
  )
}
