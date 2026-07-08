import { useMemo } from 'react'
import { useDealsStore } from '@/store/useDealsStore'
import { useLeadsStore } from '@/store/useLeadsStore'
import type { DashboardMetrics, FunnelData } from '@/types/dashboard'
import { PIPELINE_COLUMNS } from '@/types/deal'

const CLOSED_STAGES = new Set(['won', 'lost'])
const OPEN_STAGES = new Set(['new_lead', 'contacted', 'proposal', 'negotiation'])

export function useDashboardMetrics(): {
  metrics: DashboardMetrics
  funnelData: FunnelData[]
  upcomingDeals: ReturnType<typeof useDealsStore.getState>['deals']
  recentLeads: ReturnType<typeof useLeadsStore.getState>['leads']
} {
  const deals = useDealsStore((s) => s.deals)
  const leads = useLeadsStore((s) => s.leads)

  return useMemo(() => {
    const openDeals = deals.filter((d) => OPEN_STAGES.has(d.stage))
    const wonDeals = deals.filter((d) => d.stage === 'won')
    const totalDeals = deals.filter((d) => CLOSED_STAGES.has(d.stage) || OPEN_STAGES.has(d.stage))

    const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0)
    const conversionRate = totalDeals.length > 0 ? (wonDeals.length / totalDeals.length) * 100 : 0

    const funnelData: FunnelData[] = PIPELINE_COLUMNS.map((col) => {
      const colDeals = deals.filter((d) => d.stage === col.id)
      return {
        stage: col.id,
        label: col.label,
        count: colDeals.length,
        value: colDeals.reduce((sum, d) => sum + d.value, 0),
        color: col.accentColor,
      }
    })

    const _today = new Date()
    const upcomingDeals = deals
      .filter(
        (d): d is typeof d & { dueDate: string } => OPEN_STAGES.has(d.stage) && d.dueDate != null
      )
      .sort((a, b) => {
        const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        // Deals already past due come first (most urgent)
        return diff
      })
      .slice(0, 5)

    const recentLeads = [...leads]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    return {
      metrics: {
        totalLeads: leads.length,
        openDeals: openDeals.length,
        pipelineValue,
        conversionRate,
      },
      funnelData,
      upcomingDeals,
      recentLeads,
    }
  }, [deals, leads])
}
