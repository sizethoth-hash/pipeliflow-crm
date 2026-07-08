'use client'

import { ArrowLeft, Building2, Calendar, Loader2, Mail, Pencil, Phone, User } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ActivityTimeline } from '@/features/leads/ActivityTimeline'
import { LeadFormModal } from '@/features/leads/LeadFormModal'
import { LeadStatusBadge } from '@/features/leads/LeadStatusBadge'
import { useActivities } from '@/hooks/useActivities'
import { useLead } from '@/hooks/useLeads'

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const rawId = params?.id
  const id = typeof rawId === 'string' ? rawId : (rawId?.[0] ?? '')

  const { data: lead, isLoading: leadLoading } = useLead(id)
  const { data: activities = [], isLoading: activitiesLoading } = useActivities(id)

  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    if (!leadLoading && !lead) router.replace('/leads')
  }, [lead, leadLoading, router])

  if (leadLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    )
  }

  if (!lead) return null

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard" className="transition-colors hover:text-slate-300">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/leads" className="transition-colors hover:text-slate-300">
          Leads
        </Link>
        <span>/</span>
        <span className="text-slate-300">{lead.name}</span>
      </nav>

      {/* Volta */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-1 text-slate-400 hover:text-white"
        asChild
      >
        <Link href="/leads">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Leads
        </Link>
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna esquerda — perfil */}
        <div className="space-y-5 lg:col-span-1">
          <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-base font-semibold">
                    {getInitials(lead.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-lg font-bold text-slate-100">{lead.name}</h1>
                  {lead.jobTitle && <p className="text-sm text-slate-400">{lead.jobTitle}</p>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white"
                onClick={() => setEditOpen(true)}
                aria-label="Editar lead"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>

            <LeadStatusBadge status={lead.status} className="mb-5" />

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                <a
                  href={`mailto:${lead.email}`}
                  className="truncate transition-colors hover:text-indigo-400"
                >
                  {lead.email}
                </a>
              </div>

              {lead.phone && (
                <div className="flex items-center gap-3 text-slate-300">
                  <Phone className="h-4 w-4 shrink-0 text-slate-500" />
                  <a href={`tel:${lead.phone}`} className="transition-colors hover:text-indigo-400">
                    {lead.phone}
                  </a>
                </div>
              )}

              {lead.company && (
                <div className="flex items-center gap-3 text-slate-300">
                  <Building2 className="h-4 w-4 shrink-0 text-slate-500" />
                  <span>{lead.company}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-slate-300">
                <User className="h-4 w-4 shrink-0 text-slate-500" />
                <span>{lead.ownerName || '—'}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
                <span>Criado em {formatDate(lead.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Negócios vinculados (placeholder) */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-300">Negócios</h2>
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-700 py-8 text-center">
              <p className="text-xs text-slate-500">Nenhum negócio vinculado</p>
            </div>
          </div>
        </div>

        {/* Coluna direita — timeline */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-6">
            <h2 className="mb-5 text-sm font-semibold text-slate-300">
              Histórico de Atividades
              {activities.length > 0 && (
                <span className="ml-2 rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
                  {activities.length}
                </span>
              )}
            </h2>
            <ActivityTimeline leadId={id} activities={activities} isLoading={activitiesLoading} />
          </div>
        </div>
      </div>

      <LeadFormModal open={editOpen} onClose={() => setEditOpen(false)} lead={lead} />
    </div>
  )
}
