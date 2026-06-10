'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import {
  createLead,
  deleteLead,
  getLead,
  getLeads,
  updateLead,
} from '@/services/leads'
import type { LeadFilters } from '@/types/lead'
import type { LeadInsert, LeadUpdate } from '@/types/supabase'

export function leadsKey(workspaceId: string, filters?: Partial<LeadFilters>, page?: number) {
  return ['leads', workspaceId, filters ?? {}, page ?? 1] as const
}

export function leadKey(id: string) {
  return ['lead', id] as const
}

export function useLeads(filters?: Partial<LeadFilters>, page = 1) {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useQuery({
    queryKey: leadsKey(workspaceId, filters, page),
    queryFn: () => getLeads({ workspaceId, filters, page }),
    enabled: Boolean(workspaceId),
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKey(id),
    queryFn: () => getLead(id),
    enabled: Boolean(id),
  })
}

export function useCreateLead() {
  const qc = useQueryClient()
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useMutation({
    mutationFn: (payload: LeadInsert) => createLead(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads', workspaceId] })
    },
  })
}

export function useUpdateLead() {
  const qc = useQueryClient()
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LeadUpdate }) => updateLead(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['leads', workspaceId] })
      qc.setQueryData(leadKey(updated.id), updated)
    },
  })
}

export function useDeleteLead() {
  const qc = useQueryClient()
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: (_r, id) => {
      qc.invalidateQueries({ queryKey: ['leads', workspaceId] })
      qc.removeQueries({ queryKey: leadKey(id) })
    },
  })
}
