'use client'

import { Loader2, Mail, MessageSquare, Phone, Trash2, Video } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useCreateActivity, useDeleteActivity } from '@/hooks/useActivities'
import type { Activity, ActivityType } from '@/types/lead'

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string; bg: string }
> = {
  call: { icon: Phone, label: 'Ligação', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  email: { icon: Mail, label: 'E-mail', color: 'text-sky-400', bg: 'bg-sky-500/10' },
  meeting: { icon: Video, label: 'Reunião', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  note: { icon: MessageSquare, label: 'Nota', color: 'text-amber-400', bg: 'bg-amber-500/10' },
}

const activitySchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'note']),
  description: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres'),
})
type ActivityFormData = z.infer<typeof activitySchema>

function formatRelativeDate(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000)
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `Há ${diffDays} dias`
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: diffDays > 365 ? 'numeric' : undefined,
  }).format(date)
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function ActivityItem({
  activity,
  isLast,
  leadId,
}: {
  activity: Activity
  isLast: boolean
  leadId: string
}) {
  const config = ACTIVITY_CONFIG[activity.type]
  const Icon = config.icon
  const deleteActivity = useDeleteActivity()

  return (
    <div className="relative flex gap-4 group">
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-700" aria-hidden="true" />
      )}
      <div
        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 ${config.bg}`}
      >
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>
      <div className="flex-1 pb-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className={`text-xs font-semibold uppercase tracking-wide ${config.color}`}>
            {config.label}
          </span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs text-slate-500">{formatRelativeDate(activity.createdAt)}</span>
          <span className="text-xs text-slate-600">{formatTime(activity.createdAt)}</span>
          <button
            type="button"
            onClick={() => deleteActivity.mutate({ id: activity.id, leadId })}
            aria-label="Excluir atividade"
            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{activity.description}</p>
        <div className="mt-2 flex items-center gap-1.5">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[9px]">{getInitials(activity.authorName)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-slate-500">{activity.authorName}</span>
        </div>
      </div>
    </div>
  )
}

interface ActivityTimelineProps {
  leadId: string
  activities: Activity[]
  isLoading?: boolean
}

export function ActivityTimeline({ leadId, activities, isLoading }: ActivityTimelineProps) {
  const createActivity = useCreateActivity()
  const [formOpen, setFormOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: { type: 'note' },
  })

  const typeValue = watch('type')

  async function onSubmit(data: ActivityFormData) {
    await createActivity.mutateAsync({ leadId, type: data.type, description: data.description })
    reset({ type: 'note' })
    setFormOpen(false)
  }

  return (
    <div>
      {/* Formulário inline de nova atividade */}
      {formOpen ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6 rounded-lg border border-slate-700 bg-slate-800/60 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Select value={typeValue} onValueChange={(v) => setValue('type', v as ActivityType)}>
              <SelectTrigger className="w-40 border-slate-600 bg-slate-700 text-slate-100 focus:ring-indigo-500 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-800 text-slate-100">
                <SelectItem value="call">Ligação</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="meeting">Reunião</SelectItem>
                <SelectItem value="note">Nota</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-slate-500">Registrar nova atividade</span>
          </div>

          <textarea
            rows={3}
            placeholder="Descreva a atividade…"
            className="flex w-full resize-none rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-red-400">{errors.description.message}</p>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { reset({ type: 'note' }); setFormOpen(false) }}
              className="text-slate-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={createActivity.isPending}>
              {createActivity.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                'Registrar'
              )}
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="mb-5 w-full border-dashed border-slate-700 text-slate-500 hover:text-slate-300"
          onClick={() => setFormOpen(true)}
        >
          + Registrar atividade
        </Button>
      )}

      {/* Lista de atividades */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-700 py-12 text-center">
          <MessageSquare className="h-8 w-8 text-slate-600" />
          <p className="mt-3 text-sm text-slate-500">Nenhuma atividade registrada</p>
          <p className="mt-1 text-xs text-slate-600">Clique em "Registrar atividade" para começar</p>
        </div>
      ) : (
        <div>
          {activities.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              isLast={index === activities.length - 1}
              leadId={leadId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
