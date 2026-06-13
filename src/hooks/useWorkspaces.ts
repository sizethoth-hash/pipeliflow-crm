'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createWorkspace,
  deleteWorkspace,
  getMemberCount,
  getWorkspaceInvites,
  getWorkspaceMembers,
  removeMember,
  revokeInvite,
  updateMemberRole,
  updateWorkspaceName,
} from '@/services/workspaces'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import type { MemberRole } from '@/types/supabase'

export const workspaceMembersKey = (id: string) => ['workspace-members', id] as const
export const workspaceInvitesKey = (id: string) => ['workspace-invites', id] as const
export const memberCountKey = (id: string) => ['workspace-member-count', id] as const

// ── Members ─────────────────────────────────────────────────

export function useWorkspaceMembers() {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useQuery({
    queryKey: workspaceMembersKey(workspaceId),
    queryFn: () => getWorkspaceMembers(workspaceId),
    enabled: Boolean(workspaceId),
  })
}

export function useMemberCount() {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useQuery({
    queryKey: memberCountKey(workspaceId),
    queryFn: () => getMemberCount(workspaceId),
    enabled: Boolean(workspaceId),
  })
}

export function useUpdateMemberRole() {
  const qc = useQueryClient()
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: MemberRole }) =>
      updateMemberRole(workspaceId, userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workspaceMembersKey(workspaceId) })
    },
  })
}

export function useRemoveMember() {
  const qc = useQueryClient()
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useMutation({
    mutationFn: (userId: string) => removeMember(workspaceId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workspaceMembersKey(workspaceId) })
      qc.invalidateQueries({ queryKey: memberCountKey(workspaceId) })
    },
  })
}

// ── Invites ─────────────────────────────────────────────────

export function useWorkspaceInvites() {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useQuery({
    queryKey: workspaceInvitesKey(workspaceId),
    queryFn: () => getWorkspaceInvites(workspaceId),
    enabled: Boolean(workspaceId),
  })
}

export function useRevokeInvite() {
  const qc = useQueryClient()
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useMutation({
    mutationFn: (inviteId: string) => revokeInvite(inviteId, workspaceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workspaceInvitesKey(workspaceId) })
    },
  })
}

// ── Workspace CRUD ───────────────────────────────────────────

export function useCreateWorkspace() {
  const qc = useQueryClient()
  const { loadWorkspaces } = useWorkspaceStore()

  return useMutation({
    mutationFn: (name: string) => createWorkspace(name),
    onSuccess: () => {
      loadWorkspaces()
      qc.invalidateQueries({ queryKey: ['workspaces'] })
    },
  })
}

export function useUpdateWorkspaceName() {
  const qc = useQueryClient()
  const { activeWorkspace, loadWorkspaces } = useWorkspaceStore()

  return useMutation({
    mutationFn: (name: string) => {
      if (!activeWorkspace?.id) throw new Error('Nenhum workspace ativo')
      return updateWorkspaceName(activeWorkspace.id, name)
    },
    onSuccess: () => {
      loadWorkspaces()
      qc.invalidateQueries({ queryKey: ['workspaces'] })
    },
  })
}

export function useDeleteWorkspace() {
  const { activeWorkspace, loadWorkspaces } = useWorkspaceStore()

  return useMutation({
    mutationFn: () => {
      if (!activeWorkspace?.id) throw new Error('Nenhum workspace ativo')
      return deleteWorkspace(activeWorkspace.id)
    },
    onSuccess: () => {
      loadWorkspaces()
    },
  })
}
