'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { mockLeads, mockOwners } from '@/mocks/leads'
import { useDealsStore } from '@/store/useDealsStore'
import type { Deal, DealStage } from '@/types/deal'
import { PIPELINE_COLUMNS } from '@/types/deal'

const inputCls =
  'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500'
const selectCls = 'border-slate-600 bg-slate-700 text-slate-100 focus:ring-indigo-500'

const dealSchema = z.object({
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  value: z
    .number({ invalid_type_error: 'Informe um valor válido' })
    .min(0, 'Valor deve ser positivo'),
  leadId: z.string().min(1, 'Selecione um lead'),
  ownerId: z.string().min(1, 'Selecione um responsável'),
  stage: z.enum(['new_lead', 'contacted', 'proposal', 'negotiation', 'won', 'lost']),
  dueDate: z.string().optional(),
})

type DealFormData = z.infer<typeof dealSchema>

interface DealFormModalProps {
  open: boolean
  onClose: () => void
  deal?: Deal | null
  defaultStage?: DealStage
}

export function DealFormModal({
  open,
  onClose,
  deal,
  defaultStage = 'new_lead',
}: DealFormModalProps) {
  const { addDeal, updateDeal } = useDealsStore()
  const isEditing = Boolean(deal)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      stage: defaultStage,
      ownerId: 'user-1',
      value: 0,
    },
  })

  useEffect(() => {
    if (open) {
      if (deal) {
        reset({
          title: deal.title,
          value: deal.value,
          leadId: deal.leadId,
          ownerId: deal.ownerId,
          stage: deal.stage,
          dueDate: deal.dueDate ?? '',
        })
      } else {
        reset({ stage: defaultStage, ownerId: 'user-1', value: 0 })
      }
    }
  }, [open, deal, defaultStage, reset])

  function onSubmit(data: DealFormData) {
    const lead = mockLeads.find((l) => l.id === data.leadId)
    const owner = mockOwners.find((o) => o.id === data.ownerId)

    const payload = {
      ...data,
      leadName: lead?.name ?? '',
      ownerName: owner?.name ?? '',
      workspaceId: 'ws-1',
      dueDate: data.dueDate || undefined,
    }

    if (isEditing && deal) {
      updateDeal(deal.id, payload)
    } else {
      addDeal(payload)
    }
    onClose()
  }

  const stageValue = watch('stage')
  const ownerValue = watch('ownerId')
  const leadValue = watch('leadId')

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Negócio' : 'Novo Negócio'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="deal-title" className="text-slate-300">
              Título <span className="text-red-400">*</span>
            </Label>
            <Input
              id="deal-title"
              placeholder="Ex: Plano Pro — ACME Corp"
              className={inputCls}
              {...register('title')}
            />
            {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
          </div>

          {/* Valor + Prazo (2 colunas) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="deal-value" className="text-slate-300">
                Valor (R$) <span className="text-red-400">*</span>
              </Label>
              <Input
                id="deal-value"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                className={inputCls}
                {...register('value', { valueAsNumber: true })}
              />
              {errors.value && <p className="text-xs text-red-400">{errors.value.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deal-dueDate" className="text-slate-300">
                Prazo
              </Label>
              <Input id="deal-dueDate" type="date" className={inputCls} {...register('dueDate')} />
            </div>
          </div>

          {/* Lead */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">
              Lead vinculado <span className="text-red-400">*</span>
            </Label>
            <Select value={leadValue} onValueChange={(v) => setValue('leadId', v)}>
              <SelectTrigger className={selectCls}>
                <SelectValue placeholder="Selecionar lead" />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-800 text-slate-100">
                {mockLeads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name}
                    {lead.company ? ` — ${lead.company}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leadId && <p className="text-xs text-red-400">{errors.leadId.message}</p>}
          </div>

          {/* Etapa + Responsável (2 colunas) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300">
                Etapa <span className="text-red-400">*</span>
              </Label>
              <Select value={stageValue} onValueChange={(v) => setValue('stage', v as DealStage)}>
                <SelectTrigger className={selectCls}>
                  <SelectValue placeholder="Selecionar etapa" />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-800 text-slate-100">
                  {PIPELINE_COLUMNS.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.stage && <p className="text-xs text-red-400">{errors.stage.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">
                Responsável <span className="text-red-400">*</span>
              </Label>
              <Select value={ownerValue} onValueChange={(v) => setValue('ownerId', v)}>
                <SelectTrigger className={selectCls}>
                  <SelectValue placeholder="Selecionar responsável" />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-800 text-slate-100">
                  {mockOwners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ownerId && <p className="text-xs text-red-400">{errors.ownerId.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-300 hover:text-white"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? 'Salvar alterações' : 'Criar negócio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
