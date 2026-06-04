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
import { mockOwners } from '@/mocks/leads'
import { useLeadsStore } from '@/store/useLeadsStore'
import type { Lead } from '@/types/lead'

const leadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  status: z.enum(['new', 'contacted', 'proposal', 'negotiation', 'won', 'lost']),
  ownerId: z.string().min(1, 'Selecione um responsável'),
})

type LeadFormData = z.infer<typeof leadSchema>

interface LeadFormModalProps {
  open: boolean
  onClose: () => void
  lead?: Lead | null
}

export function LeadFormModal({ open, onClose, lead }: LeadFormModalProps) {
  const { addLead, updateLead } = useLeadsStore()
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
    defaultValues: {
      status: 'new',
      ownerId: 'user-1',
    },
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
          status: lead.status,
          ownerId: lead.ownerId,
        })
      } else {
        reset({ status: 'new', ownerId: 'user-1' })
      }
    }
  }, [open, lead, reset])

  function onSubmit(data: LeadFormData) {
    const owner = mockOwners.find((o) => o.id === data.ownerId)
    const ownerName = owner?.name ?? ''

    if (isEditing && lead) {
      updateLead(lead.id, { ...data, ownerName })
    } else {
      addLead({
        ...data,
        ownerName,
        workspaceId: 'ws-1',
      })
    }
    onClose()
  }

  const statusValue = watch('status')
  const ownerValue = watch('ownerId')

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input id="name" placeholder="Ex: Maria Silva" {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* E-mail */}
          <div className="space-y-1.5">
            <Label htmlFor="email">
              E-mail <span className="text-red-500">*</span>
            </Label>
            <Input id="email" type="email" placeholder="maria@empresa.com" {...register('email')} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Telefone + Empresa (2 colunas) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="(11) 99999-9999" {...register('phone')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Empresa</Label>
              <Input id="company" placeholder="Ex: ACME Corp" {...register('company')} />
            </div>
          </div>

          {/* Cargo */}
          <div className="space-y-1.5">
            <Label htmlFor="jobTitle">Cargo</Label>
            <Input id="jobTitle" placeholder="Ex: Gerente Comercial" {...register('jobTitle')} />
          </div>

          {/* Status + Responsável (2 colunas) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={statusValue}
                onValueChange={(v) => setValue('status', v as LeadFormData['status'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Novo Lead</SelectItem>
                  <SelectItem value="contacted">Contato Realizado</SelectItem>
                  <SelectItem value="proposal">Proposta Enviada</SelectItem>
                  <SelectItem value="negotiation">Negociação</SelectItem>
                  <SelectItem value="won">Fechado Ganho</SelectItem>
                  <SelectItem value="lost">Fechado Perdido</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>
                Responsável <span className="text-red-500">*</span>
              </Label>
              <Select value={ownerValue} onValueChange={(v) => setValue('ownerId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar responsável" />
                </SelectTrigger>
                <SelectContent>
                  {mockOwners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ownerId && <p className="text-xs text-red-500">{errors.ownerId.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? 'Salvar alterações' : 'Criar lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
