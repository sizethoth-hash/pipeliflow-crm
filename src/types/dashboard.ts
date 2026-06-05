export interface DashboardMetrics {
  totalLeads: number
  openDeals: number
  pipelineValue: number
  conversionRate: number
}

export interface FunnelData {
  stage: string
  label: string
  count: number
  value: number
  color: string
}
