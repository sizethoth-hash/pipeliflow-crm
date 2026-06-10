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
import { useCreateDeal, useUpdateDeal } from '@/hooks/useDeals'
import { useLeads } from '@/hooks/useLeads'
import { useAuthStore } from '@/store/useAuthStore'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
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
  const createDeal = useCreateDeal()
  const updateDeal = useUpdateDeal()
  const userId = useAuthStore((s) => s.user?.id ?? '')
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')
  const { data: leadsData } = useLeads(undefined, 1)
  const leads = leadsData?.leads ?? []
  const isEditing = Boolean(deal)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      stage: defaultStage,
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
          stage: deal.stage,
          dueDate: deal.dueDate ?? '',
        })
      } else {
        reset({ stage: defaultStage, value: 0 })
      }
    }
  }, [open, deal, defaultStage, reset])

  async function onSubmit(data: DealFormData) {
    if (isEditing && deal) {
      await updateDeal.mutateAsync({
        id: deal.id,
        data: {
          title: data.title,
          value: data.value,
          lead_id: data.leadId,
          stage: data.stage,
          due_date: data.dueDate || null,
        },
      })
    } else {
      await createDeal.mutateAsync({
        workspace_id: workspaceId,
        title: data.title,
        value: data.value,
        lead_id: data.leadId,
        stage: data.stage,
        due_date: data.dueDate || null,
        owner_id: userId,
      })
    }
    onClose()
  }

  const stageValue = watch('stage')
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

          {/* Valor + Prazo */}
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
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name}
                    {lead.company ? ` — ${lead.company}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leadId && <p className="text-xs text-red-400">{errors.leadId.message}</p>}
          </div>

          {/* Etapa */}
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

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-300 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createDeal.isPending || updateDeal.isPending}
            >
              {isEditing ? 'Salvar alterações' : 'Criar negócio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
