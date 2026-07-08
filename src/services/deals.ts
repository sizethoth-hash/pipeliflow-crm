'use server'

import { getServerClient } from '@/lib/supabase/server'
import type { Deal, DealStage } from '@/types/deal'
import type { DealInsert, DealUpdate } from '@/types/supabase'

async function getSessionContext(): Promise<{ workspaceId: string; userId: string }> {
  const supabase = await getServerClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
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

const DEAL_COLS =
  'id, workspace_id, lead_id, title, value, stage, owner_id, due_date, created_at, updated_at'

function rowToDeal(row: {
  id: string
  workspace_id: string
  lead_id: string | null
  title: string
  value: number
  stage: DealStage
  owner_id: string
  due_date: string | null
  created_at: string
  updated_at: string
}): Deal {
  return {
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
  }
}

export async function getDeals(workspaceId: string): Promise<Deal[]> {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('deals')
    .select(DEAL_COLS)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToDeal)
}

export async function getDeal(id: string): Promise<Deal | null> {
  const supabase = await getServerClient()
  const { data, error } = await supabase.from('deals').select(DEAL_COLS).eq('id', id).single()

  if (error) return null
  return rowToDeal(data)
}

export async function createDeal(
  payload: Omit<DealInsert, 'workspace_id' | 'owner_id'>
): Promise<Deal> {
  const supabase = await getServerClient()
  const { workspaceId, userId } = await getSessionContext()

  const { data, error } = await supabase
    .from('deals')
    .insert({ ...payload, workspace_id: workspaceId, owner_id: userId })
    .select(DEAL_COLS)
    .single()

  if (error) throw new Error(error.message)
  return rowToDeal(data)
}

export async function updateDeal(
  id: string,
  payload: DealUpdate & { leadName?: string; ownerName?: string }
): Promise<Deal> {
  const supabase = await getServerClient()
  const { leadName: _l, ownerName: _o, ...update } = payload
  const { data, error } = await supabase
    .from('deals')
    .update(update)
    .eq('id', id)
    .select(DEAL_COLS)
    .single()

  if (error) throw new Error(error.message)
  return rowToDeal(data)
}

export async function deleteDeal(id: string): Promise<void> {
  const supabase = await getServerClient()
  const { error } = await supabase.from('deals').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function moveDeal(id: string, stage: DealStage): Promise<Deal> {
  return updateDeal(id, { stage })
}
