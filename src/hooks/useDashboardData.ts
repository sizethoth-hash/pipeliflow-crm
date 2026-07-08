'use client'

import { useQuery } from '@tanstack/react-query'
import { getDashboardData } from '@/services/metrics'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'

export function dashboardKey(workspaceId: string) {
  return ['dashboard', workspaceId] as const
}

export function useDashboardData() {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id ?? '')

  return useQuery({
    queryKey: dashboardKey(workspaceId),
    queryFn: () => getDashboardData(workspaceId),
    enabled: Boolean(workspaceId),
  })
}
