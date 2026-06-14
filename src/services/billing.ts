'use server'

import { getServerClient } from '@/lib/supabase/server'
import type { SubscriptionRow } from '@/types/supabase'

export async function getSubscription(): Promise<SubscriptionRow | null> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!member) return null

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('workspace_id', member.workspace_id)
    .single()

  return data ?? null
}

export async function createCheckoutSession(workspaceId: string, userId: string): Promise<string> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId, userId }),
  })
  if (!res.ok) throw new Error('Erro ao criar sessão de checkout')
  const { url } = await res.json()
  return url as string
}

export async function createPortalSession(workspaceId: string): Promise<string> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/portal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId }),
  })
  if (!res.ok) throw new Error('Erro ao criar sessão do portal')
  const { url } = await res.json()
  return url as string
}
