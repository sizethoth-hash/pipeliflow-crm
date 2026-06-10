'use server'

import { getServerClient } from '@/lib/supabase/server'
import type { Lead, LeadFilters, Activity } from '@/types/lead'
import type { LeadInsert, LeadUpdate } from '@/types/supabase'

const PAGE_SIZE = 10

// Resolve workspace_id e user_id a partir da sessão — nunca depende do cliente
async function getSessionContext(): Promise<{ workspaceId: string; userId: string }> {
  const supabase = await getServerClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) throw new Error('Não autenticado')

  const { data: member, error: memberErr } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (memberErr || !member) throw new Error('Nenhum workspace encontrado')
  return { workspaceId: member.workspace_id, userId: user.id }
}

function rowToLead(row: {
  id: string
  workspace_id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  job_title: string | null
  status: Lead['status']
  potential_value: number | null
  notes: string | null
  owner_id: string
  created_at: string
  updated_at: string
}): Lead {
  return {
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
  }
}

export interface GetLeadsParams {
  workspaceId: string
  filters?: Partial<LeadFilters>
  page?: number
  pageSize?: number
}

export interface GetLeadsResult {
  leads: Lead[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getLeads({
  workspaceId,
  filters,
  page = 1,
  pageSize = PAGE_SIZE,
}: GetLeadsParams): Promise<GetLeadsResult> {
  const supabase = await getServerClient()

  let query = supabase
    .from('leads')
    .select(
      'id, workspace_id, name, email, phone, company, job_title, status, potential_value, notes, owner_id, created_at, updated_at',
      { count: 'exact' },
    )
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (filters?.search) {
    const term = `%${filters.search}%`
    query = query.or(`name.ilike.${term},email.ilike.${term},company.ilike.${term}`)
  }
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  if (filters?.ownerId && filters.ownerId !== 'all') {
    query = query.eq('owner_id', filters.ownerId)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw new Error(error.message)

  const total = count ?? 0
  return {
    leads: (data ?? []).map(rowToLead),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getLead(id: string): Promise<Lead | null> {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('leads')
    .select('id, workspace_id, name, email, phone, company, job_title, status, potential_value, notes, owner_id, created_at, updated_at')
    .eq('id', id)
    .single()

  if (error) return null
  return rowToLead(data)
}

export async function createLead(payload: Omit<LeadInsert, 'workspace_id' | 'owner_id'>): Promise<Lead> {
  const supabase = await getServerClient()
  const { workspaceId, userId } = await getSessionContext()

  const { data, error } = await supabase
    .from('leads')
    .insert({ ...payload, workspace_id: workspaceId, owner_id: userId })
    .select('id, workspace_id, name, email, phone, company, job_title, status, potential_value, notes, owner_id, created_at, updated_at')
    .single()

  if (error) throw new Error(error.message)
  return rowToLead(data)
}

export async function updateLead(id: string, payload: LeadUpdate): Promise<Lead> {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', id)
    .select('id, workspace_id, name, email, phone, company, job_title, status, potential_value, notes, owner_id, created_at, updated_at')
    .single()

  if (error) throw new Error(error.message)
  return rowToLead(data)
}

export async function deleteLead(id: string): Promise<void> {
  const supabase = await getServerClient()
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

function rowToActivity(row: {
  id: string
  lead_id: string
  workspace_id: string
  type: Activity['type']
  description: string
  author_id: string
  created_at: string
}): Activity {
  return {
    id: row.id,
    leadId: row.lead_id,
    workspaceId: row.workspace_id,
    type: row.type,
    description: row.description,
    authorId: row.author_id,
    authorName: '',
    createdAt: row.created_at,
  }
}

export async function getActivitiesByLead(leadId: string): Promise<Activity[]> {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('activities')
    .select('id, workspace_id, lead_id, type, description, author_id, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToActivity)
}

export async function createActivity(payload: {
  leadId: string
  type: Activity['type']
  description: string
}): Promise<Activity> {
  const supabase = await getServerClient()
  const { workspaceId, userId } = await getSessionContext()

  const { data, error } = await supabase
    .from('activities')
    .insert({
      workspace_id: workspaceId,
      lead_id: payload.leadId,
      type: payload.type,
      description: payload.description,
      author_id: userId,
    })
    .select('id, workspace_id, lead_id, type, description, author_id, created_at')
    .single()

  if (error) throw new Error(error.message)
  return rowToActivity(data)
}

export async function deleteActivity(id: string): Promise<void> {
  const supabase = await getServerClient()
  const { error } = await supabase.from('activities').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
