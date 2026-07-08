'use server'

import { getServerClient } from '@/lib/supabase/server'
import type { DashboardMetrics, FunnelData } from '@/types/dashboard'
import type { Deal } from '@/types/deal'
import { PIPELINE_COLUMNS } from '@/types/deal'
import type { Lead } from '@/types/lead'

const OPEN_STAGES = ['new_lead', 'contacted', 'proposal', 'negotiation'] as const

export interface DashboardData {
  metrics: DashboardMetrics
  funnelData: FunnelData[]
  upcomingDeals: Deal[]
  recentLeads: Lead[]
}

export async function getDashboardData(workspaceId: string): Promise<DashboardData> {
  const supabase = await getServerClient()

  const [leadsRes, dealsRes] = await Promise.all([
    supabase
      .from('leads')
      .select(
        'id, workspace_id, name, email, phone, company, job_title, status, potential_value, notes, owner_id, created_at, updated_at'
      )
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false }),
    supabase
      .from('deals')
      .select(
        'id, workspace_id, lead_id, title, value, stage, owner_id, due_date, created_at, updated_at'
      )
      .eq('workspace_id', workspaceId),
  ])

  if (leadsRes.error) throw new Error(leadsRes.error.message)
  if (dealsRes.error) throw new Error(dealsRes.error.message)

  const leads: Lead[] = (leadsRes.data ?? []).map((row) => ({
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    company: row.company ?? undefined,
    jobTitle: row.job_title ?? undefined,
    status: row.status,
    potentialValue: row.potential_value ?? undefined,
    notes: row.notes ?? undefined,
    ownerId: row.owner_id,
    ownerName: '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

  const deals: Deal[] = (dealsRes.data ?? []).map((row) => ({
    id: row.id,
    workspaceId: row.workspace_id,
    leadId: row.lead_id ?? '',
    leadName: '',
    title: row.title,
    value: row.value,
    stage: row.stage,
    ownerId: row.owner_id,
    ownerName: '',
    dueDate: row.due_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

  const openDeals = deals.filter((d) => (OPEN_STAGES as readonly string[]).includes(d.stage))
  const wonDeals = deals.filter((d) => d.stage === 'won')
  const closedDeals = deals.filter((d) => d.stage === 'won' || d.stage === 'lost')
  const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0)
  const conversionRate = closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0

  const funnelData: FunnelData[] = PIPELINE_COLUMNS.map((col) => {
    const colDeals = deals.filter((d) => d.stage === col.id)
    return {
      stage: col.id,
      label: col.label,
      count: colDeals.length,
      value: colDeals.reduce((sum, d) => sum + d.value, 0),
      color: col.accentColor,
    }
  })

  const upcomingDeals = openDeals
    .filter((d): d is typeof d & { dueDate: string } => d.dueDate != null)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const recentLeads = leads.slice(0, 5)

  return {
    metrics: {
      totalLeads: leads.length,
      openDeals: openDeals.length,
      pipelineValue,
      conversionRate,
    },
    funnelData,
    upcomingDeals,
    recentLeads,
  }
}
