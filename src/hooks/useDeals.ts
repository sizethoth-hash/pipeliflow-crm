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
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useMutation({
    mutationFn: (payload: DealInsert & { leadName?: string; ownerName?: string }) =>
      createDeal(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dealsKey(workspaceId) })
    },
  })
}

export function useUpdateDeal() {
  const qc = useQueryClient()
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: DealUpdate & { leadName?: string; ownerName?: string }
    }) => updateDeal(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dealsKey(workspaceId) })
    },
  })
}

export function useDeleteDeal() {
  const qc = useQueryClient()
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useMutation({
    mutationFn: (id: string) => deleteDeal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dealsKey(workspaceId) })
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
      await qc.cancelQueries({ queryKey: dealsKey(workspaceId) })
      const prev = qc.getQueryData<Deal[]>(dealsKey(workspaceId))

      qc.setQueryData<Deal[]>(dealsKey(workspaceId), (old) =>
        (old ?? []).map((d) => (d.id === id ? { ...d, stage } : d)),
      )

      return { prev }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(dealsKey(workspaceId), ctx.prev)
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: dealsKey(workspaceId) })
    },
  })
}
