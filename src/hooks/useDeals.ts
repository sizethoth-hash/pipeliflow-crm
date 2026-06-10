'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { createDeal, deleteDeal, getDeals, moveDeal, updateDeal } from '@/services/deals'
import type { Deal, DealStage } from '@/types/deal'
import type { DealInsert, DealUpdate } from '@/types/supabase'

export function dealsKey(workspaceId: string) {
  return ['deals', workspaceId] as const
}

export function useDeals() {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useQuery({
    queryKey: dealsKey(workspaceId),
    queryFn: () => getDeals(workspaceId),
    enabled: Boolean(workspaceId),
  })
}

export function useCreateDeal() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<DealInsert, 'workspace_id' | 'owner_id'> & { leadName?: string; ownerName?: string }) =>
      createDeal(payload),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: dealsKey(created.workspaceId) })
    },
  })
}

export function useUpdateDeal() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: DealUpdate & { leadName?: string; ownerName?: string }
    }) => updateDeal(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: dealsKey(updated.workspaceId) })
    },
  })
}

export function useDeleteDeal() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDeal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] })
    },
  })
}

export function useMoveDeal() {
  const qc = useQueryClient()
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: DealStage }) => moveDeal(id, stage),

    // Optimistic update — drag-and-drop parece instantâneo
    onMutate: async ({ id, stage }) => {
      const key = dealsKey(workspaceId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<Deal[]>(key)

      qc.setQueryData<Deal[]>(key, (old) =>
        (old ?? []).map((d) => (d.id === id ? { ...d, stage } : d)),
      )

      return { prev, workspaceId }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(dealsKey(ctx.workspaceId), ctx.prev)
    },

    onSettled: (_data, _err, _vars, ctx) => {
      // Invalida pelo workspaceId que estava ativo no momento do drag
      qc.invalidateQueries({ queryKey: dealsKey(ctx?.workspaceId ?? workspaceId) })
    },
  })
}
