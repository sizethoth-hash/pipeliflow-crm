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
import { useCreateLead, useUpdateLead } from '@/hooks/useLeads'
import type { Lead } from '@/types/lead'

const inputCls =
  'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500'
const selectCls = 'border-slate-600 bg-slate-700 text-slate-100 focus:ring-indigo-500'

const leadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  potentialValue: z
    .union([
      z.number().min(0, 'Valor deve ser positivo'),
      z.nan().transform(() => undefined as unknown as number),
    ])
    .optional(),
  notes: z.string().optional(),
  status: z.enum(['new', 'contacted', 'proposal', 'negotiation', 'won', 'lost']),
})

type LeadFormData = z.infer<typeof leadSchema>

interface LeadFormModalProps {
  open: boolean
  onClose: () => void
  lead?: Lead | null
}

export function LeadFormModal({ open, onClose, lead }: LeadFormModalProps) {
  const createLead = useCreateLead()
  const updateLead = useUpdateLead()
  const isEditing = Boolean(lead)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: { status: 'new' },
  })

  useEffect(() => {
    if (open) {
      if (lead) {
        reset({
          name: lead.name,
          email: lead.email,
          phone: lead.phone ?? '',
          company: lead.company ?? '',
          jobTitle: lead.jobTitle ?? '',
          potentialValue: lead.potentialValue,
          notes: lead.notes ?? '',
          status: lead.status,
        })
      } else {
        reset({ status: 'new' })
      }
    }
  }, [open, lead, reset])

  async function onSubmit(data: LeadFormData) {
    try {
      if (isEditing && lead) {
        await updateLead.mutateAsync({
          id: lead.id,
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            company: data.company || null,
            job_title: data.jobTitle || null,
            potential_value: data.potentialValue ?? null,
            notes: data.notes || null,
            status: data.status,
          },
        })
      } else {
        await createLead.mutateAsync({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          company: data.company || null,
          job_title: data.jobTitle || null,
          potential_value: data.potentialValue ?? null,
          notes: data.notes || null,
          status: data.status,
        })
      }
      onClose()
    } catch {
      // Erro já capturado pelo mutation.error — não fechar o modal
    }
  }

  const statusValue = watch('status')

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-slate-300">
              Nome <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Maria Silva"
              className={inputCls}
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          {/* E-mail */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-300">
              E-mail <span className="text-red-400">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="maria@empresa.com"
              className={inputCls}
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          {/* Telefone + Empresa */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-slate-300">
                Telefone
              </Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                className={inputCls}
                {...register('phone')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company" className="text-slate-300">
                Empresa
              </Label>
              <Input
                id="company"
                placeholder="Ex: ACME Corp"
                className={inputCls}
                {...register('company')}
              />
            </div>
          </div>

          {/* Cargo + Valor potencial */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="jobTitle" className="text-slate-300">
                Cargo
              </Label>
              <Input
                id="jobTitle"
                placeholder="Ex: Gerente Comercial"
                className={inputCls}
                {...register('jobTitle')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="potentialValue" className="text-slate-300">
                Valor potencial (R$)
              </Label>
              <Input
                id="potentialValue"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                className={inputCls}
                {...register('potentialValue', { valueAsNumber: true })}
              />
              {errors.potentialValue && (
                <p className="text-xs text-red-400">{errors.potentialValue.message}</p>
              )}
            </div>
          </div>

          {/* Anotações */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-slate-300">
              Anotações
            </Label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Observações internas sobre este lead…"
              className={`flex w-full resize-none rounded-md border px-3 py-2 text-sm leading-relaxed ${inputCls} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-800`}
              {...register('notes')}
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">
              Status <span className="text-red-400">*</span>
            </Label>
            <Select
              value={statusValue}
              onValueChange={(v) => setValue('status', v as LeadFormData['status'])}
            >
              <SelectTrigger className={selectCls}>
                <SelectValue placeholder="Selecionar status" />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-800 text-slate-100">
                <SelectItem value="new">Novo Lead</SelectItem>
                <SelectItem value="contacted">Contato Realizado</SelectItem>
                <SelectItem value="proposal">Proposta Enviada</SelectItem>
                <SelectItem value="negotiation">Negociação</SelectItem>
                <SelectItem value="won">Fechado Ganho</SelectItem>
                <SelectItem value="lost">Fechado Perdido</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-xs text-red-400">{errors.status.message}</p>}
          </div>

          <DialogFooter className="pt-2">
            {(createLead.error || updateLead.error) && (
              <p className="w-full text-xs text-red-400">
                {(createLead.error ?? updateLead.error)?.message ?? 'Erro ao salvar lead.'}
              </p>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-300 hover:text-white"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || createLead.isPending || updateLead.isPending}>
              {isEditing ? 'Salvar alterações' : 'Criar lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
