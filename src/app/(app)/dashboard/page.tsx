'use client'

import { Users, Briefcase, DollarSign, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { MetricCard } from '@/features/dashboard/MetricCard'
import { SalesFunnelChart } from '@/features/dashboard/SalesFunnelChart'
import { UpcomingDeals } from '@/features/dashboard/UpcomingDeals'
import { RecentLeads } from '@/features/dashboard/RecentLeads'

function compactBRL(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { metrics, funnelData, upcomingDeals, recentLeads } = useDashboardMetrics()

  const fullName = user?.user_metadata?.full_name ?? user?.email ?? 'Usuário'
  const firstName = fullName.split(' ')[0]

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-400 text-sm">Bem-vindo de volta, {firstName} 👋</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-100">Dashboard</h2>
      </div>

      {/* KPI Cards */}
      <section aria-label="Métricas principais">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total de Leads"
            value={String(metrics.totalLeads)}
            icon={Users}
            iconColor="text-indigo-400"
            trend={12.5}
            trendLabel="vs. mês anterior"
          />
          <MetricCard
            label="Negócios Abertos"
            value={String(metrics.openDeals)}
            icon={Briefcase}
            iconColor="text-blue-400"
            trend={8.3}
            trendLabel="vs. mês anterior"
          />
          <MetricCard
            label="Valor do Pipeline"
            value={compactBRL(metrics.pipelineValue)}
            icon={DollarSign}
            iconColor="text-emerald-400"
            trend={21.4}
            trendLabel="vs. mês anterior"
          />
          <MetricCard
            label="Taxa de Conversão"
            value={`${metrics.conversionRate.toFixed(1)}%`}
            icon={TrendingUp}
            iconColor="text-amber-400"
            trend={-3.2}
            trendLabel="vs. mês anterior"
          />
        </div>
      </section>

      {/* Funil + Negócios próximos */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesFunnelChart data={funnelData} />
        <UpcomingDeals deals={upcomingDeals} />
      </div>

      {/* Leads recentes */}
      <div className="mt-6">
        <RecentLeads leads={recentLeads} />
      </div>
    </div>
  )
}
