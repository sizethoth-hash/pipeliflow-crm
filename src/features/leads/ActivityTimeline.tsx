import { Mail, MessageSquare, Phone, Video } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
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

function formatRelativeDate(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)

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
    new Date(iso)
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

interface ActivityItemProps {
  activity: Activity
  isLast: boolean
}

function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const config = ACTIVITY_CONFIG[activity.type]
  const Icon = config.icon

  return (
    <div className="relative flex gap-4">
      {/* Linha vertical da timeline */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-700" aria-hidden="true" />
      )}

      {/* Ícone */}
      <div
        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 ${config.bg}`}
      >
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 pb-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className={`text-xs font-semibold uppercase tracking-wide ${config.color}`}>
            {config.label}
          </span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs text-slate-500">{formatRelativeDate(activity.createdAt)}</span>
          <span className="text-xs text-slate-600">{formatTime(activity.createdAt)}</span>
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
  activities: Activity[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-700 py-12 text-center">
        <MessageSquare className="h-8 w-8 text-slate-600" />
        <p className="mt-3 text-sm text-slate-500">Nenhuma atividade registrada</p>
        <p className="mt-1 text-xs text-slate-600">
          Formulário de registro disponível no módulo Atividades (M6)
        </p>
      </div>
    )
  }

  return (
    <div>
      {activities.map((activity, index) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          isLast={index === activities.length - 1}
        />
      ))}
    </div>
  )
}
