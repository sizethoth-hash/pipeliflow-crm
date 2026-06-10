'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createActivity, deleteActivity, getActivitiesByLead } from '@/services/leads'
import type { Activity } from '@/types/lead'

export function activitiesKey(leadId: string) {
  return ['activities', leadId] as const
}

export function useActivities(leadId: string) {
  return useQuery({
    queryKey: activitiesKey(leadId),
    queryFn: () => getActivitiesByLead(leadId),
    enabled: Boolean(leadId),
  })
}

export function useCreateActivity() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      leadId,
      type,
      description,
    }: {
      leadId: string
      type: Activity['type']
      description: string
    }) => createActivity({ leadId, type, description }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: activitiesKey(vars.leadId) })
    },
  })
}

export function useDeleteActivity() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; leadId: string }) => deleteActivity(id),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: activitiesKey(vars.leadId) })
    },
  })
}
