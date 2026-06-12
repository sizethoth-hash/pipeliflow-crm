'use server'

import { getServerClient } from '@/lib/supabase/server'
import type { MemberRole, WorkspaceInviteRow, WorkspaceMemberRow } from '@/types/supabase'
import type { Workspace, WorkspaceMember } from '@/types/workspace'

// ── Workspaces ──────────────────────────────────────────────

export async function getWorkspaces(): Promise<Workspace[]> {
  const supabase = await getServerClient()

  const { data: members, error: memberError } = await supabase
    .from('workspace_members')
    .select('workspace_id')

  if (memberError || !members?.length) return []

  const ids = members.map((m) => m.workspace_id)

  const { data, error } = await supabase
    .from('workspaces')
    .select('id, name, plan')
    .in('id', ids)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((r) => ({ id: r.id, name: r.name, plan: r.plan }))
}

export async function createWorkspace(name: string): Promise<Workspace> {
  const supabase = await getServerClient()

  const { data, error } = await supabase.rpc('create_workspace_with_admin', { p_name: name })

  if (error) throw new Error(error.message)

  return data as Workspace
}

export async function updateWorkspaceName(workspaceId: string, name: string): Promise<void> {
  const supabase = await getServerClient()

  const { error } = await supabase
    .from('workspaces')
    .update({ name })
    .eq('id', workspaceId)

  if (error) throw new Error(error.message)
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  const supabase = await getServerClient()

  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId)

  if (error) throw new Error(error.message)
}

// ── Members ─────────────────────────────────────────────────

export interface MemberWithProfile extends WorkspaceMemberRow {
  name: string
  email: string
}

export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const supabase = await getServerClient()

  const { data, error } = await supabase
    .from('workspace_members')
    .select('user_id, role, created_at')
    .eq('workspace_id', workspaceId)

  if (error) throw new Error(error.message)

  if (!data?.length) return []

  // Busca perfis via auth.users com service role
  const userIds = data.map((m) => m.user_id)

  const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError) throw new Error(usersError.message)

  const userMap = new Map(
    (users.users ?? [])
      .filter((u) => userIds.includes(u.id))
      .map((u) => [u.id, u])
  )

  return data.map((m) => {
    const user = userMap.get(m.user_id)
    return {
      id: m.user_id,
      name: (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? 'Usuário',
      email: user?.email ?? '',
      role: m.role,
    }
  })
}

export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: MemberRole,
): Promise<void> {
  const supabase = await getServerClient()

  const { error } = await supabase
    .from('workspace_members')
    .update({ role })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function removeMember(workspaceId: string, userId: string): Promise<void> {
  const supabase = await getServerClient()

  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function getMemberCount(workspaceId: string): Promise<number> {
  const supabase = await getServerClient()

  const { data, error } = await supabase.rpc('get_workspace_member_count', {
    p_workspace_id: workspaceId,
  })

  if (error) throw new Error(error.message)
  return data as number
}

// ── Invites ─────────────────────────────────────────────────

export async function getWorkspaceInvites(workspaceId: string): Promise<WorkspaceInviteRow[]> {
  const supabase = await getServerClient()

  const { data, error } = await supabase
    .from('workspace_invites')
    .select('*')
    .eq('workspace_id', workspaceId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function revokeInvite(inviteId: string): Promise<void> {
  const supabase = await getServerClient()

  const { error } = await supabase
    .from('workspace_invites')
    .delete()
    .eq('id', inviteId)

  if (error) throw new Error(error.message)
}

export type InviteWithWorkspace = WorkspaceInviteRow & { workspaces: { name: string } }

export async function getInviteByToken(token: string): Promise<InviteWithWorkspace | null> {
  const supabase = await getServerClient()

  const { data, error } = await supabase
    .from('workspace_invites')
    .select('id, workspace_id, email, role, token, invited_by, accepted_at, expires_at, created_at, workspaces(name)')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) return null

  return {
    ...data,
    workspaces: (data.workspaces as unknown as { name: string }),
  } as InviteWithWorkspace
}

export async function acceptInvite(token: string): Promise<{ workspace_id: string; role: MemberRole }> {
  const supabase = await getServerClient()

  const { data, error } = await supabase.rpc('accept_workspace_invite', { p_token: token })

  if (error) {
    if (error.message.includes('free_plan_member_limit')) {
      throw new Error('Este workspace atingiu o limite de 2 membros do plano Free.')
    }
    if (error.message.includes('invite_invalid_or_expired')) {
      throw new Error('Convite inválido ou expirado.')
    }
    throw new Error(error.message)
  }

  return data as { workspace_id: string; role: MemberRole }
}
